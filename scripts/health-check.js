const https = require('https');
const fs = require('fs');
const path = require('path');

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

const baseUrl = testData.baseUrl;

console.log(`\n🔍 Health Check - Environment: ${env}`);
console.log(`📡 Checking: ${baseUrl}\n`);

const url = new URL(baseUrl);

const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: '/web/index.php/auth/login',
  method: 'GET',
};

const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log(`✅ Site is UP — Status: ${res.statusCode}`);
  } else {
    console.log(`⚠️  Site responded with Status: ${res.statusCode}`);
  }
});

req.on('error', (e) => {
  console.error(`❌ Health check FAILED: ${e.message}`);
  process.exit(1);
});

req.end();
