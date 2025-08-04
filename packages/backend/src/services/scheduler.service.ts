import { firestore } from '../config/firebase';
import { workflowService } from './workflow.service';
import { logger } from '../utils/logger';
import * as cron from 'node-cron';
import * as cronParser from 'cron-parser';

export interface ScheduledJob {
  id: string;
  name: string;
  workflowId: string;
  schedule: string; // Cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobExecution {
  id: string;
  jobId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

export class SchedulerService {
  private get scheduledJobsCollection() {
    return firestore().collection('scheduledJobs');
  }
  
  private get jobExecutionsCollection() {
    return firestore().collection('jobExecutions');
  }
  
  private activeJobs: Map<string, cron.ScheduledTask> = new Map();

  async initialize() {
    // Load all enabled scheduled jobs
    const jobs = await this.getEnabledJobs();
    
    for (const job of jobs) {
      this.scheduleJob(job);
    }

    logger.info(`Scheduler initialized with ${jobs.length} active jobs`);
  }

  async createScheduledJob(
    job: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduledJob> {
    // Validate cron expression
    if (!cron.validate(job.schedule)) {
      throw new Error('Invalid cron expression');
    }

    const now = new Date();
    const docRef = await this.scheduledJobsCollection.add({
      ...job,
      nextRun: this.getNextRunTime(job.schedule),
      createdAt: now,
      updatedAt: now,
    });

    const newJob: ScheduledJob = {
      id: docRef.id,
      ...job,
      nextRun: this.getNextRunTime(job.schedule),
      createdAt: now,
      updatedAt: now,
    };

    if (job.enabled) {
      this.scheduleJob(newJob);
    }

    logger.info(`Scheduled job created: ${newJob.name}`);
    return newJob;
  }

  async updateScheduledJob(
    id: string,
    updates: Partial<ScheduledJob>
  ): Promise<void> {
    const job = await this.getScheduledJob(id);
    if (!job) {
      throw new Error('Scheduled job not found');
    }

    // If schedule is being updated, validate it
    if (updates.schedule && !cron.validate(updates.schedule)) {
      throw new Error('Invalid cron expression');
    }

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.schedule) {
      updatedJob.nextRun = this.getNextRunTime(updates.schedule);
    }

    await this.scheduledJobsCollection.doc(id).update(updatedJob);

    // Reschedule if necessary
    if (this.activeJobs.has(id)) {
      this.unscheduleJob(id);
    }

    if (updatedJob.enabled) {
      this.scheduleJob(updatedJob);
    }

    logger.info(`Scheduled job updated: ${id}`);
  }

  async deleteScheduledJob(id: string): Promise<void> {
    this.unscheduleJob(id);
    await this.scheduledJobsCollection.doc(id).delete();
    logger.info(`Scheduled job deleted: ${id}`);
  }

  async getScheduledJob(id: string): Promise<ScheduledJob | null> {
    const doc = await this.scheduledJobsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as ScheduledJob;
  }

  async getEnabledJobs(): Promise<ScheduledJob[]> {
    const snapshot = await this.scheduledJobsCollection
      .where('enabled', '==', true)
      .get();

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    } as ScheduledJob));
  }

  async getAllJobs(): Promise<ScheduledJob[]> {
    const snapshot = await this.scheduledJobsCollection.get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    } as ScheduledJob));
  }

  private scheduleJob(job: ScheduledJob) {
    if (this.activeJobs.has(job.id)) {
      logger.warn(`Job ${job.id} is already scheduled`);
      return;
    }

    const task = cron.schedule(job.schedule, async () => {
      await this.executeJob(job);
    });

    this.activeJobs.set(job.id, task);
    task.start();

    logger.info(`Job scheduled: ${job.name} (${job.schedule})`);
  }

  private unscheduleJob(jobId: string) {
    const task = this.activeJobs.get(jobId);
    if (task) {
      task.stop();
      this.activeJobs.delete(jobId);
      logger.info(`Job unscheduled: ${jobId}`);
    }
  }

  private async executeJob(job: ScheduledJob) {
    logger.info(`Executing scheduled job: ${job.name}`);

    const execution: Omit<JobExecution, 'id'> = {
      jobId: job.id,
      workflowId: job.workflowId,
      status: 'running',
      startedAt: new Date(),
    };

    const executionRef = await this.jobExecutionsCollection.add(execution);

    try {
      // Execute the workflow
      const result = await workflowService.executeWorkflow(
        job.workflowId,
        job.metadata || {}
      );

      // Update execution status
      await executionRef.update({
        status: 'completed',
        completedAt: new Date(),
        result,
      });

      // Update job's last run time
      await this.scheduledJobsCollection.doc(job.id).update({
        lastRun: new Date(),
        nextRun: this.getNextRunTime(job.schedule),
      });

      logger.info(`Scheduled job completed: ${job.name}`);
    } catch (error) {
      logger.error(`Scheduled job failed: ${job.name}`, error);

      await executionRef.update({
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getJobExecutions(
    jobId?: string,
    limit: number = 50
  ): Promise<JobExecution[]> {
    let query = this.jobExecutionsCollection.orderBy('startedAt', 'desc');

    if (jobId) {
      query = query.where('jobId', '==', jobId);
    }

    const snapshot = await query.limit(limit).get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    } as JobExecution));
  }

  private getNextRunTime(cronExpression: string): Date {
    // Parse cron expression to get next run time
    const interval = cronParser.parseExpression(cronExpression);
    return interval.next().toDate();
  }

  async runJobNow(jobId: string): Promise<void> {
    const job = await this.getScheduledJob(jobId);
    if (!job) {
      throw new Error('Scheduled job not found');
    }

    logger.info(`Manually triggering job: ${job.name}`);
    await this.executeJob(job);
  }

  shutdown() {
    // Stop all scheduled tasks
    for (const [jobId, task] of this.activeJobs) {
      task.stop();
      logger.info(`Stopped scheduled job: ${jobId}`);
    }

    this.activeJobs.clear();
    logger.info('Scheduler service shut down');
  }

  // Utility methods for common schedules
  static createDailySchedule(hour: number, minute: number = 0): string {
    return `${minute} ${hour} * * *`;
  }

  static createWeeklySchedule(
    dayOfWeek: number,
    hour: number,
    minute: number = 0
  ): string {
    return `${minute} ${hour} * * ${dayOfWeek}`;
  }

  static createMonthlySchedule(
    dayOfMonth: number,
    hour: number,
    minute: number = 0
  ): string {
    return `${minute} ${hour} ${dayOfMonth} * *`;
  }

  static createIntervalSchedule(minutes: number): string {
    if (minutes < 60) {
      return `*/${minutes} * * * *`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `0 */${hours} * * *`;
    }
  }
}

export const schedulerService = new SchedulerService();