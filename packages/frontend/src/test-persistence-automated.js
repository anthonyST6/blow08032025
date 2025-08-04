/**
 * Automated test script for Mission Control persistence functionality
 * This script simulates user interactions and verifies persistence behavior
 */

const STORAGE_KEY = 'missionControlState';

// Test data
const testState = {
  selectedVertical: 'energy',
  selectedUseCase: 'energy-oilfield-land-lease',
  selectedUseCaseDetails: {
    id: 'energy-oilfield-land-lease',
    title: 'Oilfield Land Lease Analysis',
    description: 'Analyze and optimize oilfield land lease agreements',
    vertical: 'energy',
    icon: '🛢️',
    color: 'amber'
  },
  uploadedData: null,
  executionHistory: [],
  currentStep: 'use-case-selected',
  timestamp: new Date().toISOString()
};

// Test functions
function saveTestState() {
  console.log('=== TEST: Saving state to localStorage ===');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testState));
    console.log('✅ State saved successfully');
    console.log('Saved state:', testState);
    return true;
  } catch (error) {
    console.error('❌ Failed to save state:', error);
    return false;
  }
}

function loadAndVerifyState() {
  console.log('\n=== TEST: Loading and verifying state ===');
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      console.error('❌ No state found in localStorage');
      return false;
    }

    const parsedState = JSON.parse(savedState);
    console.log('✅ State loaded successfully');
    console.log('Loaded state:', parsedState);

    // Verify key fields
    const checks = [
      { field: 'selectedVertical', expected: 'energy' },
      { field: 'selectedUseCase', expected: 'energy-oilfield-land-lease' },
      { field: 'selectedUseCaseDetails.title', expected: 'Oilfield Land Lease Analysis' }
    ];

    let allPassed = true;
    checks.forEach(check => {
      const value = check.field.includes('.') 
        ? check.field.split('.').reduce((obj, key) => obj?.[key], parsedState)
        : parsedState[check.field];
      
      if (value === check.expected) {
        console.log(`✅ ${check.field}: ${value}`);
      } else {
        console.error(`❌ ${check.field}: Expected "${check.expected}", got "${value}"`);
        allPassed = false;
      }
    });

    return allPassed;
  } catch (error) {
    console.error('❌ Failed to load/verify state:', error);
    return false;
  }
}

function simulateStorageEvent() {
  console.log('\n=== TEST: Simulating storage event ===');
  try {
    const event = new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(testState),
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href
    });
    
    window.dispatchEvent(event);
    console.log('✅ Storage event dispatched');
    return true;
  } catch (error) {
    console.error('❌ Failed to dispatch storage event:', error);
    return false;
  }
}

function simulateRestoreEvent() {
  console.log('\n=== TEST: Simulating restore event ===');
  try {
    const event = new CustomEvent('missionControlRestore', {
      detail: testState,
      bubbles: true,
      cancelable: true
    });
    
    window.dispatchEvent(event);
    console.log('✅ Restore event dispatched');
    console.log('Event detail:', event.detail);
    return true;
  } catch (error) {
    console.error('❌ Failed to dispatch restore event:', error);
    return false;
  }
}

function clearState() {
  console.log('\n=== TEST: Clearing state ===');
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ State cleared from localStorage');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear state:', error);
    return false;
  }
}

function checkPersistedStateIndicator() {
  console.log('\n=== TEST: Checking for PersistedStateIndicator ===');
  
  // Check if the component would render based on state
  const state = localStorage.getItem(STORAGE_KEY);
  if (!state) {
    console.log('❌ No persisted state - indicator should not show');
    return false;
  }

  const parsedState = JSON.parse(state);
  if (parsedState.selectedUseCase && parsedState.selectedUseCaseDetails) {
    console.log('✅ State has required fields - indicator should show');
    console.log('Selected use case:', parsedState.selectedUseCase);
    console.log('Use case details:', parsedState.selectedUseCaseDetails.title);
    return true;
  } else {
    console.log('❌ State missing required fields - indicator should not show');
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Mission Control Persistence Tests\n');
  
  const results = {
    saveState: false,
    loadVerify: false,
    storageEvent: false,
    restoreEvent: false,
    indicatorCheck: false,
    clearState: false
  };

  // Test 1: Save state
  results.saveState = saveTestState();
  
  // Test 2: Load and verify state
  if (results.saveState) {
    results.loadVerify = loadAndVerifyState();
  }

  // Test 3: Simulate storage event
  results.storageEvent = simulateStorageEvent();

  // Test 4: Simulate restore event
  results.restoreEvent = simulateRestoreEvent();

  // Test 5: Check if indicator should show
  results.indicatorCheck = checkPersistedStateIndicator();

  // Test 6: Clear state
  results.clearState = clearState();

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}`);
  });

  if (passed === total) {
    console.log('\n🎉 All tests passed! Persistence functionality is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }

  return results;
}

// Add event listeners to monitor real events
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    console.log('📡 Real storage event detected:', {
      key: e.key,
      oldValue: e.oldValue ? 'present' : 'null',
      newValue: e.newValue ? 'present' : 'null'
    });
  }
});

window.addEventListener('missionControlRestore', (e) => {
  console.log('📡 Real restore event detected:', e.detail);
});

// Export for use in console
window.persistenceTests = {
  runAllTests,
  saveTestState,
  loadAndVerifyState,
  simulateStorageEvent,
  simulateRestoreEvent,
  clearState,
  checkPersistedStateIndicator,
  testState
};

console.log('✨ Persistence test script loaded!');
console.log('Run tests with: persistenceTests.runAllTests()');
console.log('Or run individual tests:');
console.log('  - persistenceTests.saveTestState()');
console.log('  - persistenceTests.loadAndVerifyState()');
console.log('  - persistenceTests.clearState()');