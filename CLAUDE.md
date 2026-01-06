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

| Stack | Account | Purpose |
|-------|---------|---------|
| `GitHubOidc` | Management | OIDC provider + IAM role for GitHub Actions |
| `CloudTrail` | Management | Organization trail for SecurityLake integration |
| `CrossAccountRole-{id}` | Member accounts | Deployment role for cross-account access |

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
npx cdk bootstrap aws://982682372189/us-east-1 --profile management-admin
AWS_ORG_ID=o-jzaozr7wc4 npx cdk deploy GitHubOidc CloudTrail --require-approval never --profile management-admin
```

### Bootstrap a new member account
To enable GitHub Actions to deploy to a new member account:

1. Bootstrap CDK in the target account:
```bash
npx cdk bootstrap aws://779315395440/us-east-1 --trust 982682372189 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --profile logarchive-admin
```

2. Deploy the cross-account role (from management account):
```bash
npx cdk deploy CrossAccountRole-779315395440 --profile management-admin
```

3. Add the account to `.github/workflows/deploy.yml` matrix

**SSO Profiles:**
| Profile | Account |
|---------|---------|
| `management-admin` | 982682372189 (Management) |
| `logarchive-admin` | 779315395440 (Log Archive) |

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
├── bin/infra.ts                    # CDK app entry point
└── lib/
    ├── github-oidc-stack.ts        # OIDC provider + IAM role for GitHub Actions
    ├── cloudtrail-stack.ts         # Organization trail for SecurityLake
    └── cross-account-role-stack.ts # Deployment role for member accounts
```

### Multi-Account Flow

```
GitHub Actions
    │
    ▼ (OIDC)
GitHubActionsRole (Management: 982682372189)
    │
    └──▶ assume role ──▶ GitHubDeployRole (Member accounts)
```

Stack configuration is defined in `cdk/cdk.json` under the `context` key (account, region, githubOrg).

## GitHub Actions Role Setup for Other Repos

Any repo in the BLANXLAIT org can deploy to AWS accounts using these roles:

| Account | Role ARN |
|---------|----------|
| Management | `arn:aws:iam::982682372189:role/GitHubActionsRole` |
| Log Archive | `arn:aws:iam::779315395440:role/GitHubDeployRole` |

### Deploy to Management Account Only

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::982682372189:role/GitHubActionsRole
      aws-region: us-east-1
```

### Deploy to Member Account (Role Chaining)

```yaml
permissions:
  id-token: write
  contents: read

steps:
  # First authenticate to management account via OIDC
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::982682372189:role/GitHubActionsRole
      aws-region: us-east-1

  # Then assume role in target account
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::779315395440:role/GitHubDeployRole
      aws-region: us-east-1
      role-chaining: true
```

## Cost Notes

- CloudTrail: Organization trail, management events from all accounts
- Logs transition to Intelligent-Tiering after 30 days
- Logs expire after 365 days
- SecurityLake: 7-day retention (dev configuration)