/**
 * Script to set test persistence data in localStorage
 * This simulates a user having selected a use case
 */

// Set test data in localStorage
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

// Store in localStorage
localStorage.setItem('missionControlState', JSON.stringify(testState));

console.log('✅ Test persistence state has been set!');
console.log('State:', testState);
console.log('\nNow navigate to Mission Control to see the PersistedStateIndicator');
console.log('The indicator should appear in the bottom-right corner showing:');
console.log('- Active Selection: Oilfield Land Lease Analysis');
console.log('- Vertical: energy');
console.log('- Buttons to "View Dashboard" and "Clear Selection"');