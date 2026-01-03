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
# OIDC Provider (one-time)
aws cloudformation deploy \
  --template-file github-oidc-provider.yaml \
  --stack-name GitHubOIDC \
  --region us-east-1

# GitHub Actions Role
aws cloudformation deploy \
  --template-file github-actions-role.yaml \
  --stack-name GitHubActionsRole \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubOrg=BLANXLAIT RepoScope="*" \
  --region us-east-1
```

## Role ARN for Workflows

```
arn:aws:iam::982682372189:role/GitHubActionsRole
```
