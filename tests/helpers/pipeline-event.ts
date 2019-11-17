import { CodePipelineEvent } from 'aws-lambda';
import { v4 } from 'uuid';

export const createDummyCreateStackEvent = (): CodePipelineEvent => ({
  'CodePipeline.job': {
    accountId: v4(),
    id: v4(),
    data: {
      actionConfiguration: {
        configuration: {
          FunctionName: v4(),
          UserParameters: JSON.stringify({
            stackName: v4(),
            fileName: v4(),
          }),
        }
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
