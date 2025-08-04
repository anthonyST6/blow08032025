import { describe, test, expect, beforeEach, vi } from 'vitest';
import { missionControlPersistence } from '../services/mission-control-persistence.service';

describe('Mission Control to Use Case Dashboard Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any existing state
    missionControlPersistence.clearState();
  });

  test('selecting use case in Mission Control persists to localStorage', () => {
    // 1. Simulate selecting a use case
    const useCase = {
      id: 'energy-oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      vertical: 'energy'
    };
    
    // 2. Save to persistence (this is what Mission Control should do)
    missionControlPersistence.updateState({
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease',
      selectedUseCaseDetails: useCase
    });
    
    // 3. Check localStorage
    const saved = localStorage.getItem('mission-control-state');
    expect(saved).toBeTruthy();
    const parsedState = JSON.parse(saved!);
    expect(parsedState.selectedUseCase).toBe('energy-oilfield-land-lease');
    expect(parsedState.selectedVertical).toBe('energy');
    expect(parsedState.selectedUseCaseDetails).toEqual(useCase);
  });

  test('Use Case Dashboard reads persisted selection', () => {
    // 1. Set up persisted state
    const useCase = {
      id: 'energy-oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      vertical: 'energy'
    };
    
    missionControlPersistence.updateState({
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease',
      selectedUseCaseDetails: useCase
    });
    
    // 2. Use Case Dashboard should read it
    const state = missionControlPersistence.getState();
    expect(state).toBeTruthy();
    expect(state?.selectedUseCase).toBe('energy-oilfield-land-lease');
    expect(state?.selectedUseCaseDetails?.name).toBe('Oilfield Land Lease Management');
  });

  test('Clear selection removes persistence', () => {
    // 1. Set up state
    missionControlPersistence.updateState({
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease',
      selectedUseCaseDetails: {
        id: 'energy-oilfield-land-lease',
        name: 'Oilfield Land Lease Management'
      }
    });
    
    // 2. Verify it's saved
    expect(missionControlPersistence.getState()?.selectedUseCase).toBe('energy-oilfield-land-lease');
    
    // 3. Clear selection
    missionControlPersistence.clearState();
    
    // 4. Verify localStorage is cleared
    const state = missionControlPersistence.getState();
    expect(state).toBeNull();
    expect(localStorage.getItem('mission-control-state')).toBeNull();
  });

  test('State persists across page refresh (simulated)', () => {
    // 1. Set state
    const useCase = {
      id: 'energy-oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      vertical: 'energy'
    };
    
    missionControlPersistence.updateState({
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease',
      selectedUseCaseDetails: useCase
    });
    
    // 2. Simulate page refresh by creating new instance
    // (In real app, this happens automatically)
    const savedState = localStorage.getItem('mission-control-state');
    expect(savedState).toBeTruthy();
    
    // 3. Parse and verify
    const reloadedState = JSON.parse(savedState!);
    expect(reloadedState.selectedUseCase).toBe('energy-oilfield-land-lease');
    expect(reloadedState.selectedUseCaseDetails.name).toBe('Oilfield Land Lease Management');
  });

  test('hasSelectedUseCase returns correct boolean', () => {
    // 1. Initially no selection
    expect(missionControlPersistence.hasSelectedUseCase()).toBe(false);
    
    // 2. After selection
    missionControlPersistence.updateState({
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease'
    });
    expect(missionControlPersistence.hasSelectedUseCase()).toBe(true);
    
    // 3. After clearing
    missionControlPersistence.clearState();
    expect(missionControlPersistence.hasSelectedUseCase()).toBe(false);
  });
});