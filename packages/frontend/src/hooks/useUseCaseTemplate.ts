import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useCaseTemplateService, UseCaseTemplate } from '../services/usecase-template.service';
import { useAuthentication } from './useAuthentication';

interface UseUseCaseTemplateState {
  loading: boolean;
  error: Error | null;
  template: UseCaseTemplate | null;
  component: React.ComponentType | null;
  hasAccess: boolean;
}

export const useUseCaseTemplate = (useCaseId: string | null) => {
  const { user, hasAnyPermission, hasAnyRole } = useAuthentication();
  
  const [state, setState] = useState<UseUseCaseTemplateState>({
    loading: false,
    error: null,
    template: null,
    component: null,
    hasAccess: true
  });

  // Load template
  const loadTemplate = useCallback(async () => {
    if (!useCaseId) {
      setState({
        loading: false,
        error: null,
        template: null,
        component: null,
        hasAccess: true
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if template is already registered
      let template = useCaseTemplateService.getTemplate(useCaseId);
      let component: React.ComponentType | null = null;

      if (template) {
        component = template.component;
      } else {
        // Try to load dynamically
        component = await useCaseTemplateService.loadTemplateComponent(useCaseId);
        
        if (!component) {
          // Use placeholder component
          component = useCaseTemplateService.createPlaceholderComponent(useCaseId);
        }
        
        // Get the registered template after loading
        template = useCaseTemplateService.getTemplate(useCaseId);
      }

      // Check access permissions
      let hasAccess = true;
      
      if (template) {
        // Check required permissions
        if (template.requiredPermissions && template.requiredPermissions.length > 0) {
          hasAccess = hasAnyPermission(template.requiredPermissions);
        }
        
        // Check required roles
        if (hasAccess && template.requiredRoles && template.requiredRoles.length > 0) {
          hasAccess = hasAnyRole(template.requiredRoles as any);
        }
      }

      setState({
        loading: false,
        error: null,
        template: template || null,
        component,
        hasAccess
      });
    } catch (error: any) {
      console.error('Failed to load template:', error);
      setState({
        loading: false,
        error: new Error(error.message || 'Failed to load template'),
        template: null,
        component: null,
        hasAccess: false
      });
    }
  }, [useCaseId, hasAnyPermission, hasAnyRole]);

  // Load template when ID changes
  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  // Get all available templates
  const getAllTemplates = useCallback((): UseCaseTemplate[] => {
    return useCaseTemplateService.getAllTemplates();
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: string): UseCaseTemplate[] => {
    return useCaseTemplateService.getTemplatesByCategory(category);
  }, []);

  // Get template metadata
  const getTemplateMetadata = useCallback((id: string) => {
    return useCaseTemplateService.getTemplateMetadata(id);
  }, []);

  // Register a new template
  const registerTemplate = useCallback((template: UseCaseTemplate) => {
    useCaseTemplateService.registerTemplate(template);
  }, []);

  return {
    ...state,
    loadTemplate,
    getAllTemplates,
    getTemplatesByCategory,
    getTemplateMetadata,
    registerTemplate
  };
};

// Hook for rendering use case content with dynamic loading
export const useUseCaseContent = (useCaseId: string | null) => {
  const { loading, error, component, hasAccess, template } = useUseCaseTemplate(useCaseId);

  const renderContent = useCallback(() => {
    if (loading) {
      return React.createElement('div', {
        className: 'flex items-center justify-center p-8'
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'
        }),
        React.createElement('span', {
          key: 'text',
          className: 'ml-3 text-gray-400'
        }, 'Loading template...')
      ]);
    }

    if (error) {
      return React.createElement('div', {
        className: 'p-8 text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-red-500 text-4xl mb-4'
        }, '⚠️'),
        React.createElement('h3', {
          key: 'title',
          className: 'text-xl font-semibold text-white mb-2'
        }, 'Failed to Load Template'),
        React.createElement('p', {
          key: 'error',
          className: 'text-gray-400'
        }, error.message)
      ]);
    }

    if (!hasAccess) {
      return React.createElement('div', {
        className: 'p-8 text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-yellow-500 text-4xl mb-4'
        }, '🔒'),
        React.createElement('h3', {
          key: 'title',
          className: 'text-xl font-semibold text-white mb-2'
        }, 'Access Denied'),
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-400'
        }, 'You do not have permission to access this use case.'),
        template?.requiredRoles && React.createElement('p', {
          key: 'roles',
          className: 'text-sm text-gray-500 mt-2'
        }, `Required roles: ${template.requiredRoles.join(', ')}`),
        template?.requiredPermissions && React.createElement('p', {
          key: 'permissions',
          className: 'text-sm text-gray-500'
        }, `Required permissions: ${template.requiredPermissions.join(', ')}`)
      ]);
    }

    if (!component) {
      return React.createElement('div', {
        className: 'p-8 text-center'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-400'
        }, 'No template available for this use case.')
      ]);
    }

    // Render the component
    return React.createElement(component);
  }, [loading, error, component, hasAccess, template]);

  return {
    loading,
    error,
    hasAccess,
    template,
    renderContent
  };
};