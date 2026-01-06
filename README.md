# BLANXLAIT AWS Infrastructure

[![Deploy CDK](https://github.com/BLANXLAIT/blanxlait-aws-infra/actions/workflows/deploy.yml/badge.svg)](https://github.com/BLANXLAIT/blanxlait-aws-infra/actions/workflows/deploy.yml)

AWS Organization infrastructure managed with CDK (TypeScript).

## Stacks

| Stack | Account | Purpose |
|-------|---------|---------|
| `GitHubOidc` | Management | OIDC provider + IAM role for GitHub Actions |
| `CloudTrail` | Management | Organization trail for SecurityLake integration |
| `CrossAccountRole-{id}` | Member | Deployment role for cross-account access |

## Setup

### GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ORG_ID` | AWS Organization ID for CloudTrail bucket policy |

### First-time Bootstrap (Management Account)

```bash
cd cdk
npm install
npx cdk bootstrap aws://982682372189/us-east-1 --profile management-admin
AWS_ORG_ID=o-jzaozr7wc4 npx cdk deploy GitHubOidc CloudTrail --require-approval never --profile management-admin
```

### Adding a New Member Account

1. Bootstrap CDK in the target account:
```bash
npx cdk bootstrap aws://779315395440/us-east-1 --trust 982682372189 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess --profile logarchive-admin
```

2. Deploy the cross-account role:
```bash
npx cdk deploy CrossAccountRole-779315395440 --profile management-admin
```

3. Add account to `cdk/bin/infra.ts` targetAccounts and `.github/workflows/deploy.yml` matrix

### SSO Profiles

| Profile | Account |
|---------|---------|
| `management-admin` | 982682372189 (Management) |
| `logarchive-admin` | 779315395440 (Log Archive) |

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
