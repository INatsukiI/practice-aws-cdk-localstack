import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'CreateBucket', {
      bucketName: 'my-bucket-name',
      versioned: true,
    })

    const topic = new sns.Topic(this, 'NotificationTopic', {
      displayName: 'S3 Upload Notifications'
    });

    topic.addSubscription(new subscriptions.EmailSubscription(process.env.EMAIL_SUBSCRIPTION as string));

    const handler = new lambda.Function(this, 'NotificationHandler', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'notification.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TOPIC_ARN: topic.topicArn
      }
    });

    topic.grantPublish(handler);
    
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(handler)
    );
  }
}
