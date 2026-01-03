# BLANXLAIT AWS Infrastructure

Account-level AWS infrastructure. Deploy via CloudShell or AWS CLI.

## Account Info

- **Account ID**: 982682372189
- **Region**: us-east-1
- **Org**: BLANXLAIT (GitHub)

## Templates

| File | Stack Name | Purpose |
|------|------------|---------|
| `github-oidc-provider.yaml` | GitHubOIDC | OIDC provider for GitHub Actions |
| `github-actions-role.yaml` | GitHubActionsRole | IAM role for deployments |

## Deployment Commands

```bash
# OIDC Provider (skip if already exists in account)
aws cloudformation deploy \
  --template-file github-oidc-provider.yaml \
  --stack-name GitHubOIDC \
  --region us-east-1

# GitHub Actions Role (works regardless of how OIDC provider was created)
aws cloudformation deploy \
  --template-file github-actions-role.yaml \
  --stack-name GitHubActionsRole \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubOrg=BLANXLAIT RepoScope="*" \
  --region us-east-1
```

Note: The role template references the OIDC provider by ARN directly, so it works whether the provider was created via this template, CDK, or any other method.

## Role ARN for Workflows

```
arn:aws:iam::982682372189:role/GitHubActionsRole
```
