/**
 * Script to rename the GitHub repository
 * Run with: npx tsx scripts/rename-github-repo.ts
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
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const oldName = 'body-pain-assessment';
  const newName = 'mendmate';

  console.log('Getting GitHub access token...');
  const accessToken = await getAccessToken();
  
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Getting authenticated user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Logged in as: ${user.login}`);

  console.log(`Renaming repository from "${oldName}" to "${newName}"...`);
  try {
    const { data: repo } = await octokit.repos.update({
      owner: user.login,
      repo: oldName,
      name: newName,
    });
    console.log(`Repository renamed successfully!`);
    console.log(`New URL: ${repo.html_url}`);
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`Repository "${oldName}" not found. It may have already been renamed or doesn't exist.`);
      console.log(`Check: https://github.com/${user.login}/${newName}`);
    } else {
      throw error;
    }
  }
}

main().catch(console.error);
