import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';
import * as Cloudformation from 'aws-sdk/clients/cloudformation';
import { S3ZipDownloadUseCase } from '../s3-zip-download';
import 'reflect-metadata';
import UnhandledError from '../exceptions/unhandled-error';
import { CheckSuccessStackStatusUseCase } from '../check-stack-status';

export interface ICreateStackUseCaseDependencies {
  cfnClient: Cloudformation;
  s3ZipDownloadUseCaseFactory: () => S3ZipDownloadUseCase;
  checkSuccessStackStatusUseCaseFactory: () => CheckSuccessStackStatusUseCase;
}

export interface ICreateStackUseCaseParams {
  stackName: string;
  bucket: string;
  key: string;
  fileName: string;
}

@Advised()
@injectable()
export class CreateStackUseCase {
  private cfnClient: Cloudformation;
  private s3ZipDownloadUseCaseFactory: () => S3ZipDownloadUseCase;
  private checkSuccessStackStatusUseCaseFactory: () => CheckSuccessStackStatusUseCase;

  constructor(
    @inject('Factory<ICreateStackUseCaseDependencies>')
    dependenciesFactory: () => ICreateStackUseCaseDependencies
  ) {
    const { 
      cfnClient, 
      s3ZipDownloadUseCaseFactory,
      checkSuccessStackStatusUseCaseFactory,
    } = dependenciesFactory();

    this.cfnClient = cfnClient;
    this.s3ZipDownloadUseCaseFactory = s3ZipDownloadUseCaseFactory;
    this.checkSuccessStackStatusUseCaseFactory = checkSuccessStackStatusUseCaseFactory;
  } 

  public async execute(params: ICreateStackUseCaseParams): Promise<void> {
    const { stackName, ...rest } = params;
    const stackExists = await this.stackExists(stackName);

    if (!stackExists) {
      const s3ZipDownloadUseCase = this.s3ZipDownloadUseCaseFactory();
      const cfnTemplate = await s3ZipDownloadUseCase.execute(rest);

      await this.createStack(params.stackName, cfnTemplate.toString());
    }

    await this.checkStackStatus(stackName);
  }

  private async stackExists(stackName: string): Promise<boolean> {
    try {
      const callParams = { StackName: stackName }; 

      await this.cfnClient.describeStacks(callParams).promise();

      return true;
    } catch (error) {
      if (error.code && error.code === 'ValidationError') {
        return false;
      }

      throw new UnhandledError(error);
    }
  }

  private async createStack(stackName: string, template: string): Promise<void> {
    const params = {
      StackName: stackName,
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      TemplateBody: template,
    };

    await this.cfnClient.createStack(params).promise();
  }
  
  private async checkStackStatus(stackName: string) {
    const useCase = this.checkSuccessStackStatusUseCaseFactory();
    const created = await useCase.execute({ stackName });

    if (!created) {
      throw new Error(`Stack ${stackName} was not created`);
    }
  }
}
