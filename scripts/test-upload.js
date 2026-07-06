const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Helper to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('=== Starting local API upload test ===');
  
  // 1. Create dummy upload file
  const testFilePath = path.join(__dirname, 'test-file.mp3');
  fs.writeFileSync(testFilePath, 'Dummy audio content for testing upload api');
  console.log(`Created test file at: ${testFilePath}`);

  // 2. Start Next.js dev server
  console.log('Starting Next.js dev server...');
  const nextProcess = spawn('npm', ['run', 'dev'], {
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  // Collect output log
  nextProcess.stdout.on('data', (data) => {
    console.log(`[Next.js stdout]: ${data.toString().trim()}`);
  });
  nextProcess.stderr.on('data', (data) => {
    console.error(`[Next.js stderr]: ${data.toString().trim()}`);
  });

  // Wait 6 seconds for dev server to start
  await sleep(6000);

  // 3. Perform file upload call using form-data
  try {
    console.log('Sending upload request...');
    
    // We will use native fetch since Node 18+ has fetch built-in
    const form = new FormData();
    // Node.js FormData expects a Blob or File for file fields
    const blob = new Blob([fs.readFileSync(testFilePath)], { type: 'audio/mp3' });
    form.append('file', blob, 'test-file.mp3');

    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });

    console.log(`Status code: ${res.status}`);
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Fetch request failed:', error);
  } finally {
    // 4. Cleanup
    console.log('Cleaning up...');
    try {
      fs.unlinkSync(testFilePath);
    } catch {}
    
    // Kill dev server
    console.log('Terminating Next.js dev server...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  }
}

main();
