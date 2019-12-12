import { CodePipelineHandler } from 'aws-lambda';
import '../../logger';
import container from './container';
import 'source-map-support/register';
import { UploadZipS3Handler } from '../../handlers';

export const handle: CodePipelineHandler = async(event) => {
  const handler = container.get(UploadZipS3Handler);

  return await handler.handle(event);
};
