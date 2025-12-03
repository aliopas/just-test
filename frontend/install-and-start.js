const { exec } = require('child_process');
const path = require('path');

const frontendDir = __dirname;

console.log('Installing dependencies...');
exec('npm install', { cwd: frontendDir }, (error, stdout, stderr) => {
  if (error) {
    console.error('Install error:', error);
    return;
  }
  console.log(stdout);
  console.log('Starting dev server...');
  exec('npm run dev', { cwd: frontendDir }, (error, stdout, stderr) => {
    if (error) {
      console.error('Start error:', error);
      return;
    }
    console.log(stdout);
  });
});

