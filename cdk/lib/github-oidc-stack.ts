import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export type PermissionLevel = 'Admin' | 'PowerUser' | 'ReadOnly';

export interface GitHubOidcStackProps extends cdk.StackProps {
  githubOrg: string;
  repoScope: string;
  permissionLevel: PermissionLevel;
  roleName?: string;
  /** Set to true if OIDC provider already exists in the account */
  useExistingProvider?: boolean;
}

export class GitHubOidcStack extends cdk.Stack {
  public readonly role: iam.Role;
  public readonly provider: iam.IOpenIdConnectProvider;

  constructor(scope: Construct, id: string, props: GitHubOidcStackProps) {
    super(scope, id, props);

    const { githubOrg, repoScope, permissionLevel, roleName = 'GitHubActionsRole', useExistingProvider = false } = props;

    // GitHub OIDC Provider - import existing or create new
    if (useExistingProvider) {
      const providerArn = `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`;
      this.provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(this, 'GitHubProvider', providerArn);
    } else {
      this.provider = new iam.OpenIdConnectProvider(this, 'GitHubProvider', {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
        thumbprints: [
          '6938fd4d98bab03faadb97b34396831e3780aea1',
          '1c58a3a8518e8759bf075b76b750d4f2df264fcd',
        ],
      });
    }

    // Select managed policy based on permission level
    const managedPolicies: Record<PermissionLevel, iam.IManagedPolicy> = {
      Admin: iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      PowerUser: iam.ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess'),
      ReadOnly: iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
    };

    // GitHub Actions Role
    this.role = new iam.Role(this, 'GitHubActionsRole', {
      roleName,
      assumedBy: new iam.FederatedPrincipal(
        this.provider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${repoScope}:*`,
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [managedPolicies[permissionLevel]],
    });

    // Outputs
    new cdk.CfnOutput(this, 'RoleArn', {
      value: this.role.roleArn,
      description: 'ARN of the GitHub Actions role',
    });

    new cdk.CfnOutput(this, 'ProviderArn', {
      value: this.provider.openIdConnectProviderArn,
      description: 'ARN of the GitHub OIDC provider',
    });
  }
}
