const fs = require('fs');
const path = require('path');

const envs = ['dev', 'stage', 'prod'];
const requiredFields = ['baseUrl', 'credentials', 'employee', 'searchProfiles'];
const requiredCredentials = ['username', 'password', 'invalidUsername', 'invalidPassword'];

let allValid = true;

console.log('\n🔎 Validating test data files...\n');

for (const env of envs) {
  const filePath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing: config/testdata.${env}.json`);
    allValid = false;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Check top-level fields
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`❌ [${env}] Missing required field: "${field}"`);
      allValid = false;
    }
  }

  // Check credentials
  if (data.credentials) {
    for (const cred of requiredCredentials) {
      if (!data.credentials[cred]) {
        console.error(`❌ [${env}] Missing credentials field: "${cred}"`);
        allValid = false;
      }
    }
  }

  // Check searchProfiles is an array
  if (!Array.isArray(data.searchProfiles) || data.searchProfiles.length === 0) {
    console.error(`❌ [${env}] "searchProfiles" must be a non-empty array`);
    allValid = false;
  }

  if (allValid) {
    console.log(`✅ [${env}] testdata.${env}.json is valid`);
  }
}

if (!allValid) {
  console.error('\n❌ Validation FAILED. Fix the errors above before running tests.\n');
  process.exit(1);
} else {
  console.log('\n✅ All test data files are valid!\n');
}
