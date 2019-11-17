import { CodePipelineHandler } from 'aws-lambda';
import '../../logger';
import container from './container';
import 'source-map-support/register';
import { CreateStackHandler } from '../../handlers';

export const handle: CodePipelineHandler = async(event) => {
  const handler = container.get(CreateStackHandler);

  return await handler.handle(event);
};
