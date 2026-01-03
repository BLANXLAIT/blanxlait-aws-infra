#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GitHubOidcStack } from '../lib/github-oidc-stack';
import { CloudTrailStack } from '../lib/cloudtrail-stack';

const app = new cdk.App();

const account = app.node.tryGetContext('account');
const region = app.node.tryGetContext('region');
const githubOrg = app.node.tryGetContext('githubOrg');

const env = { account, region };

new GitHubOidcStack(app, 'GitHubOidc', {
  env,
  githubOrg,
  repoScope: '*',
  permissionLevel: 'Admin',
  useExistingProvider: true, // OIDC provider already exists from legacy CloudFormation
});

new CloudTrailStack(app, 'CloudTrail', {
  env,
});
