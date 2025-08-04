import { logger } from '../utils/logger';
import axios from 'axios';
import { Lease } from './lease.service';

export interface GISBoundary {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface GISFeature {
  type: 'Feature';
  properties: {
    leaseId: string;
    leaseName: string;
    status: string;
    expirationDate: string;
    annualRevenue: number;
    acreage: number;
    riskLevel?: 'high' | 'medium' | 'low';
  };
  geometry: GISBoundary;
}

export interface GISFeatureCollection {
  type: 'FeatureCollection';
  features: GISFeature[];
}

export interface MapboxConfig {
  accessToken: string;
  style: string;
  center: [number, number];
  zoom: number;
}

export interface ArcGISConfig {
  baseUrl: string;
  token?: string;
  featureServiceUrl?: string;
}

export interface SpatialAnalysisResult {
  leaseId: string;
  nearbyLeases: Array<{
    leaseId: string;
    distance: number; // meters
    owner: string;
  }>;
  infrastructureProximity: Array<{
    type: 'well' | 'pipeline' | 'road' | 'facility';
    name: string;
    distance: number;
  }>;
  environmentalZones: Array<{
    type: string;
    name: string;
    overlap: number; // percentage
  }>;
  totalArea: number; // acres
  perimeter: number; // meters
}

export interface RiskHeatmapData {
  bounds: [[number, number], [number, number]]; // SW, NE corners
  resolution: number; // grid size in meters
  data: Array<{
    lat: number;
    lng: number;
    riskScore: number; // 0-100
    factors: {
      expiration: number;
      financial: number;
      compliance: number;
      environmental: number;
    };
  }>;
}

class GISService {
  private mapboxConfig: MapboxConfig;
  private arcgisConfig: ArcGISConfig;

  constructor() {
    this.mapboxConfig = {
      accessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-102.5, 31.75], // Default to Permian Basin
      zoom: 8,
    };

    this.arcgisConfig = {
      baseUrl: process.env.ARCGIS_BASE_URL || 'https://services.arcgis.com',
      token: process.env.ARCGIS_TOKEN,
      featureServiceUrl: process.env.ARCGIS_FEATURE_SERVICE_URL,
    };
  }

  /**
   * Convert lease data to GeoJSON format for map display
   */
  async leasesToGeoJSON(leases: Lease[]): Promise<GISFeatureCollection> {
    const features: GISFeature[] = [];

    for (const lease of leases) {
      if (lease.property.location.boundaries && lease.property.location.boundaries.length > 0) {
        // Convert boundaries to GeoJSON polygon
        const coordinates = lease.property.location.boundaries.map(point => [point.lng, point.lat]);
        
        // Ensure polygon is closed
        if (coordinates.length > 0 && 
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
             coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordinates.push(coordinates[0]);
        }

        const feature: GISFeature = {
          type: 'Feature',
          properties: {
            leaseId: lease.id,
            leaseName: lease.leaseNumber,
            status: lease.status,
            expirationDate: lease.terms.expirationDate.toString(),
            annualRevenue: lease.financial.annualRevenue,
            acreage: lease.property.acreage,
            riskLevel: this.calculateRiskLevel(lease),
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        };

        features.push(feature);
      } else if (lease.property.location.coordinates) {
        // If no boundaries, create a point feature
        logger.warn(`Lease ${lease.id} has no boundaries, creating point feature`);
        
        // Create a small square around the point (approximately 1 acre)
        const center = lease.property.location.coordinates;
        const offset = 0.0001; // Roughly 11 meters at equator
        
        const feature: GISFeature = {
          type: 'Feature',
          properties: {
            leaseId: lease.id,
            leaseName: lease.leaseNumber,
            status: lease.status,
            expirationDate: lease.terms.expirationDate.toString(),
            annualRevenue: lease.financial.annualRevenue,
            acreage: lease.property.acreage,
            riskLevel: this.calculateRiskLevel(lease),
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [center.lng - offset, center.lat - offset],
              [center.lng + offset, center.lat - offset],
              [center.lng + offset, center.lat + offset],
              [center.lng - offset, center.lat + offset],
              [center.lng - offset, center.lat - offset],
            ]],
          },
        };

        features.push(feature);
      }
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Generate risk heatmap data for visualization
   */
  async generateRiskHeatmap(leases: Lease[]): Promise<RiskHeatmapData> {
    // Calculate bounds
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    for (const lease of leases) {
      if (lease.property.location.coordinates) {
        const { lat, lng } = lease.property.location.coordinates;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    }

    // Create grid
    const resolution = 1000; // 1km grid
    const data: RiskHeatmapData['data'] = [];
    
    // Generate grid points
    const latStep = (maxLat - minLat) / 50; // 50 points vertically
    const lngStep = (maxLng - minLng) / 50; // 50 points horizontally

    for (let lat = minLat; lat <= maxLat; lat += latStep) {
      for (let lng = minLng; lng <= maxLng; lng += lngStep) {
        // Calculate risk score based on nearby leases
        const nearbyLeases = leases.filter(lease => {
          if (!lease.property.location.coordinates) return false;
          const distance = this.calculateDistance(
            lat, lng,
            lease.property.location.coordinates.lat,
            lease.property.location.coordinates.lng
          );
          return distance < 10000; // Within 10km
        });

        if (nearbyLeases.length > 0) {
          const riskFactors = this.calculateAreaRisk(nearbyLeases);
          data.push({
            lat,
            lng,
            riskScore: riskFactors.total,
            factors: riskFactors.factors,
          });
        }
      }
    }

    return {
      bounds: [[minLng, minLat], [maxLng, maxLat]],
      resolution,
      data,
    };
  }

  /**
   * Perform spatial analysis for a lease
   */
  async performSpatialAnalysis(lease: Lease, allLeases: Lease[]): Promise<SpatialAnalysisResult> {
    const result: SpatialAnalysisResult = {
      leaseId: lease.id,
      nearbyLeases: [],
      infrastructureProximity: [],
      environmentalZones: [],
      totalArea: lease.property.acreage,
      perimeter: 0,
    };

    // Find nearby leases
    if (lease.property.location.coordinates) {
      const centerLat = lease.property.location.coordinates.lat;
      const centerLng = lease.property.location.coordinates.lng;

      for (const otherLease of allLeases) {
        if (otherLease.id === lease.id || !otherLease.property.location.coordinates) continue;

        const distance = this.calculateDistance(
          centerLat, centerLng,
          otherLease.property.location.coordinates.lat,
          otherLease.property.location.coordinates.lng
        );

        if (distance < 5000) { // Within 5km
          result.nearbyLeases.push({
            leaseId: otherLease.id,
            distance: Math.round(distance),
            owner: otherLease.lessor.name,
          });
        }
      }

      // Sort by distance
      result.nearbyLeases.sort((a, b) => a.distance - b.distance);
    }

    // Calculate perimeter if boundaries exist
    if (lease.property.location.boundaries && lease.property.location.boundaries.length > 2) {
      result.perimeter = this.calculatePerimeter(lease.property.location.boundaries);
    }

    // Mock infrastructure data (in production, query from GIS service)
    result.infrastructureProximity = [
      { type: 'well', name: 'Well-001', distance: 500 },
      { type: 'pipeline', name: 'Permian Express', distance: 1200 },
      { type: 'road', name: 'Highway 285', distance: 800 },
    ];

    // Mock environmental zones (in production, query from environmental database)
    result.environmentalZones = [
      { type: 'protected', name: 'Lesser Prairie Chicken Habitat', overlap: 15 },
      { type: 'water', name: 'Pecos River Buffer Zone', overlap: 5 },
    ];

    return result;
  }

  /**
   * Query ArcGIS for additional lease data
   */
  async queryArcGIS(query: {
    geometry?: any;
    where?: string;
    outFields?: string[];
  }): Promise<any> {
    if (!this.arcgisConfig.featureServiceUrl) {
      logger.warn('ArcGIS feature service URL not configured');
      return null;
    }

    try {
      const params = {
        f: 'json',
        where: query.where || '1=1',
        outFields: query.outFields?.join(',') || '*',
        geometry: query.geometry ? JSON.stringify(query.geometry) : undefined,
        geometryType: query.geometry ? 'esriGeometryPolygon' : undefined,
        spatialRel: 'esriSpatialRelIntersects',
        token: this.arcgisConfig.token,
      };

      const response = await axios.get(`${this.arcgisConfig.featureServiceUrl}/query`, { params });
      return response.data;
    } catch (error) {
      logger.error('ArcGIS query failed', { error, query });
      throw error;
    }
  }

  /**
   * Get Mapbox static map URL for a lease
   */
  getMapboxStaticMapUrl(lease: Lease, options?: {
    width?: number;
    height?: number;
    zoom?: number;
    style?: string;
  }): string {
    if (!lease.property.location.coordinates) {
      return '';
    }

    const width = options?.width || 600;
    const height = options?.height || 400;
    const zoom = options?.zoom || 12;
    const style = options?.style || 'satellite-streets-v12';
    
    const { lat, lng } = lease.property.location.coordinates;
    
    // Create GeoJSON for the lease boundary if available
    let overlay = '';
    if (lease.property.location.boundaries && lease.property.location.boundaries.length > 0) {
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [lease.property.location.boundaries.map(p => [p.lng, p.lat])],
        },
      };
      
      overlay = `/geojson(${encodeURIComponent(JSON.stringify(geojson))})`;
    }

    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static${overlay}/${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${this.mapboxConfig.accessToken}`;
  }

  /**
   * Calculate risk level for a lease
   */
  private calculateRiskLevel(lease: Lease): 'high' | 'medium' | 'low' {
    const now = new Date();
    const expirationDate = new Date(lease.terms.expirationDate);
    const daysToExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Risk factors
    let riskScore = 0;
    
    // Expiration risk
    if (daysToExpiration < 30) riskScore += 40;
    else if (daysToExpiration < 90) riskScore += 20;
    else if (daysToExpiration < 180) riskScore += 10;
    
    // Financial risk
    if (lease.financial.annualRevenue < 100000) riskScore += 20;
    else if (lease.financial.annualRevenue < 500000) riskScore += 10;
    
    // Compliance risk
    if (lease.compliance.issues && lease.compliance.issues.length > 0) {
      riskScore += lease.compliance.issues.length * 10;
    }
    
    // Status risk
    if (lease.status === 'expired') riskScore += 30;
    else if (lease.status === 'expiring_soon') riskScore += 20;
    else if (lease.status === 'under_review') riskScore += 10;
    
    // Determine level
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * Calculate area risk factors
   */
  private calculateAreaRisk(leases: Lease[]): {
    total: number;
    factors: {
      expiration: number;
      financial: number;
      compliance: number;
      environmental: number;
    };
  } {
    const factors = {
      expiration: 0,
      financial: 0,
      compliance: 0,
      environmental: 0,
    };

    for (const lease of leases) {
      const riskLevel = this.calculateRiskLevel(lease);
      const weight = riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1;
      
      // Expiration risk
      const now = new Date();
      const expirationDate = new Date(lease.terms.expirationDate);
      const daysToExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiration < 90) factors.expiration += weight;
      
      // Financial risk
      if (lease.financial.annualRevenue < 500000) factors.financial += weight;
      
      // Compliance risk
      if (lease.compliance.issues && lease.compliance.issues.length > 0) {
        factors.compliance += weight * lease.compliance.issues.length;
      }
      
      // Environmental risk (mock)
      factors.environmental += weight * 0.5;
    }

    // Normalize to 0-100 scale
    const maxPossible = leases.length * 3 * 4; // max weight * factors
    const total = Object.values(factors).reduce((sum, val) => sum + val, 0);
    
    return {
      total: Math.min(100, (total / maxPossible) * 100),
      factors: {
        expiration: Math.min(100, (factors.expiration / (leases.length * 3)) * 100),
        financial: Math.min(100, (factors.financial / (leases.length * 3)) * 100),
        compliance: Math.min(100, (factors.compliance / (leases.length * 3)) * 100),
        environmental: Math.min(100, (factors.environmental / (leases.length * 3)) * 100),
      },
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calculate perimeter of a polygon
   */
  private calculatePerimeter(boundaries: Array<{ lat: number; lng: number }>): number {
    let perimeter = 0;
    
    for (let i = 0; i < boundaries.length; i++) {
      const j = (i + 1) % boundaries.length;
      perimeter += this.calculateDistance(
        boundaries[i].lat, boundaries[i].lng,
        boundaries[j].lat, boundaries[j].lng
      );
    }
    
    return Math.round(perimeter);
  }

  /**
   * Get Mapbox configuration for frontend
   */
  getMapboxConfig(): MapboxConfig {
    return { ...this.mapboxConfig };
  }

  /**
   * Validate GIS data for a lease
   */
  async validateLeaseGISData(lease: Lease): Promise<{
    valid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for coordinates
    if (!lease.property.location.coordinates) {
      issues.push('Missing center coordinates');
      suggestions.push('Add GPS coordinates for the lease center point');
    }

    // Check for boundaries
    if (!lease.property.location.boundaries || lease.property.location.boundaries.length < 3) {
      issues.push('Missing or invalid boundary data');
      suggestions.push('Import boundary data from county records or survey documents');
    } else {
      // Validate boundary closure
      const first = lease.property.location.boundaries[0];
      const last = lease.property.location.boundaries[lease.property.location.boundaries.length - 1];
      if (first.lat !== last.lat || first.lng !== last.lng) {
        issues.push('Boundary polygon is not closed');
        suggestions.push('Ensure the last boundary point matches the first point');
      }

      // Check for self-intersections (simplified check)
      // In production, use a proper geometry library
      if (lease.property.location.boundaries.length > 4) {
        // Basic check - ensure no duplicate points except first/last
        const uniquePoints = new Set(
          lease.property.location.boundaries.slice(0, -1).map(p => `${p.lat},${p.lng}`)
        );
        if (uniquePoints.size < lease.property.location.boundaries.length - 1) {
          issues.push('Boundary contains duplicate points');
          suggestions.push('Remove duplicate boundary points');
        }
      }
    }

    // Validate acreage matches boundary area (with tolerance)
    if (lease.property.location.boundaries && lease.property.location.boundaries.length >= 3) {
      const calculatedArea = this.calculatePolygonArea(lease.property.location.boundaries);
      const declaredArea = lease.property.acreage;
      const difference = Math.abs(calculatedArea - declaredArea) / declaredArea;
      
      if (difference > 0.1) { // More than 10% difference
        issues.push(`Calculated area (${calculatedArea.toFixed(2)} acres) differs significantly from declared area (${declaredArea} acres)`);
        suggestions.push('Verify boundary data and declared acreage');
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions,
    };
  }

  /**
   * Calculate polygon area in acres
   */
  private calculatePolygonArea(boundaries: Array<{ lat: number; lng: number }>): number {
    // Simplified area calculation using shoelace formula
    // In production, use a proper GIS library for accurate calculations
    let area = 0;
    const n = boundaries.length;

    for (let i = 0; i < n - 1; i++) {
      area += boundaries[i].lng * boundaries[i + 1].lat;
      area -= boundaries[i + 1].lng * boundaries[i].lat;
    }

    area = Math.abs(area) / 2;
    
    // Convert from square degrees to acres (rough approximation)
    // At 32°N latitude, 1 degree ≈ 69 miles ≈ 111 km
    const squareDegreesToAcres = 69 * 69 * 640; // 640 acres per square mile
    return area * squareDegreesToAcres;
  }
}

export const gisService = new GISService();