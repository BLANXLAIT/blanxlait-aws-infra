# BLANXLAIT AWS Infrastructure

Account-level AWS infrastructure for the BLANXLAIT organization, managed with CDK.

## Stacks

| Stack | Purpose |
|-------|---------|
| `GitHubOidc` | OIDC provider + IAM role for GitHub Actions |
| `CloudTrail` | Management event trail with cost-optimized S3 storage |

## Deployment

Pushes to `main` automatically deploy via GitHub Actions.

For manual deployment:
```bash
cd cdk
npm install
npx cdk deploy --all
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

## AWS Account

- Account ID: `982682372189`
- Region: `us-east-1`
