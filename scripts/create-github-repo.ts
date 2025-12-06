/**
 * Script to create a GitHub repository and push the codebase
 * Run with: npx tsx scripts/create-github-repo.ts
 */

import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    throw new Error('GitHub not connected - please set up the GitHub integration first');
  }
  return accessToken;
}

async function main() {
  const repoName = 'body-pain-assessment';
  const description = 'Interactive body pain assessment tool with AI-powered analysis using Claude';

  console.log('Getting GitHub access token...');
  const accessToken = await getAccessToken();
  
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Getting authenticated user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Logged in as: ${user.login}`);

  console.log(`Creating repository: ${repoName}...`);
  try {
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: false,
      auto_init: false,
    });
    console.log(`Repository created: ${repo.html_url}`);
    console.log(`\nNext steps:`);
    console.log(`1. Run: git remote add github ${repo.clone_url}`);
    console.log(`2. Run: git push github main`);
  } catch (error: any) {
    if (error.status === 422) {
      console.log(`Repository "${repoName}" may already exist.`);
      console.log(`Check: https://github.com/${user.login}/${repoName}`);
    } else {
      throw error;
    }
  }
}

main().catch(console.error);
