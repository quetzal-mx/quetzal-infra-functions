import { CodePipelineEvent } from 'aws-lambda';

export const useParametersfromEvent = (event: CodePipelineEvent) => {
  const { configuration } = event['CodePipeline.job'].data.actionConfiguration;
  return JSON.parse(configuration.UserParameters);
};

export const getCreateStackUseCaseDataFromEvent = (event: CodePipelineEvent) => {
  const artifacts = event['CodePipeline.job'].data.inputArtifacts[0];
  const { location } = artifacts;
  const userParameters = useParametersfromEvent(event);

  return {
    stackName: userParameters.stackName,
    bucket: location.s3Location.bucketName,
    key: location.s3Location.objectKey,
    fileName: userParameters.fileName,
  }
};

export const getUploadZipS3UseCaseDataFromEvent = (event: CodePipelineEvent) => {
  const artifacts = event['CodePipeline.job'].data.inputArtifacts[0];
  const { location } = artifacts;
  const userParameters = useParametersfromEvent(event);

  return {
    metaDataFileName: userParameters.metaDataFileName,
    sourceFileName: userParameters.sourceFileName,
    zipKey: location.s3Location.objectKey,
    zipSourceBucket: location.s3Location.bucketName,
    stackName: userParameters.stackName,
    destinationBucketLogicalId: userParameters.destinationBucketLogicalId,
  }
}
