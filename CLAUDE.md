# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AWS Organization infrastructure managed with CDK (TypeScript). Deploys automatically via GitHub Actions using OIDC federation.

## Account Info

- **Management Account**: 982682372189
- **Log Archive Account**: 779315395440 (SecurityLake delegated admin)
- **Region**: us-east-1
- **Org**: BLANXLAIT (GitHub)

## CDK Stacks

| Stack | Purpose |
|-------|---------|
| `GitHubOidc` | OIDC provider + IAM role for GitHub Actions |
| `CloudTrail` | Organization trail for SecurityLake integration |

## GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ORG_ID` | AWS Organization ID (required for CloudTrail org trail bucket policy) |

## Deployment

### Automatic (GitHub Actions)
Push to `main` branch triggers deployment. See `.github/workflows/deploy.yml`.

### Manual (first-time bootstrap)
```bash
cd cdk
npm install
npx cdk bootstrap aws://982682372189/us-east-1
AWS_ORG_ID=o-xxxxx npx cdk deploy --all
```

## Development Commands

All commands run from `cdk/` directory:

```bash
npm run build     # Compile TypeScript
npm run synth     # Generate CloudFormation templates
npm run diff      # Preview changes against deployed stacks
npm run deploy    # Deploy all stacks to AWS
```

Direct CDK CLI (equivalent):
```bash
npx cdk synth
npx cdk diff
npx cdk deploy --all
```

## Architecture

```
cdk/
├── bin/infra.ts              # CDK app entry point
└── lib/
    ├── github-oidc-stack.ts  # OIDC provider + IAM role for GitHub Actions
    └── cloudtrail-stack.ts   # Organization trail for SecurityLake
```

Stack configuration is defined in `cdk/cdk.json` under the `context` key (account, region, githubOrg).

## Role ARN for Workflows

```
arn:aws:iam::982682372189:role/GitHubActionsRole
```

## Cost Notes

- CloudTrail: Organization trail, management events from all accounts
- Logs transition to Intelligent-Tiering after 30 days
- Logs expire after 365 days
- SecurityLake: 7-day retention (dev configuration)