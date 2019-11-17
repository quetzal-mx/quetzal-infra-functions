import { Container } from 'inversify';
import * as S3 from 'aws-sdk/clients/s3';
import * as Cloudformation from 'aws-sdk/clients/cloudformation';
import * as AWS from 'aws-sdk/global';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';

AWS.config.region = 'us-west-2';

const container = new Container();

container.bind('S3Client').toConstantValue(new S3());

container.bind('CloudFormationClient').toConstantValue(new Cloudformation());

container.bind('CodePipelineClient').toConstantValue(new CodePipeline());

export default container;