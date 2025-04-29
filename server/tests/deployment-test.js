/**
 * Heroku Deployment Validation Test Suite
 * ------------------------------------------------------------------------------
 * This script performs automated checks to ensure that the server is properly
 * configured for Heroku deployment. It verifies critical files and configurations
 * that might cause deployment failures if misconfigured.
 * 
 * Usage:
 *   - From server directory: node tests/deployment-test.js
 *   - From deployment script: node ../scripts/server-deployment-test.js
 * 
 * Exit codes:
 *   - 0: All tests pass, deployment should succeed
 *   - 1: One or more tests failed, deployment would likely fail
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Runs the deployment validation test suite
 * @returns {boolean} True if all checks pass, false otherwise
 */
function runTests() {
  const errors = [];
  console.log('🔍 Running Heroku deployment validation tests...');

  // Test 1: Verify Procfile configuration
  console.log('  Checking Procfile configuration...');
  if (!fs.existsSync(path.join(__dirname, '../Procfile'))) {
    errors.push('Procfile is missing in the server directory. Create one with "web: npm start" and "release: npx knex migrate:latest"');
  } else {
    const procfileContent = fs.readFileSync(path.join(__dirname, '../Procfile'), 'utf8');
    if (!procfileContent.includes('web: npm start')) {
      errors.push('Procfile must contain "web: npm start" to specify the web process command');
    }
    if (!procfileContent.includes('release: npx knex migrate:latest')) {
      errors.push('Procfile should include "release: npx knex migrate:latest" to run database migrations automatically');
    }
  }

  // Test 2: Verify package.json scripts required by Heroku
  console.log('  Checking package.json scripts...');
  const packageJson = require('../package.json');
  if (!packageJson.scripts || !packageJson.scripts.start) {
    errors.push('Missing "start" script in package.json. This is required by Heroku to launch the server.');
  }
  if (!packageJson.scripts || !packageJson.scripts.build) {
    errors.push('Missing "build" script in package.json. This is required by Heroku to compile TypeScript before starting.');
  }

  // Test 3: Verify TypeScript deployment configuration
  console.log('  Checking TypeScript deployment configuration...');
  if (!fs.existsSync(path.join(__dirname, '../tsconfig.deployment.json'))) {
    errors.push('tsconfig.deployment.json is missing. This file configures TypeScript compilation for production.');
  } else {
    try {
      const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../tsconfig.deployment.json'), 'utf8'));
      if (tsConfig.compilerOptions.noEmit !== false) {
        errors.push('tsconfig.deployment.json must set compilerOptions.noEmit to false to generate JavaScript files');
      }
      if (!tsConfig.compilerOptions.outDir) {
        errors.push('tsconfig.deployment.json must specify compilerOptions.outDir to define the output directory');
      }
    } catch (error) {
      errors.push(`Invalid tsconfig.deployment.json: ${error.message}`);
    }
  }

  // Test 4: Verify database migration configuration
  console.log('  Checking database migration configuration...');
  if (!fs.existsSync(path.join(__dirname, '../knexfile.js'))) {
    errors.push('knexfile.js is missing for database migrations. This is required for Knex to run migrations.');
  } else {
    try {
      // Try to load the knexfile to check for syntax errors
      require('../knexfile.js');
    } catch (error) {
      errors.push(`knexfile.js has errors and cannot be loaded: ${error.message}`);
    }
  }

  // Test 5: Check if the main server entry point exists
  console.log('  Checking main server file...');
  if (!fs.existsSync(path.join(__dirname, '../src/index.ts'))) {
    errors.push('Main server file (src/index.ts) is missing. This is the entry point for the Express application.');
  }

  // Test 6: Check if Node.js version is specified
  console.log('  Checking Node.js engine specification...');
  if (!packageJson.engines || !packageJson.engines.node) {
    errors.push('Node.js version not specified in package.json engines. Add "engines": {"node": "18.x"} to ensure consistent runtime.');
  }

  // Test 7: Validate TypeScript compilation
  console.log('  Validating TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit -p tsconfig.deployment.json', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
    console.log('    ✅ TypeScript compilation check passed');
  } catch (error) {
    errors.push(`TypeScript compilation would fail during deployment: ${error.message}`);
    console.log('    ❌ TypeScript compilation check failed');
  }
  
  // Test 8: Check for necessary dependencies
  console.log('  Checking essential dependencies...');
  const requiredDeps = ['express', 'pg', 'knex', 'typescript'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  if (missingDeps.length > 0) {
    errors.push(`Missing essential dependencies: ${missingDeps.join(', ')}`);
  }

  // Output results
  console.log('\nTest Results:');
  if (errors.length === 0) {
    console.log('✅ All deployment tests passed! Server is ready for Heroku deployment.');
    return true;
  } else {
    console.error(`❌ ${errors.length} deployment tests failed:`);
    errors.forEach((error, index) => console.error(`  ${index + 1}. ${error}`));
    console.log('\n⚠️ Fix these issues before attempting deployment to avoid failures.');
    return false;
  }
}

// Allow module to be run directly or imported
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };