import * as cdk from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface CloudTrailStackProps extends cdk.StackProps {
  logRetentionDays?: number;
}

export class CloudTrailStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly trail: cloudtrail.Trail;

  constructor(scope: Construct, id: string, props: CloudTrailStackProps = {}) {
    super(scope, id, props);

    const { logRetentionDays = 365 } = props;

    // S3 bucket for CloudTrail logs with cost-optimized lifecycle
    this.bucket = new s3.Bucket(this, 'TrailBucket', {
      bucketName: `cloudtrail-logs-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false, // Cost savings: no versioning for logs
      lifecycleRules: [
        {
          id: 'TransitionToIntelligentTiering',
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
          expiration: cdk.Duration.days(logRetentionDays),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep logs on stack deletion
    });

    // CloudTrail - management events only (cost-optimized)
    this.trail = new cloudtrail.Trail(this, 'ManagementTrail', {
      trailName: 'management-trail',
      bucket: this.bucket,
      isMultiRegionTrail: false, // Single region to reduce costs
      includeGlobalServiceEvents: true, // IAM, CloudFront, etc.
      enableFileValidation: true,
      sendToCloudWatchLogs: false, // CloudWatch Logs adds cost
    });

    // Outputs
    new cdk.CfnOutput(this, 'TrailArn', {
      value: this.trail.trailArn,
      description: 'ARN of the CloudTrail trail',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket for CloudTrail logs',
    });
  }
}
