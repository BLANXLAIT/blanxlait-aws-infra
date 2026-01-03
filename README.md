# BLANXLAIT AWS Infrastructure

Account-level AWS infrastructure for the BLANXLAIT organization.

## What's Here

| Template | Purpose | Deploy Frequency |
|----------|---------|------------------|
| `github-oidc-provider.yaml` | GitHub Actions OIDC authentication | Once per account |
| `github-actions-role.yaml` | IAM role for GitHub Actions | Once (org-wide) or per-repo |

## Initial Setup

Run these commands in AWS CloudShell or with configured AWS CLI:

```bash
# 1. Deploy OIDC Provider (required, one-time)
aws cloudformation deploy \
  --template-file github-oidc-provider.yaml \
  --stack-name GitHubOIDC \
  --region us-east-1

# 2. Deploy org-wide GitHub Actions role
aws cloudformation deploy \
  --template-file github-actions-role.yaml \
  --stack-name GitHubActionsRole \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubOrg=BLANXLAIT RepoScope="*" \
  --region us-east-1
```

## Using in Other Repos

Any repo in the BLANXLAIT org can now use this in their GitHub Actions:

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::982682372189:role/GitHubActionsRole
    aws-region: us-east-1
```

## Adding More Roles

For restricted access roles (e.g., read-only for CI):

```bash
aws cloudformation deploy \
  --template-file github-actions-role.yaml \
  --stack-name GitHubActionsRole-ReadOnly \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    RoleName=GitHubActionsRole-ReadOnly \
    GitHubOrg=BLANXLAIT \
    RepoScope="*" \
    PermissionLevel=ReadOnly \
  --region us-east-1
```

## AWS Account

- Account ID: `982682372189`
- Primary Region: `us-east-1`
