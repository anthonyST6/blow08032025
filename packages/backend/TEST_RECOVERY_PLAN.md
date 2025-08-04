# Integration Test Recovery Plan

## Overview
This document outlines the steps to recover from the computer crash during E2E workflow tests and ensure all tests run successfully.

## Test Environment Analysis

### Current Setup
- **Test Framework**: Jest with TypeScript
- **Mocking**: All external services (Firebase, OpenAI, Anthropic) are mocked
- **Dependencies**: No real database or Redis required for tests
- **Test Files**:
  1. `insurance-risk-assessment-workflow.test.ts` - Insurance risk analysis
  2. `methane-detection-workflow.test.ts` - Methane leak detection
  3. `oilfield-lease-workflow.test.ts` - Oilfield lease management
  4. `phmsa-compliance-workflow.test.ts` - PHMSA compliance automation

## Recovery Steps

### Step 1: Check Node.js and Dependencies
```bash
cd packages/backend
node --version  # Ensure Node.js >= 18.0.0
npm --version   # Ensure npm >= 9.0.0
npm install     # Reinstall dependencies if needed
```

### Step 2: Run Tests Individually
Run each test file separately to identify which one might have caused the crash:

```bash
# Test 1: Insurance Risk Assessment
npm test -- src/tests/e2e/insurance-risk-assessment-workflow.test.ts

# Test 2: Methane Detection
npm test -- src/tests/e2e/methane-detection-workflow.test.ts

# Test 3: Oilfield Lease
npm test -- src/tests/e2e/oilfield-lease-workflow.test.ts

# Test 4: PHMSA Compliance
npm test -- src/tests/e2e/phmsa-compliance-workflow.test.ts
```

### Step 3: Run Tests with Verbose Output
If a test fails, run it with verbose output:

```bash
npm test -- --verbose --detectOpenHandles src/tests/e2e/[test-file-name].test.ts
```

### Step 4: Check Memory Usage
Some tests might be memory-intensive. Run with increased memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

### Step 5: Run All Tests Together
Once individual tests pass, run all E2E tests:

```bash
npm test -- src/tests/e2e/
```

### Step 6: Generate Coverage Report
```bash
npm test -- --coverage src/tests/e2e/
```

## Potential Issues and Solutions

### Issue 1: Memory Leak
**Symptoms**: Tests slow down progressively, eventual crash
**Solution**: 
- Add `--detectOpenHandles` flag
- Ensure all async operations are properly awaited
- Check for circular references in mocks

### Issue 2: Timeout Errors
**Symptoms**: Tests fail with timeout errors
**Solution**:
- Increase Jest timeout in test files: `jest.setTimeout(30000);`
- Check for infinite loops in workflow executions

### Issue 3: Mock Conflicts
**Symptoms**: Unexpected behavior, mock functions not called
**Solution**:
- Clear mocks between tests: `jest.clearAllMocks()`
- Reset modules if needed: `jest.resetModules()`

### Issue 4: TypeScript Compilation
**Symptoms**: Type errors during test execution
**Solution**:
```bash
# Rebuild TypeScript
npm run build

# Check TypeScript configuration
npx tsc --noEmit
```

## Test Execution Script
Create a script to run tests systematically:

```bash
#!/bin/bash
# save as: run-integration-tests.sh

echo "Starting Integration Test Suite..."
echo "================================"

# Array of test files
tests=(
  "insurance-risk-assessment-workflow.test.ts"
  "methane-detection-workflow.test.ts"
  "oilfield-lease-workflow.test.ts"
  "phmsa-compliance-workflow.test.ts"
)

# Run each test
for test in "${tests[@]}"; do
  echo ""
  echo "Running: $test"
  echo "------------------------"
  
  npm test -- src/tests/e2e/$test
  
  if [ $? -eq 0 ]; then
    echo "✅ $test PASSED"
  else
    echo "❌ $test FAILED"
    echo "Stopping test execution..."
    exit 1
  fi
done

echo ""
echo "================================"
echo "All integration tests completed!"
```

## Monitoring During Tests

### Watch System Resources
```bash
# In a separate terminal, monitor system resources
# Windows
tasklist /fi "imagename eq node.exe"

# Or use Task Manager to monitor Node.js process
```

### Enable Debug Logging
Set environment variable for detailed logs:
```bash
DEBUG=* npm test -- src/tests/e2e/
```

## Post-Test Verification

1. Check for any generated reports in `packages/backend/coverage/`
2. Review test output for any warnings
3. Ensure no orphaned processes are running
4. Check disk space (tests might generate temporary files)

## Next Steps After Recovery

1. **Add Test Stability Improvements**:
   - Implement retry logic for flaky tests
   - Add better error handling in test setup/teardown
   - Consider splitting large test suites

2. **Create CI/CD Pipeline**:
   - Set up automated test runs
   - Configure test parallelization
   - Add test result reporting

3. **Document Test Requirements**:
   - Minimum system requirements
   - Expected test duration
   - Known issues and workarounds

## Emergency Contacts
- Check `packages/backend/src/utils/logger.ts` for error logs
- Review `jest.config.js` for test configuration
- Consult `package.json` for available test scripts