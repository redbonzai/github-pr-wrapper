const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Resolve the path to nx.json
const nxConfigPath = path.join(__dirname, '..', '..', 'nx.json');
const nxConfig = require(nxConfigPath);

// Update the nxConfig object with environment variables
if (process.env.NX_ACCESS_TOKEN) {
  nxConfig.tasksRunnerOptions.default.options.accessToken = process.env.NX_ACCESS_TOKEN;
}

// Write the updated configuration back to nx.json
fs.writeFileSync(nxConfigPath, JSON.stringify(nxConfig, null, 2));

console.log('Nx configuration updated with environment variables');
