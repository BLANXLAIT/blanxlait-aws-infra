#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GitHubOidcStack } from '../lib/github-oidc-stack';
import { CloudTrailStack } from '../lib/cloudtrail-stack';
import { CrossAccountDeployRoleStack, PermissionLevel } from '../lib/cross-account-role-stack';

const app = new cdk.App();

const managementAccount = app.node.tryGetContext('account');
const region = app.node.tryGetContext('region');
const githubOrg = app.node.tryGetContext('githubOrg');

// Target accounts for cross-account deployment
// Format: { accountId: permissionLevel }
const targetAccounts: Record<string, PermissionLevel> = app.node.tryGetContext('targetAccounts') ?? {
  '779315395440': 'Admin', // Log Archive
};

const env = { account: managementAccount, region };

// === Management Account Stacks ===
new GitHubOidcStack(app, 'GitHubOidc', {
  env,
  githubOrg,
  repoScope: '*',
  permissionLevel: 'Admin',
  useExistingProvider: true,
});

new CloudTrailStack(app, 'CloudTrail', {
  env,
});

// === Cross-Account Deployment Role Stacks ===
// These are deployed to member accounts to enable cross-account deployments
// Deploy with: npx cdk deploy CrossAccountRole-ACCOUNT_ID -c targetAccount=ACCOUNT_ID
for (const [accountId, permissionLevel] of Object.entries(targetAccounts)) {
  new CrossAccountDeployRoleStack(app, `CrossAccountRole-${accountId}`, {
    env: { account: accountId, region },
    trustedAccountId: managementAccount,
    permissionLevel,
    description: `Cross-account deployment role for GitHub Actions (trusted by ${managementAccount})`,
  });
}
