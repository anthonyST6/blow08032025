import React from 'react';

export interface UseCaseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  component: React.ComponentType;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  config?: Record<string, any>;
}

export interface UseCaseTemplateRegistry {
  [key: string]: UseCaseTemplate;
}

class UseCaseTemplateService {
  private templates: UseCaseTemplateRegistry = {};
  private loadingPromises: Map<string, Promise<any>> = new Map();

  /**
   * Register a use case template
   */
  registerTemplate(template: UseCaseTemplate): void {
    this.templates[template.id] = template;
    console.log(`Registered template: ${template.id}`);
  }

  /**
   * Register multiple templates
   */
  registerTemplates(templates: UseCaseTemplate[]): void {
    templates.forEach(template => this.registerTemplate(template));
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): UseCaseTemplate | undefined {
    return this.templates[id];
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): UseCaseTemplate[] {
    return Object.values(this.templates);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): UseCaseTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Check if a template exists
   */
  hasTemplate(id: string): boolean {
    return id in this.templates;
  }

  /**
   * Dynamically load a template component
   */
  async loadTemplateComponent(id: string): Promise<React.ComponentType | null> {
    // Check if already registered
    const template = this.getTemplate(id);
    if (template) {
      return template.component;
    }

    // Check if already loading
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    // Create loading promise
    const loadingPromise = this.loadDynamicTemplate(id);
    this.loadingPromises.set(id, loadingPromise);

    try {
      const component = await loadingPromise;
      this.loadingPromises.delete(id);
      return component;
    } catch (error) {
      this.loadingPromises.delete(id);
      console.error(`Failed to load template ${id}:`, error);
      return null;
    }
  }

  /**
   * Load a template dynamically based on ID
   */
  private async loadDynamicTemplate(id: string): Promise<React.ComponentType | null> {
    try {
      // Map use case IDs to their import paths
      const templateMap: Record<string, () => Promise<any>> = {
        'energy-oilfield-land-lease': () =>
          import('../components/use-case-dashboard/templates/oilfield-land-lease/OilfieldLandLeaseDashboard'),
        // Future templates - will use placeholder until implemented
        'healthcare-patient-diagnosis': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('healthcare-patient-diagnosis') }),
        'finance-fraud-detection': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('finance-fraud-detection') }),
        'retail-inventory-optimization': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('retail-inventory-optimization') }),
        'manufacturing-quality-control': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('manufacturing-quality-control') }),
        'logistics-route-optimization': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('logistics-route-optimization') }),
        'education-personalized-learning': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('education-personalized-learning') }),
        'government-citizen-services': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('government-citizen-services') }),
        'telecom-network-optimization': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('telecom-network-optimization') }),
        'agriculture-crop-monitoring': () =>
          Promise.resolve({ default: this.createPlaceholderComponent('agriculture-crop-monitoring') }),
      };

      const importFunc = templateMap[id];
      if (!importFunc) {
        console.warn(`No template mapping found for: ${id}`);
        return null;
      }

      const module = await importFunc();
      const component = module.default || module[Object.keys(module)[0]];
      
      // Register the loaded component
      this.registerTemplate({
        id,
        name: this.formatTemplateName(id),
        description: `Template for ${id}`,
        category: this.extractCategory(id),
        component
      });

      return component;
    } catch (error) {
      console.error(`Error loading template ${id}:`, error);
      return null;
    }
  }

  /**
   * Format template name from ID
   */
  private formatTemplateName(id: string): string {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract category from template ID
   */
  private extractCategory(id: string): string {
    const parts = id.split('-');
    return parts[0] || 'general';
  }

  /**
   * Get template metadata
   */
  getTemplateMetadata(id: string): {
    name: string;
    category: string;
    icon: string;
  } {
    const template = this.getTemplate(id);
    if (template) {
      return {
        name: template.name,
        category: template.category,
        icon: template.icon || this.getCategoryIcon(template.category)
      };
    }

    // Fallback metadata
    return {
      name: this.formatTemplateName(id),
      category: this.extractCategory(id),
      icon: this.getCategoryIcon(this.extractCategory(id))
    };
  }

  /**
   * Get icon for category
   */
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      energy: '⚡',
      healthcare: '🏥',
      finance: '💰',
      retail: '🛍️',
      manufacturing: '🏭',
      logistics: '🚚',
      education: '🎓',
      government: '🏛️',
      telecom: '📡',
      agriculture: '🌾',
      general: '📊'
    };
    return icons[category] || icons.general;
  }

  /**
   * Create a placeholder component for templates that don't exist yet
   */
  createPlaceholderComponent(id: string): React.ComponentType {
    const metadata = this.getTemplateMetadata(id);
    
    return () => React.createElement('div', {
      className: 'p-8 text-center'
    }, [
      React.createElement('div', {
        key: 'icon',
        className: 'text-6xl mb-4'
      }, metadata.icon),
      React.createElement('h2', {
        key: 'title',
        className: 'text-2xl font-bold text-white mb-2'
      }, metadata.name),
      React.createElement('p', {
        key: 'category',
        className: 'text-gray-400 mb-4'
      }, `Category: ${metadata.category}`),
      React.createElement('p', {
        key: 'message',
        className: 'text-gray-500'
      }, 'This template is coming soon...'),
      React.createElement('div', {
        key: 'id',
        className: 'mt-4 text-sm text-gray-600 font-mono'
      }, `Template ID: ${id}`)
    ]);
  }
}

// Export singleton instance
export const useCaseTemplateService = new UseCaseTemplateService();

// Pre-register the existing template
import { OilfieldLandLeaseDashboard } from '../components/use-case-dashboard/templates/oilfield-land-lease/OilfieldLandLeaseDashboard';

useCaseTemplateService.registerTemplate({
  id: 'energy-oilfield-land-lease',
  name: 'Oilfield Land Lease',
  description: 'Manage and analyze oilfield land lease portfolios',
  category: 'energy',
  icon: '🛢️',
  component: OilfieldLandLeaseDashboard,
  requiredPermissions: ['lease.view', 'lease.manage'],
  requiredRoles: ['admin', 'risk_officer']
});