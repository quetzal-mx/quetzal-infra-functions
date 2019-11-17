import { CreateStackUseCase, getCreateStackUseCaseDataFromEvent } from '../../use-cases';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';
import { CodePipelineEvent } from 'aws-lambda';
import { v4 } from 'uuid';
import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';

export interface ICreateStackHandlerDependencies {
  useCaseFactory: () => CreateStackUseCase;
  codePipelineClient: CodePipeline;
}

@Advised()
@injectable()
export class CreateStackHandler {
  private codePipelineClient: CodePipeline;
  private useCase: CreateStackUseCase;

  constructor(
    @inject('Factory<ICreateStackHandlerDependencies>')
    dependenciesFactory: () => ICreateStackHandlerDependencies
  ) {
    const { codePipelineClient, useCaseFactory } = dependenciesFactory();

    this.codePipelineClient = codePipelineClient;
    this.useCase = useCaseFactory();
  }

  public async handle(event: CodePipelineEvent): Promise<void> {
    const jobId = event['CodePipeline.job'].id;
    const useCaseParams = getCreateStackUseCaseDataFromEvent(event);
    try {
      await this.useCase.execute(useCaseParams);
      await this.putJobSuccessResult(jobId, useCaseParams.stackName);
    } catch(_) {
      await this.putJobFailureResult(jobId, useCaseParams.stackName);
    }
  }

  private async putJobSuccessResult(jobId: string, stackName: string) {
    return await this.codePipelineClient.putJobSuccessResult({
      jobId, 
      executionDetails: {
        externalExecutionId: v4(),
        percentComplete: 100,
        summary: `Created stack ${stackName}`
      }
    }).promise();
  }

  private async putJobFailureResult(jobId: string, stackName: string) {
    return await this.codePipelineClient.putJobFailureResult({
      jobId,
      failureDetails: {
        externalExecutionId: v4(),
        message: `Failed to create stack ${stackName}`,
        type: 'JobFailed',
      }
    }).promise();
  }
}
