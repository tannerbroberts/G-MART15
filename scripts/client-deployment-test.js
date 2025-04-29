/**
 * Vercel Frontend Deployment Validation Test Suite
 * ------------------------------------------------------------------------------
 * This script performs automated checks to ensure the React/TypeScript client
 * is properly configured for Vercel deployment. It verifies critical files and
 * configurations that might cause deployment failures if misconfigured.
 * 
 * Usage:
 *   - From root directory: node scripts/client-deployment-test.js
 *   - From client deployment script: node ../scripts/client-deployment-test.js
 * 
 * Exit codes:
 *   - 0: All tests pass, deployment should succeed
 *   - 1: One or more tests failed, deployment would likely fail
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Client directories to validate
 */
const CLIENT_DIR = path.join(__dirname, '../client');
const SOURCE_DIR = path.join(CLIENT_DIR, 'src');

/**
 * Runs the frontend deployment validation test suite
 * @returns {boolean} True if all checks pass, false otherwise
 */
function runTests() {
  const errors = [];
  console.log('🔍 Running Vercel frontend deployment validation tests...');
  
  // Test 1: Check if package.json exists with required scripts
  console.log('  Checking package.json configuration...');
  if (!fs.existsSync(path.join(CLIENT_DIR, 'package.json'))) {
    errors.push('package.json is missing in the client directory');
  } else {
    try {
      const packageJson = require(path.join(CLIENT_DIR, 'package.json'));
      if (!packageJson.scripts || !packageJson.scripts.build) {
        errors.push('Missing "build" script in client/package.json. This is required by Vercel.');
      }
      if (!packageJson.dependencies || !packageJson.dependencies.react) {
        errors.push('React dependency not found in package.json.');
      }
    } catch (error) {
      errors.push(`Error reading package.json: ${error.message}`);
    }
  }

  // Test 2: Check if Vite configuration exists
  console.log('  Checking Vite configuration...');
  if (!fs.existsSync(path.join(CLIENT_DIR, 'vite.config.ts'))) {
    errors.push('vite.config.ts is missing. This is required for building the React application.');
  }
  
  // Test 3: Check if index.html exists
  console.log('  Checking index.html...');
  if (!fs.existsSync(path.join(CLIENT_DIR, 'index.html'))) {
    errors.push('index.html is missing in the client directory. This is the entry point for the application.');
  }
  
  // Test 4: Check if main entry point exists
  console.log('  Checking main entry point...');
  if (!fs.existsSync(path.join(SOURCE_DIR, 'main.tsx'))) {
    errors.push('src/main.tsx is missing. This is the React application entry point.');
  }
  
  // Test 5: Verify TypeScript configuration
  console.log('  Checking TypeScript configuration...');
  if (!fs.existsSync(path.join(CLIENT_DIR, 'tsconfig.json'))) {
    errors.push('tsconfig.json is missing. This is required for TypeScript compilation.');
  }
  
  // Test 6: Check if API endpoints use relative paths or environment variables
  console.log('  Checking API endpoint configurations...');
  try {
    const apiFiles = findFilesWithAPIEndpoints(SOURCE_DIR);
    const hardcodedUrls = findHardcodedUrls(apiFiles);
    if (hardcodedUrls.length > 0) {
      errors.push(`Found hardcoded API URLs that will break in production: ${hardcodedUrls.join(', ')}. Use environment variables instead.`);
    }
  } catch (error) {
    console.log(`    ⚠️ Could not check API endpoints: ${error.message}`);
  }
  
  // Test 7: Try a test build
  console.log('  Testing build process...');
  try {
    // Just type-check without full build for speed
    execSync('cd client && npx tsc --noEmit', { stdio: 'pipe' });
    console.log('    ✅ TypeScript compilation check passed');
  } catch (error) {
    errors.push('TypeScript compilation would fail during deployment. Fix TypeScript errors before deploying.');
    console.log('    ❌ TypeScript compilation check failed');
  }

  // Output results
  console.log('\nTest Results:');
  if (errors.length === 0) {
    console.log('✅ All frontend deployment tests passed! Client is ready for Vercel deployment.');
    return true;
  } else {
    console.error(`❌ ${errors.length} deployment tests failed:`);
    errors.forEach((error, index) => console.error(`  ${index + 1}. ${error}`));
    console.log('\n⚠️ Fix these issues before attempting deployment to avoid failures.');
    return false;
  }
}

/**
 * Recursively find files that likely contain API endpoints
 * @param {string} dir Directory to search
 * @returns {string[]} Array of file paths
 */
function findFilesWithAPIEndpoints(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findFilesWithAPIEndpoints(filePath));
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) &&
      !file.endsWith('.test.ts') && !file.endsWith('.test.tsx') && !file.endsWith('.test.js')
    ) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('fetch(') || content.includes('axios.') || content.includes('.post(') || content.includes('.get(')) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

/**
 * Find hardcoded URLs in files that could break in production
 * @param {string[]} files Array of file paths to check
 * @returns {string[]} Array of hardcoded URLs found
 */
function findHardcodedUrls(files) {
  const hardcodedUrls = [];
  const urlRegex = /['"]https?:\/\/localhost:[0-9]+\/[^'"]+['"]/g;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(urlRegex);
    if (matches) {
      hardcodedUrls.push(...matches);
    }
  }
  
  return hardcodedUrls;
}

// Allow module to be run directly or imported
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };