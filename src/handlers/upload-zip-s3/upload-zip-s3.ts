import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';
import { UploadZipS3UseCase } from '../../use-cases';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';
import { CodePipelineEvent } from 'aws-lambda';
import { getUploadZipS3UseCaseDataFromEvent } from '../../use-cases';
import { v4 } from 'uuid';

export interface IUploadZipS3HandlerDependencies {
  useCaseFactory: () => UploadZipS3UseCase;
  codePipelineClient: CodePipeline;
}

@Advised()
@injectable()
export class UploadZipS3Handler {
  private useCaseFactory: () => UploadZipS3UseCase;
  private codePipelineClient: CodePipeline;

  constructor(
    @inject('Factory<IUploadZipS3HandlerDependencies>')
    dependenciesFactory: () => IUploadZipS3HandlerDependencies
  ) {
    const { codePipelineClient, useCaseFactory } = dependenciesFactory();

    this.codePipelineClient = codePipelineClient;
    this.useCaseFactory = useCaseFactory;
  }

  public async handle(event: CodePipelineEvent) {
    const useCase = this.useCaseFactory();
    const jobId = event['CodePipeline.job'].id;
    const useCaseParams = getUploadZipS3UseCaseDataFromEvent(event);
    try {
      await useCase.execute(useCaseParams);
      await this.putJobSuccessResult(jobId);
    } catch(_) {
      await this.putJobFailureResult(jobId);
    }
  }

  private async putJobSuccessResult(jobId: string) {
    return await this.codePipelineClient.putJobSuccessResult({
      jobId, 
      executionDetails: {
        externalExecutionId: v4(),
        percentComplete: 100,
        summary: `Zip file uploaded`,
      }
    }).promise();
  }

  private async putJobFailureResult(jobId: string) {
    return await this.codePipelineClient.putJobFailureResult({
      jobId,
      failureDetails: {
        externalExecutionId: v4(),
        message: `Failed to upload zip file`,
        type: 'JobFailed',
      }
    }).promise();
  }
}
