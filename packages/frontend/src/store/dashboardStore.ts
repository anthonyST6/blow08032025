/**
 * Dashboard Store using Zustand
 * 
 * Manages global state for dashboard data, including:
 * - Ingested data
 * - Transformed data
 * - Loading states
 * - Data synchronization
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { IngestedDataRow } from '../services/ingestedData.service';
import { OilfieldDemoData, transformIngestedToDemo } from '../services/oilfieldDataTransformer.service';

interface DashboardState {
  // Data states
  ingestedData: IngestedDataRow[] | null;
  transformedData: OilfieldDemoData | null;
  demoData: OilfieldDemoData | null;
  
  // UI states
  isIngesting: boolean;
  isTransforming: boolean;
  ingestionError: string | null;
  transformationError: string | null;
  dataTimestamp: string | null;
  
  // Selected use case
  selectedUseCaseId: string | null;
  
  // Actions
  setIngestedData: (data: IngestedDataRow[]) => void;
  setDemoData: (data: OilfieldDemoData) => void;
  transformData: () => Promise<void>;
  clearData: () => void;
  setSelectedUseCase: (useCaseId: string) => void;
  setIngestionError: (error: string | null) => void;
  setIsIngesting: (isIngesting: boolean) => void;
  
  // Data ingestion workflow
  ingestData: (data: IngestedDataRow[]) => Promise<void>;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ingestedData: null,
        transformedData: null,
        demoData: null,
        isIngesting: false,
        isTransforming: false,
        ingestionError: null,
        transformationError: null,
        dataTimestamp: null,
        selectedUseCaseId: null,
        
        // Actions
        setIngestedData: (data) => set({ 
          ingestedData: data,
          dataTimestamp: new Date().toISOString()
        }),
        
        setDemoData: (data) => set({ demoData: data }),
        
        transformData: async () => {
          const { ingestedData } = get();
          if (!ingestedData) return;
          
          set({ isTransforming: true, transformationError: null });
          
          try {
            const transformed = transformIngestedToDemo(ingestedData);
            set({ 
              transformedData: transformed,
              isTransforming: false 
            });
          } catch (error) {
            set({ 
              transformationError: error instanceof Error ? error.message : 'Transformation failed',
              isTransforming: false 
            });
          }
        },
        
        clearData: () => set({
          ingestedData: null,
          transformedData: null,
          ingestionError: null,
          transformationError: null,
          dataTimestamp: null,
          isIngesting: false,
          isTransforming: false
        }),
        
        setSelectedUseCase: (useCaseId) => set({ selectedUseCaseId: useCaseId }),
        
        setIngestionError: (error) => set({ ingestionError: error }),
        
        setIsIngesting: (isIngesting) => set({ isIngesting }),
        
        // Complete data ingestion workflow
        ingestData: async (data) => {
          set({ 
            isIngesting: true, 
            ingestionError: null,
            transformationError: null 
          });
          
          try {
            // Store the ingested data
            set({ 
              ingestedData: data,
              dataTimestamp: new Date().toISOString()
            });
            
            // Transform the data
            await get().transformData();
            
            set({ isIngesting: false });
          } catch (error) {
            set({ 
              ingestionError: error instanceof Error ? error.message : 'Ingestion failed',
              isIngesting: false 
            });
          }
        },
        
        // Refresh data (re-transform existing ingested data)
        refreshData: async () => {
          const { ingestedData } = get();
          if (!ingestedData) return;
          
          await get().transformData();
        }
      }),
      {
        name: 'dashboard-storage',
        // Only persist selected data
        partialize: (state) => ({
          selectedUseCaseId: state.selectedUseCaseId,
          dataTimestamp: state.dataTimestamp
        })
      }
    )
  )
);

// Selectors for common use cases
export const selectHasData = (state: DashboardState) => 
  state.ingestedData !== null && state.transformedData !== null;

export const selectIsLiveData = (state: DashboardState) => 
  state.ingestedData !== null;

export const selectDisplayData = (state: DashboardState) => 
  state.transformedData || state.demoData;

export const selectDataStatus = (state: DashboardState) => {
  if (state.isIngesting || state.isTransforming) return 'processing';
  if (state.ingestionError || state.transformationError) return 'error';
  if (state.transformedData) return 'success';
  return 'empty';
};