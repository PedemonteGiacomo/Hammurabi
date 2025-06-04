const { spawnSync } = require('child_process');

// Filter out unsupported -w=0 flag passed by CI script
const args = process.argv.slice(2).filter(arg => arg !== '-w=0');

const result = spawnSync('npx', ['vitest', 'run', '--watch=false', ...args], { stdio: 'inherit' });
process.exit(result.status);
