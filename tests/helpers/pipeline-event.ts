import { CodePipelineEvent } from 'aws-lambda';
import { v4 } from 'uuid';

interface CodePipelineEventConfiguration {
  FunctionName: string;
  UserParameters: string;
}

const getBaseEvent = (configuration: CodePipelineEventConfiguration): CodePipelineEvent => ({
  'CodePipeline.job': {
    accountId: v4(),
    id: v4(),
    data: {
      actionConfiguration: {
        configuration 
      },
      artifactCredentials: {
        accessKeyId: v4(),
        secretAccessKey: v4(),
        sessionToken: v4()
      },
      inputArtifacts: [
        {
          location: {
            s3Location: {
              bucketName: v4(),
              objectKey: v4(),
            },
            type: 'S3',
          },
          name: v4(),
          revision: v4(),
        }
      ],
      outputArtifacts: []
    }
  }
});

export const createDummyCreateStackEvent = (): CodePipelineEvent => ( 
  getBaseEvent({
    FunctionName: v4(),
    UserParameters: JSON.stringify({
        stackName: v4(),
        fileName: v4(),
    }),
}));

export const createDummyUploadZipS3Event = (): CodePipelineEvent => (
  getBaseEvent({
    FunctionName: v4(),
    UserParameters: JSON.stringify({
        metadataFileName: v4(),
        sourceFileName: v4(),
        stackName: v4(),
        destinationBucketLogicalId: v4(),
    }),
  })
);
