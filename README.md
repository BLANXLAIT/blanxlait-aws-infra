# BLANXLAIT AWS Infrastructure

[![Deploy CDK](https://github.com/BLANXLAIT/blanxlait-aws-infra/actions/workflows/deploy.yml/badge.svg)](https://github.com/BLANXLAIT/blanxlait-aws-infra/actions/workflows/deploy.yml)

AWS Organization infrastructure managed with CDK (TypeScript).

## Stacks

| Stack | Purpose |
|-------|---------|
| `GitHubOidc` | OIDC provider + IAM role for GitHub Actions |
| `CloudTrail` | Organization trail for SecurityLake integration |

## Setup

### GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ORG_ID` | AWS Organization ID for CloudTrail bucket policy |

### First-time Bootstrap

```bash
cd cdk
npm install
npx cdk bootstrap aws://982682372189/us-east-1
AWS_ORG_ID=o-xxxxx npx cdk deploy --all
```

## Deployment

Pushes to `main` automatically deploy via GitHub Actions.

For manual deployment:
```bash
cd cdk
AWS_ORG_ID=o-xxxxx npx cdk deploy --all
```

## Using in Other Repos

Any repo in the BLANXLAIT org can use this in their GitHub Actions:

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

## AWS Accounts

| Account | ID | Purpose |
|---------|-----|---------|
| Management | 982682372189 | Organization root, CDK deployment |
| Log Archive | 779315395440 | SecurityLake delegated admin |
