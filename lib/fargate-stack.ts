import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

interface FargateStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
}

export class FargateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: FargateStackProps) {
        super(scope, id, props);

        const cluster = new ecs.Cluster(this, 'EcsCluster', {
            vpc: props.vpc,
        });

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef');

        const container = taskDefinition.addContainer('NginxContainer', {
            image: ecs.ContainerImage.fromRegistry('nginx'),
            memoryLimitMiB: 512,
        });

        container.addPortMappings({
            containerPort: 80,
        });

        const fargateService = new ecs.FargateService(this, 'FargateService', {
            cluster,
            taskDefinition,
            assignPublicIp: false,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
            vpc: props.vpc,
            internetFacing: true,
        });

        const listener = lb.addListener('Listener', {
            port: 8080,
        });

        listener.addTargets('EcsTargets', {
            port: 80,
            targets: [fargateService],
        });

        // Bonus: Add CloudFront distribution
        new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: { origin: new origins.LoadBalancerV2Origin(lb) },
        });

        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: lb.loadBalancerDnsName,
        });
    }
}