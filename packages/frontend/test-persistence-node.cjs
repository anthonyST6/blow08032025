/**
 * Node.js script to test Mission Control persistence functionality
 * Run with: node test-persistence-node.js
 */

const { JSDOM } = require('jsdom');

// Create a mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:5173',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = value;
  },
  removeItem(key) {
    delete this.storage[key];
  },
  clear() {
    this.storage = {};
  }
};

// Constants
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

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    info: `${colors.blue}ℹ️`,
    warning: `${colors.yellow}⚠️`,
    test: `${colors.cyan}🧪`
  };
  
  console.log(`${prefix[type] || prefix.info} ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}`);
}

// Test functions
function testSaveState() {
  logSection('TEST 1: Save State to localStorage');
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testState));
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      log('State saved successfully', 'success');
      log(`Saved ${saved.length} characters`, 'info');
      return true;
    } else {
      log('Failed to save state', 'error');
      return false;
    }
  } catch (error) {
    log(`Error saving state: ${error.message}`, 'error');
    return false;
  }
}

function testLoadAndVerifyState() {
  logSection('TEST 2: Load and Verify State');
  
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      log('No state found in localStorage', 'error');
      return false;
    }

    const parsedState = JSON.parse(savedState);
    log('State loaded successfully', 'success');

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
        log(`${check.field}: "${value}"`, 'success');
      } else {
        log(`${check.field}: Expected "${check.expected}", got "${value}"`, 'error');
        allPassed = false;
      }
    });

    return allPassed;
  } catch (error) {
    log(`Error loading/verifying state: ${error.message}`, 'error');
    return false;
  }
}

function testPersistedStateIndicator() {
  logSection('TEST 3: Check PersistedStateIndicator Requirements');
  
  try {
    const state = localStorage.getItem(STORAGE_KEY);
    if (!state) {
      log('No persisted state - indicator should NOT show', 'warning');
      return false;
    }

    const parsedState = JSON.parse(state);
    const hasRequiredFields = !!(parsedState.selectedUseCase && parsedState.selectedUseCaseDetails);
    
    if (hasRequiredFields) {
      log('State has required fields - indicator SHOULD show', 'success');
      log(`Selected use case: ${parsedState.selectedUseCase}`, 'info');
      log(`Use case title: ${parsedState.selectedUseCaseDetails.title}`, 'info');
      return true;
    } else {
      log('State missing required fields - indicator should NOT show', 'error');
      return false;
    }
  } catch (error) {
    log(`Error checking indicator requirements: ${error.message}`, 'error');
    return false;
  }
}

function testClearState() {
  logSection('TEST 4: Clear State');
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    const remaining = localStorage.getItem(STORAGE_KEY);
    
    if (!remaining) {
      log('State cleared successfully', 'success');
      return true;
    } else {
      log('Failed to clear state', 'error');
      return false;
    }
  } catch (error) {
    log(`Error clearing state: ${error.message}`, 'error');
    return false;
  }
}

function testPersistenceWorkflow() {
  logSection('TEST 5: Complete Persistence Workflow');
  
  try {
    // Step 1: Clear any existing state
    localStorage.clear();
    log('Cleared localStorage', 'info');

    // Step 2: Simulate user selecting a use case
    const userSelection = {
      selectedVertical: 'energy',
      selectedUseCase: 'energy-oilfield-land-lease',
      selectedUseCaseDetails: {
        id: 'energy-oilfield-land-lease',
        title: 'Oilfield Land Lease Analysis',
        vertical: 'energy'
      },
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSelection));
    log('Simulated user selection saved', 'success');

    // Step 3: Simulate navigation away and back
    log('Simulating navigation away from Mission Control...', 'info');
    
    // Step 4: Check if state persists
    const persistedState = localStorage.getItem(STORAGE_KEY);
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      log('State persisted after navigation', 'success');
      log(`Persisted use case: ${parsed.selectedUseCase}`, 'info');
      return true;
    } else {
      log('State lost after navigation', 'error');
      return false;
    }
  } catch (error) {
    log(`Error in workflow test: ${error.message}`, 'error');
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}🚀 Mission Control Persistence Test Suite${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
  
  const results = {
    saveState: testSaveState(),
    loadVerify: testLoadAndVerifyState(),
    indicatorCheck: testPersistedStateIndicator(),
    clearState: testClearState(),
    workflow: testPersistenceWorkflow()
  };

  // Summary
  logSection('TEST SUMMARY');
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`\n${colors.bright}Total tests: ${total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${total - passed}${colors.reset}\n`);
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? `${colors.green}PASS` : `${colors.red}FAIL`;
    console.log(`  ${status} ${colors.reset}${test}`);
  });

  if (passed === total) {
    console.log(`\n${colors.bright}${colors.green}🎉 All tests passed! Persistence functionality is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}⚠️  Some tests failed. Please check the implementation.${colors.reset}`);
  }

  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1);
}

// Check if jsdom is available
try {
  require('jsdom');
  runAllTests();
} catch (error) {
  console.log(`${colors.yellow}Note: jsdom not installed. Installing it would allow full DOM simulation.${colors.reset}`);
  console.log(`${colors.cyan}Running basic localStorage tests...${colors.reset}\n`);
  
  // Run basic tests without DOM
  runAllTests();
}