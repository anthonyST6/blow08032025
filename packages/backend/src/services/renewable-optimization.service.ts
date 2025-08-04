import { logger } from '../utils/logger';
import { BaseService } from './base.service';
import { serviceRegistry } from '../orchestration/service-registry';

export interface RenewableEnergyData {
  siteId: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  timestamp: Date;
  sources: {
    solar: {
      capacity: number; // MW
      currentOutput: number; // MW
      efficiency: number; // percentage
      irradiance: number; // W/m²
    };
    wind: {
      capacity: number; // MW
      currentOutput: number; // MW
      windSpeed: number; // m/s
      turbineEfficiency: number; // percentage
    };
    battery: {
      capacity: number; // MWh
      currentCharge: number; // MWh
      chargeRate: number; // MW
      dischargeRate: number; // MW
    };
  };
  demand: {
    current: number; // MW
    predicted: number[]; // MW for next 24 hours
  };
  gridConnection: {
    maxExport: number; // MW
    maxImport: number; // MW
    currentFlow: number; // MW (positive = export, negative = import)
    pricePerMWh: number; // $/MWh
  };
}

export interface OptimizationResult {
  timestamp: Date;
  recommendations: {
    solar: {
      action: 'maintain' | 'curtail' | 'maximize';
      targetOutput: number; // MW
      reason: string;
    };
    wind: {
      action: 'maintain' | 'curtail' | 'maximize';
      targetOutput: number; // MW
      reason: string;
    };
    battery: {
      action: 'charge' | 'discharge' | 'hold';
      rate: number; // MW
      duration: number; // hours
      reason: string;
    };
    grid: {
      action: 'export' | 'import' | 'island';
      amount: number; // MW
      revenue: number; // $/hour
      reason: string;
    };
  };
  metrics: {
    renewableUtilization: number; // percentage
    selfSufficiency: number; // percentage
    carbonOffset: number; // tons CO2/hour
    economicBenefit: number; // $/hour
  };
  forecast: {
    nextHour: {
      expectedGeneration: number; // MW
      expectedDemand: number; // MW
      batteryStateOfCharge: number; // percentage
    };
  };
}

export interface EnergyForecast {
  siteId: string;
  timestamp: Date;
  horizon: number; // hours
  predictions: Array<{
    hour: number;
    solar: {
      generation: number; // MW
      confidence: number; // percentage
    };
    wind: {
      generation: number; // MW
      confidence: number; // percentage
    };
    demand: {
      load: number; // MW
      confidence: number; // percentage
    };
    price: {
      gridPrice: number; // $/MWh
      confidence: number; // percentage
    };
  }>;
  recommendations: string[];
}

class RenewableOptimizationService extends BaseService {
  private optimizationHistory: Map<string, OptimizationResult[]> = new Map();
  private weatherData: Map<string, any> = new Map();
  private priceForecasts: Map<string, number[]> = new Map();

  constructor() {
    super('RenewableOptimizationService');
    this.initializeService();
  }

  private initializeService(): void {
    // Initialize with sample weather patterns
    this.weatherData.set('default', {
      solarIrradiance: [0, 0, 0, 0, 0, 100, 300, 500, 700, 850, 950, 1000, 1000, 950, 850, 700, 500, 300, 100, 0, 0, 0, 0, 0],
      windSpeed: [8, 7, 7, 6, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 12, 11, 10, 9, 8, 8, 7, 7, 8, 8]
    });

    // Initialize with sample price data ($/MWh)
    this.priceForecasts.set('default', [
      45, 42, 40, 38, 40, 45, 55, 65, 70, 68, 65, 60, 58, 60, 62, 65, 70, 75, 72, 68, 60, 55, 50, 48
    ]);

    logger.info('Renewable Optimization Service initialized');
  }

  /**
   * Optimize renewable energy generation and storage
   */
  async optimizeRenewableGeneration(data: RenewableEnergyData): Promise<OptimizationResult> {
    try {
      const currentHour = new Date().getHours();
      const weatherPattern = this.weatherData.get('default');
      const pricePattern = this.priceForecasts.get('default') || [];

      // Calculate optimal solar operation
      const solarRecommendation = this.optimizeSolarGeneration(
        data.sources.solar,
        weatherPattern.solarIrradiance[currentHour],
        data.demand.current
      );

      // Calculate optimal wind operation
      const windRecommendation = this.optimizeWindGeneration(
        data.sources.wind,
        weatherPattern.windSpeed[currentHour],
        data.demand.current
      );

      // Calculate total renewable generation
      const totalRenewableGeneration = solarRecommendation.targetOutput + windRecommendation.targetOutput;

      // Optimize battery operation
      const batteryRecommendation = this.optimizeBatteryOperation(
        data.sources.battery,
        totalRenewableGeneration,
        data.demand.current,
        pricePattern[currentHour]
      );

      // Optimize grid interaction
      const gridRecommendation = this.optimizeGridInteraction(
        totalRenewableGeneration,
        data.demand.current,
        batteryRecommendation,
        data.gridConnection,
        pricePattern[currentHour]
      );

      // Calculate metrics
      const metrics = this.calculateOptimizationMetrics(
        data,
        totalRenewableGeneration,
        gridRecommendation
      );

      // Generate forecast
      const forecast = this.generateShortTermForecast(
        data,
        weatherPattern,
        currentHour
      );

      const result: OptimizationResult = {
        timestamp: new Date(),
        recommendations: {
          solar: solarRecommendation,
          wind: windRecommendation,
          battery: batteryRecommendation,
          grid: gridRecommendation
        },
        metrics,
        forecast
      };

      // Store in history
      const history = this.optimizationHistory.get(data.siteId) || [];
      history.push(result);
      if (history.length > 100) history.shift();
      this.optimizationHistory.set(data.siteId, history);

      logger.info('Renewable generation optimized', {
        siteId: data.siteId,
        renewableUtilization: metrics.renewableUtilization,
        economicBenefit: metrics.economicBenefit
      });

      return result;

    } catch (error) {
      this.handleError(error, 'optimizeRenewableGeneration');
      throw error;
    }
  }

  /**
   * Generate energy forecast
   */
  async generateEnergyForecast(siteId: string, horizon: number = 24): Promise<EnergyForecast> {
    try {
      const currentHour = new Date().getHours();
      const weatherPattern = this.weatherData.get('default');
      const pricePattern = this.priceForecasts.get('default') || [];

      const predictions: EnergyForecast['predictions'] = [];

      for (let i = 0; i < horizon; i++) {
        const hour = (currentHour + i) % 24;
        
        // Solar generation forecast
        const solarGeneration = this.forecastSolarGeneration(
          weatherPattern.solarIrradiance[hour],
          1000 // Assume 1GW solar capacity for forecast
        );

        // Wind generation forecast
        const windGeneration = this.forecastWindGeneration(
          weatherPattern.windSpeed[hour],
          500 // Assume 500MW wind capacity for forecast
        );

        // Demand forecast (simplified pattern)
        const demandLoad = this.forecastDemand(hour);

        predictions.push({
          hour: i,
          solar: {
            generation: solarGeneration,
            confidence: 85 - (i * 0.5) // Confidence decreases with time
          },
          wind: {
            generation: windGeneration,
            confidence: 80 - (i * 0.5)
          },
          demand: {
            load: demandLoad,
            confidence: 90 - (i * 0.3)
          },
          price: {
            gridPrice: pricePattern[hour],
            confidence: 75 - (i * 0.7)
          }
        });
      }

      // Generate recommendations based on forecast
      const recommendations = this.generateForecastRecommendations(predictions);

      const forecast: EnergyForecast = {
        siteId,
        timestamp: new Date(),
        horizon,
        predictions,
        recommendations
      };

      logger.info('Energy forecast generated', {
        siteId,
        horizon,
        recommendationCount: recommendations.length
      });

      return forecast;

    } catch (error) {
      this.handleError(error, 'generateEnergyForecast');
      throw error;
    }
  }

  /**
   * Analyze renewable energy performance
   */
  async analyzeRenewablePerformance(siteId: string): Promise<{
    period: string;
    performance: {
      averageUtilization: number;
      peakGeneration: number;
      totalEnergyGenerated: number; // MWh
      carbonOffsetTotal: number; // tons CO2
      economicValueGenerated: number; // $
    };
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const history = this.optimizationHistory.get(siteId) || [];
      
      if (history.length === 0) {
        return {
          period: 'No data available',
          performance: {
            averageUtilization: 0,
            peakGeneration: 0,
            totalEnergyGenerated: 0,
            carbonOffsetTotal: 0,
            economicValueGenerated: 0
          },
          insights: ['No historical data available for analysis'],
          recommendations: ['Begin collecting operational data for performance analysis']
        };
      }

      // Calculate performance metrics
      let totalUtilization = 0;
      let peakGeneration = 0;
      let totalEnergy = 0;
      let totalCarbonOffset = 0;
      let totalEconomicValue = 0;

      history.forEach(result => {
        totalUtilization += result.metrics.renewableUtilization;
        const generation = result.recommendations.solar.targetOutput + result.recommendations.wind.targetOutput;
        peakGeneration = Math.max(peakGeneration, generation);
        totalEnergy += generation / 60; // Convert MW to MWh (assuming minute intervals)
        totalCarbonOffset += result.metrics.carbonOffset;
        totalEconomicValue += result.metrics.economicBenefit;
      });

      const performance = {
        averageUtilization: totalUtilization / history.length,
        peakGeneration,
        totalEnergyGenerated: totalEnergy,
        carbonOffsetTotal: totalCarbonOffset,
        economicValueGenerated: totalEconomicValue
      };

      // Generate insights
      const insights = this.generatePerformanceInsights(performance, history);

      // Generate recommendations
      const recommendations = this.generatePerformanceRecommendations(performance, insights);

      const result = {
        period: `Last ${history.length} optimization cycles`,
        performance,
        insights,
        recommendations
      };

      logger.info('Renewable performance analyzed', {
        siteId,
        averageUtilization: performance.averageUtilization,
        totalEnergy: performance.totalEnergyGenerated
      });

      return result;

    } catch (error) {
      this.handleError(error, 'analyzeRenewablePerformance');
      throw error;
    }
  }

  /**
   * Optimize solar generation
   */
  private optimizeSolarGeneration(
    solar: RenewableEnergyData['sources']['solar'],
    currentIrradiance: number,
    demand: number
  ): OptimizationResult['recommendations']['solar'] {
    const theoreticalOutput = (solar.capacity * currentIrradiance / 1000) * (solar.efficiency / 100);
    
    let action: 'maintain' | 'curtail' | 'maximize' = 'maintain';
    let targetOutput = Math.min(theoreticalOutput, solar.capacity);
    let reason = 'Operating at optimal efficiency';

    // Check if curtailment is needed
    if (theoreticalOutput > demand * 0.4) { // Solar shouldn't exceed 40% of demand for stability
      action = 'curtail';
      targetOutput = demand * 0.4;
      reason = 'Curtailing to maintain grid stability';
    } else if (solar.currentOutput < theoreticalOutput * 0.9) {
      action = 'maximize';
      reason = 'Increasing output to capture available solar energy';
    }

    return { action, targetOutput, reason };
  }

  /**
   * Optimize wind generation
   */
  private optimizeWindGeneration(
    wind: RenewableEnergyData['sources']['wind'],
    windSpeed: number,
    demand: number
  ): OptimizationResult['recommendations']['wind'] {
    // Simple wind power calculation (cubic relationship with wind speed)
    const optimalSpeed = 12; // m/s
    const cutInSpeed = 3; // m/s
    const cutOutSpeed = 25; // m/s

    let theoreticalOutput = 0;
    if (windSpeed >= cutInSpeed && windSpeed <= cutOutSpeed) {
      if (windSpeed <= optimalSpeed) {
        theoreticalOutput = wind.capacity * Math.pow(windSpeed / optimalSpeed, 3);
      } else {
        theoreticalOutput = wind.capacity; // Rated power above optimal speed
      }
    }

    theoreticalOutput *= (wind.turbineEfficiency / 100);

    let action: 'maintain' | 'curtail' | 'maximize' = 'maintain';
    let targetOutput = Math.min(theoreticalOutput, wind.capacity);
    let reason = 'Operating at optimal efficiency';

    if (theoreticalOutput > demand * 0.5) { // Wind shouldn't exceed 50% of demand
      action = 'curtail';
      targetOutput = demand * 0.5;
      reason = 'Curtailing to maintain grid stability';
    } else if (wind.currentOutput < theoreticalOutput * 0.9) {
      action = 'maximize';
      reason = 'Increasing output to capture available wind energy';
    }

    return { action, targetOutput, reason };
  }

  /**
   * Optimize battery operation
   */
  private optimizeBatteryOperation(
    battery: RenewableEnergyData['sources']['battery'],
    renewableGeneration: number,
    demand: number,
    gridPrice: number
  ): OptimizationResult['recommendations']['battery'] {
    const netGeneration = renewableGeneration - demand;
    const batterySOC = (battery.currentCharge / battery.capacity) * 100;

    let action: 'charge' | 'discharge' | 'hold' = 'hold';
    let rate = 0;
    let duration = 1;
    let reason = 'Maintaining current state';

    if (netGeneration > 0 && batterySOC < 90) {
      // Excess generation - charge battery
      action = 'charge';
      rate = Math.min(netGeneration, battery.chargeRate);
      duration = Math.min((battery.capacity - battery.currentCharge) / rate, 4);
      reason = 'Storing excess renewable generation';
    } else if (netGeneration < 0 && batterySOC > 20) {
      // Generation deficit - discharge battery
      action = 'discharge';
      rate = Math.min(Math.abs(netGeneration), battery.dischargeRate);
      duration = Math.min(battery.currentCharge / rate, 4);
      reason = 'Supporting grid with stored energy';
    } else if (gridPrice > 60 && batterySOC > 50) {
      // High grid prices - discharge for profit
      action = 'discharge';
      rate = battery.dischargeRate * 0.5;
      duration = 2;
      reason = 'Capitalizing on high grid prices';
    } else if (gridPrice < 40 && batterySOC < 70) {
      // Low grid prices - charge from grid
      action = 'charge';
      rate = battery.chargeRate * 0.5;
      duration = 2;
      reason = 'Charging during low price period';
    }

    return { action, rate, duration, reason };
  }

  /**
   * Optimize grid interaction
   */
  private optimizeGridInteraction(
    renewableGeneration: number,
    demand: number,
    batteryRecommendation: OptimizationResult['recommendations']['battery'],
    gridConnection: RenewableEnergyData['gridConnection'],
    gridPrice: number
  ): OptimizationResult['recommendations']['grid'] {
    let netPower = renewableGeneration - demand;

    // Adjust for battery operation
    if (batteryRecommendation.action === 'charge') {
      netPower -= batteryRecommendation.rate;
    } else if (batteryRecommendation.action === 'discharge') {
      netPower += batteryRecommendation.rate;
    }

    let action: 'export' | 'import' | 'island' = 'island';
    let amount = 0;
    let revenue = 0;
    let reason = 'Operating in island mode';

    if (netPower > 0.1) {
      // Excess power - export to grid
      action = 'export';
      amount = Math.min(netPower, gridConnection.maxExport);
      revenue = amount * gridPrice;
      reason = `Exporting excess power at $${gridPrice}/MWh`;
    } else if (netPower < -0.1) {
      // Power deficit - import from grid
      action = 'import';
      amount = Math.min(Math.abs(netPower), gridConnection.maxImport);
      revenue = -amount * gridPrice; // Negative revenue (cost)
      reason = `Importing required power at $${gridPrice}/MWh`;
    }

    return { action, amount, revenue, reason };
  }

  /**
   * Calculate optimization metrics
   */
  private calculateOptimizationMetrics(
    data: RenewableEnergyData,
    totalRenewableGeneration: number,
    gridRecommendation: OptimizationResult['recommendations']['grid']
  ): OptimizationResult['metrics'] {
    const totalCapacity = data.sources.solar.capacity + data.sources.wind.capacity;
    const renewableUtilization = totalCapacity > 0 ? (totalRenewableGeneration / totalCapacity) * 100 : 0;

    const selfSufficiency = data.demand.current > 0 
      ? Math.min(100, (totalRenewableGeneration / data.demand.current) * 100)
      : 100;

    // Carbon offset calculation (0.5 tons CO2/MWh for displaced grid power)
    const carbonOffset = totalRenewableGeneration * 0.5;

    // Economic benefit includes grid revenue and avoided costs
    const economicBenefit = gridRecommendation.revenue + 
      (gridRecommendation.action === 'island' ? data.demand.current * data.gridConnection.pricePerMWh : 0);

    return {
      renewableUtilization,
      selfSufficiency,
      carbonOffset,
      economicBenefit
    };
  }

  /**
   * Generate short-term forecast
   */
  private generateShortTermForecast(
    data: RenewableEnergyData,
    weatherPattern: any,
    currentHour: number
  ): OptimizationResult['forecast'] {
    const nextHour = (currentHour + 1) % 24;
    
    // Forecast solar generation
    const nextSolarGeneration = (data.sources.solar.capacity * weatherPattern.solarIrradiance[nextHour] / 1000) * 
      (data.sources.solar.efficiency / 100);

    // Forecast wind generation
    const nextWindGeneration = this.forecastWindGeneration(
      weatherPattern.windSpeed[nextHour],
      data.sources.wind.capacity
    );

    // Total expected generation
    const expectedGeneration = nextSolarGeneration + nextWindGeneration;

    // Expected demand (use predicted if available)
    const expectedDemand = data.demand.predicted[0] || data.demand.current;

    // Battery state projection
    let projectedSOC = (data.sources.battery.currentCharge / data.sources.battery.capacity) * 100;
    const netFlow = expectedGeneration - expectedDemand;
    if (netFlow > 0) {
      projectedSOC += (netFlow / data.sources.battery.capacity) * 100;
    } else {
      projectedSOC -= (Math.abs(netFlow) / data.sources.battery.capacity) * 100;
    }
    projectedSOC = Math.max(0, Math.min(100, projectedSOC));

    return {
      nextHour: {
        expectedGeneration,
        expectedDemand,
        batteryStateOfCharge: projectedSOC
      }
    };
  }

  /**
   * Forecast solar generation
   */
  private forecastSolarGeneration(irradiance: number, capacity: number): number {
    // Simplified solar generation model
    const efficiency = 0.85; // 85% system efficiency
    return (capacity * irradiance / 1000) * efficiency;
  }

  /**
   * Forecast wind generation
   */
  private forecastWindGeneration(windSpeed: number, capacity: number): number {
    const optimalSpeed = 12;
    const cutInSpeed = 3;
    const cutOutSpeed = 25;
    const efficiency = 0.9; // 90% system efficiency

    if (windSpeed < cutInSpeed || windSpeed > cutOutSpeed) {
      return 0;
    }

    if (windSpeed <= optimalSpeed) {
      return capacity * Math.pow(windSpeed / optimalSpeed, 3) * efficiency;
    }

    return capacity * efficiency;
  }

  /**
   * Forecast demand
   */
  private forecastDemand(hour: number): number {
    // Simplified demand pattern (MW)
    const demandPattern = [
      300, 280, 270, 265, 270, 290, 350, 420, 480, 500, 510, 515,
      520, 515, 510, 505, 510, 530, 540, 520, 480, 420, 360, 320
    ];
    return demandPattern[hour];
  }

  /**
   * Generate forecast recommendations
   */
  private generateForecastRecommendations(predictions: EnergyForecast['predictions']): string[] {
    const recommendations: string[] = [];

    // Find peak generation hours
    const peakSolarHour = predictions.reduce((max, p, i) => 
      p.solar.generation > predictions[max].solar.generation ? i : max, 0);
    
    const peakWindHour = predictions.reduce((max, p, i) => 
      p.wind.generation > predictions[max].wind.generation ? i : max, 0);

    recommendations.push(`Peak solar generation expected in ${peakSolarHour} hours - prepare battery storage`);
    recommendations.push(`Peak wind generation expected in ${peakWindHour} hours - consider curtailment planning`);

    // Find high price periods
    const highPriceHours = predictions
      .map((p, i) => ({ hour: i, price: p.price.gridPrice }))
      .filter(p => p.price > 65)
      .map(p => p.hour);

    if (highPriceHours.length > 0) {
      recommendations.push(`High grid prices expected in hours: ${highPriceHours.join(', ')} - maximize battery discharge`);
    }

    // Check for generation deficits
    const deficitHours = predictions
      .map((p, i) => ({ hour: i, deficit: p.demand.load - p.solar.generation - p.wind.generation }))
      .filter(p => p.deficit > 50)
      .map(p => p.hour);

    if (deficitHours.length > 0) {
      recommendations.push(`Generation deficit expected in hours: ${deficitHours.join(', ')} - ensure battery reserves`);
    }

    return recommendations;
  }

  /**
   * Generate performance insights
   */
  private generatePerformanceInsights(
    performance: any,
    history: OptimizationResult[]
  ): string[] {
    const insights: string[] = [];

    if (performance.averageUtilization > 80) {
      insights.push('Excellent renewable resource utilization achieved');
    } else if (performance.averageUtilization < 60) {
      insights.push('Renewable resource utilization below optimal levels');
    }

    // Analyze battery usage patterns
    const batteryActions = history.map(h => h.recommendations.battery.action);
    const chargePercent = (batteryActions.filter(a => a === 'charge').length / batteryActions.length) * 100;
    
    if (chargePercent > 60) {
      insights.push('Battery primarily used for storing excess generation');
    } else if (chargePercent < 40) {
      insights.push('Battery primarily used for grid support');
    }

    // Economic insights
    const avgRevenue = performance.economicValueGenerated / history.length;
    if (avgRevenue > 100) {
      insights.push('Strong economic performance from grid interactions');
    }

    return insights;
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(
    performance: any,
    insights: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (performance.averageUtilization < 70) {
      recommendations.push('Consider predictive maintenance to improve system availability');
      recommendations.push('Review curtailment strategies to maximize renewable utilization');
    }

    if (performance.peakGeneration < 1000) {
      recommendations.push('Analyze potential for capacity expansion based on resource availability');
    }

    if (insights.some(i => i.includes('below optimal'))) {
      recommendations.push('Implement advanced forecasting to better predict generation patterns');
      recommendations.push('Consider energy storage expansion to capture more renewable energy');
    }

    recommendations.push('Regular cleaning and maintenance of solar panels to maintain efficiency');
    recommendations.push('Monitor wind turbine performance metrics for early fault detection');

    return recommendations;
  }
}

// Create and export service instance
export const renewableOptimizationService = new RenewableOptimizationService();

// Register with service registry
serviceRegistry.registerService('renewable-optimization', renewableOptimizationService);