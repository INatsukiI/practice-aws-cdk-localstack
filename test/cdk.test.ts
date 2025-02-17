import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/cdk-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/cdk-stack.ts
describe('S3 Bucket Tests', () => {
  let app: cdk.App;
  let stack: Cdk.CdkStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new Cdk.CdkStack(app, 'MyTestStack');
    template = Template.fromStack(stack);
  });

  test('S3 Bucket Created with Correct Configuration', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'my-bucket-name',
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    });
  });
});