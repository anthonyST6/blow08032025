import { UseCase } from '../config/verticals';

export interface IngestedDataRow {
  id: string;
  timestamp: string;
  value: number;
  status: 'active' | 'pending' | 'completed' | 'error';
  category: string;
  metrics: {
    accuracy: number;
    confidence: number;
    performance: number;
  };
  confidenceScore: number;
  anomalyScore: number;
}

export const generateIngestedData = (useCase: UseCase): any => {
  const categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  const statuses: Array<'active' | 'pending' | 'completed' | 'error'> = ['active', 'pending', 'completed', 'error'];
  
  // Generate 100 rows of ingested data
  const ingestedRows: IngestedDataRow[] = [];
  const now = new Date();
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now.getTime() - (99 - i) * 60 * 60 * 1000); // Hourly data for last 100 hours
    const baseValue = 50 + Math.sin(i / 10) * 30; // Create a wave pattern
    const noise = (Math.random() - 0.5) * 20; // Add some noise
    
    ingestedRows.push({
      id: `ING-${String(i + 1).padStart(4, '0')}`,
      timestamp: timestamp.toISOString(),
      value: Math.round(baseValue + noise),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      metrics: {
        accuracy: 85 + Math.random() * 15,
        confidence: 80 + Math.random() * 20,
        performance: 75 + Math.random() * 25
      },
      confidenceScore: 70 + Math.random() * 30,
      anomalyScore: Math.random() < 0.1 ? 70 + Math.random() * 30 : Math.random() * 30
    });
  }
  
  // Return the data structure expected by UseCaseRunDashboard
  return {
    ingestedRows,
    metrics: [
      {
        name: 'Total Records',
        value: '100',
        unit: '',
        trend: 'up',
        change: 15
      },
      {
        name: 'Data Quality',
        value: '98.5',
        unit: '%',
        trend: 'up',
        change: 2.3
      },
      {
        name: 'Processing Speed',
        value: '0.8',
        unit: 'ms',
        trend: 'down',
        change: -5.2
      },
      {
        name: 'Anomalies Detected',
        value: '7',
        unit: '',
        trend: 'down',
        change: -12.5
      }
    ],
    siaAnalysisData: {
      security: {
        score: useCase.siaScores?.security || 95,
        details: 'Security analysis based on ingested data patterns'
      },
      integrity: {
        score: useCase.siaScores?.integrity || 92,
        details: 'Data integrity verified across all ingested records'
      },
      accuracy: {
        score: useCase.siaScores?.accuracy || 94,
        details: 'Accuracy metrics calculated from live data processing'
      }
    }
  };
};

export const processFileUpload = async (file: File, useCase: UseCase): Promise<any> => {
  // Simulate file processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // For now, return generated data
      // In a real implementation, this would parse the file
      resolve(generateIngestedData(useCase));
    }, 1000);
  });
};

export const fetchFromAPI = async (endpoint: string, useCase: UseCase): Promise<any> => {
  // Simulate API fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      // For now, return generated data
      // In a real implementation, this would fetch from the endpoint
      resolve(generateIngestedData(useCase));
    }, 1500);
  });
};