import { Container } from 'inversify';
import * as S3 from 'aws-sdk/clients/s3';
import * as AWS from 'aws-sdk/global';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';
import * as CloudFormation from 'aws-sdk/clients/cloudformation';

AWS.config.region = 'us-west-2';

const container = new Container();

container.bind('S3Client').toConstantValue(new S3());
container.bind('CodePipelineClient').toConstantValue(new CodePipeline());
container.bind('CloudFormationClient').toConstantValue(new CloudFormation());

export default container;
