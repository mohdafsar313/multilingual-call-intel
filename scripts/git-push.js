const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Find Git executable path
let gitPath = 'git';
const windowsGitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';
if (fs.existsSync(windowsGitPath)) {
  gitPath = `"${windowsGitPath}"`;
}

function runCmd(cmd) {
  try {
    console.log(`Executing: ${cmd}`);
    return execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    throw err;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function getGitHubUsername(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node-Git-Push-Script',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const user = JSON.parse(data);
          resolve(user.login);
        } else {
          reject(new Error(`Failed to fetch user. Status: ${res.statusCode}, Message: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function createGitHubRepo(token, repoName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: repoName,
      description: 'Multilingual Call Intelligence Platform - AI-powered audio transcription, speaker diarization and insights dashboard.',
      private: false,
      auto_init: false
    });

    const options = {
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node-Git-Push-Script',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else if (res.statusCode === 422) {
          console.log(`Repository "${repoName}" already exists on GitHub. Proceeding with push...`);
          resolve({ already_exists: true });
        } else {
          reject(new Error(`Failed to create repo. Status: ${res.statusCode}, Message: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== AuraIntel GitHub Repository Setup ===\n');
  
  // Try to load token from environment
  let token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  let repoName = process.env.GITHUB_REPO || 'multilingual-call-intel';

  if (!token) {
    console.log('GitHub Token not found in environment.');
    console.log('You can generate a Personal Access Token (PAT) here: https://github.com/settings/tokens');
    console.log('Ensure the token has the "repo" scope checked.');
    token = await question('Enter your GitHub Personal Access Token (PAT): ');
    token = token.trim();
  }

  if (!token) {
    console.error('Error: GitHub Token is required to create a repository.');
    rl.close();
    process.exit(1);
  }

  if (!process.env.GITHUB_REPO) {
    const inputRepo = await question(`Enter repository name [default: ${repoName}]: `);
    if (inputRepo.trim()) {
      repoName = inputRepo.trim();
    }
  }

  rl.close();

  try {
    // 1. Get username
    console.log('\nValidating token and fetching username...');
    const username = await getGitHubUsername(token);
    console.log(`Authenticated as GitHub user: @${username}`);

    // 2. Create Repository on GitHub
    console.log(`\nCreating public GitHub repository: ${repoName}...`);
    await createGitHubRepo(token, repoName);

    // 3. Initialize Git locally and push
    console.log('\nInitializing Git locally...');
    
    // Create simple .gitignore if it doesn't exist
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, `
node_modules
.next
out
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
data/db.json
public/uploads/*
!public/uploads/.gitkeep
`, 'utf-8');
    }

    // Ensure uploads directory exists and has a .gitkeep
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const gitkeepPath = path.join(uploadDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '', 'utf-8');
    }

    // Run local Git commands
    runCmd(`${gitPath} init`);
    runCmd(`${gitPath} add .`);
    
    try {
      runCmd(`${gitPath} commit -m "Initial commit of AuraIntel Call Intelligence Platform"`);
    } catch {
      console.log('Commit failed. Git might need user.name and user.email configured.');
      console.log('Configuring temporary dummy Git credentials...');
      runCmd(`${gitPath} config user.name "AuraIntel User"`);
      runCmd(`${gitPath} config user.email "user@auraintel.local"`);
      runCmd(`${gitPath} commit -m "Initial commit of AuraIntel Call Intelligence Platform"`);
    }

    runCmd(`${gitPath} branch -M main`);

    // Remove origin remote if already exists
    try {
      runCmd(`${gitPath} remote remove origin`);
    } catch {}

    // Add new remote
    console.log(`Setting remote origin to: https://github.com/${username}/${repoName}`);
    runCmd(`${gitPath} remote add origin https://${username}:${token}@github.com/${username}/${repoName}.git`);

    console.log('Pushing to GitHub (branch: main)...');
    runCmd(`${gitPath} push -u origin main`);

    console.log('\n======================================================');
    console.log('SUCCESS! AuraIntel is now live on GitHub!');
    console.log(`Repository URL: https://github.com/${username}/${repoName}`);
    console.log('======================================================');

  } catch (error) {
    console.error('\nAn error occurred during repository push:', error.message);
    process.exit(1);
  }
}

main();
