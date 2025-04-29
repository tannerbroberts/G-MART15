const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Tests to ensure proper Heroku deployment configuration
 */
function runTests() {
  const errors = [];
  console.log('Running Heroku deployment tests...');

  // Test 1: Check if Procfile exists
  if (!fs.existsSync(path.join(__dirname, '../Procfile'))) {
    errors.push('Procfile is missing in the server directory');
  } else {
    const procfileContent = fs.readFileSync(path.join(__dirname, '../Procfile'), 'utf8');
    if (!procfileContent.includes('web: npm start')) {
      errors.push('Procfile must contain "web: npm start"');
    }
    if (!procfileContent.includes('release: npx knex migrate:latest')) {
      errors.push('Procfile should include database migration in release phase');
    }
  }

  // Test 2: Check package.json scripts
  const packageJson = require('../package.json');
  if (!packageJson.scripts || !packageJson.scripts.start) {
    errors.push('Missing "start" script in package.json');
  }
  if (!packageJson.scripts || !packageJson.scripts.build) {
    errors.push('Missing "build" script in package.json');
  }

  // Test 3: Check if tsconfig for deployment exists
  if (!fs.existsSync(path.join(__dirname, '../tsconfig.deployment.json'))) {
    errors.push('tsconfig.deployment.json is missing');
  }

  // Test 4: Check if knexfile.js exists for database migrations
  if (!fs.existsSync(path.join(__dirname, '../knexfile.js'))) {
    errors.push('knexfile.js is missing for database migrations');
  }

  // Test 5: Check if the main server file exists
  if (!fs.existsSync(path.join(__dirname, '../src/index.ts'))) {
    errors.push('Main server file (src/index.ts) is missing');
  }

  // Test 6: Check if required Node.js version is specified
  if (!packageJson.engines || !packageJson.engines.node) {
    errors.push('Node.js version not specified in package.json engines');
  }

  // Test 7: Check if compiled JavaScript would be generated
  try {
    execSync('npx tsc --noEmit -p tsconfig.deployment.json', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
    console.log('✅ TypeScript compilation check passed');
  } catch (error) {
    errors.push('TypeScript compilation would fail: ' + error.message);
  }

  // Output results
  if (errors.length === 0) {
    console.log('✅ All deployment tests passed! Server is ready for Heroku deployment.');
    return true;
  } else {
    console.error('❌ Deployment tests failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };