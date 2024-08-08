import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
    public readonly vpc: ec2.IVpc;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Lookup existing VPC by name
        this.vpc = ec2.Vpc.fromLookup(this, 'ExistingVpc', {
            vpcName: 'career-sandbox'
        });
    }
}