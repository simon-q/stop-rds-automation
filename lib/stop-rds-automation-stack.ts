import {
  Stack,
  StackProps,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_events as events,
  Duration
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import config from '../config';

export class StopRdsAutomationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, 'SSMRole', {
      assumedBy: new iam.ServicePrincipal('ssm.amazonaws.com'),
      inlinePolicies: {
        StopRDSPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['rds:Describe*', 'rds:Start*', 'rds:Stop*', 'rds:Reboot*'],
              resources: ['*']
            })
          ]
        })
      }
    });

    new ssm.CfnAssociation(this, 'Association', {
      name: 'AWS-StopRdsInstance',
      parameters: {
        InstanceId: [config.InstanceId],
        AutomationAssumeRole: [role.roleArn]
      },
      scheduleExpression: events.Schedule.rate(Duration.hours(1)).expressionString
    });
  }
}
