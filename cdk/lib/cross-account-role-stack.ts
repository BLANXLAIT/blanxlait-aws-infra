import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export type PermissionLevel = 'Admin' | 'PowerUser' | 'ReadOnly';

export interface CrossAccountDeployRoleStackProps extends cdk.StackProps {
  /** Account ID where the GitHubActionsRole lives (management account) */
  trustedAccountId: string;
  /** Name of the role in the trusted account */
  trustedRoleName?: string;
  /** Permission level for this deployment role */
  permissionLevel: PermissionLevel;
  /** Name for this deployment role */
  roleName?: string;
}

/**
 * Creates a deployment role in a target account that can be assumed
 * by the GitHubActionsRole from the management account.
 *
 * Deploy this stack to each member account you want to deploy to.
 */
export class CrossAccountDeployRoleStack extends cdk.Stack {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: CrossAccountDeployRoleStackProps) {
    super(scope, id, props);

    const {
      trustedAccountId,
      trustedRoleName = 'GitHubActionsRole',
      permissionLevel,
      roleName = 'GitHubDeployRole',
    } = props;

    const trustedRoleArn = `arn:aws:iam::${trustedAccountId}:role/${trustedRoleName}`;

    // Select managed policy based on permission level
    const managedPolicies: Record<PermissionLevel, iam.IManagedPolicy> = {
      Admin: iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      PowerUser: iam.ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess'),
      ReadOnly: iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
    };

    // Create role that trusts the GitHubActionsRole from management account
    // Include sts:TagSession for GitHub Actions configure-aws-credentials
    this.role = new iam.Role(this, 'GitHubDeployRole', {
      roleName,
      assumedBy: new iam.ArnPrincipal(trustedRoleArn).withSessionTags(),
      managedPolicies: [managedPolicies[permissionLevel]],
    });

    // Outputs
    new cdk.CfnOutput(this, 'RoleArn', {
      value: this.role.roleArn,
      description: 'ARN of the cross-account deployment role',
    });

    new cdk.CfnOutput(this, 'TrustedBy', {
      value: trustedRoleArn,
      description: 'Role that can assume this deployment role',
    });
  }
}
