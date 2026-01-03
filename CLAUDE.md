# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Account-level AWS infrastructure managed with CDK (TypeScript). Deploys automatically via GitHub Actions using OIDC federation.

## Account Info

- **Account ID**: 982682372189
- **Region**: us-east-1
- **Org**: BLANXLAIT (GitHub)

## CDK Stacks

| Stack | Purpose |
|-------|---------|
| `GitHubOidc` | OIDC provider + IAM role for GitHub Actions |
| `CloudTrail` | Management trail with cost-optimized S3 storage |

## Deployment

### Automatic (GitHub Actions)
Push to `main` branch triggers deployment. See `.github/workflows/deploy.yml`.

### Manual (first-time bootstrap)
```bash
cd cdk
npm install
npx cdk bootstrap aws://982682372189/us-east-1
npx cdk deploy --all
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
    └── cloudtrail-stack.ts   # Audit trail with S3 lifecycle optimization
```

Stack configuration is defined in `cdk/cdk.json` under the `context` key (account, region, githubOrg).

## Role ARN for Workflows

```
arn:aws:iam::982682372189:role/GitHubActionsRole
```

## Cost Notes

- CloudTrail: Management events only (~$2/month S3 storage)
- Logs transition to Intelligent-Tiering after 30 days
- Logs expire after 365 days

## Legacy CloudFormation (deprecated)

The `github-*.yaml` files are the original CloudFormation templates. They can be deleted after migrating to CDK.
