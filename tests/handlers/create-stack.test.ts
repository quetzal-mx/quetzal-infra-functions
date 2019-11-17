import { CreateStackHandler, ICreateStackHandlerDependencies } from '../../src/handlers';
import { CreateStackUseCase, getCreateStackUseCaseDataFromEvent } from '../../src/use-cases';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';
import { createDummyCreateStackEvent } from '../helpers';

describe('CreateStackHandler', () => {
  describe('#handle', () => {
    describe('when no errors happen', () => {
      const mockedExecute = jest.fn().mockResolvedValue(undefined);

      const mockCreateStackUseCaseConstructor = jest.fn().mockImplementation(() => ({
        execute: mockedExecute
      })) as jest.Mock<CreateStackUseCase>;

      const mockedPutJobFailureResult = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(undefined)
      });

      const codePipelineClientConstructor = jest.fn().mockImplementation(() => ({
        putJobSuccessResult: mockedPutJobFailureResult
      })) as jest.Mock<CodePipeline>;

      const codePipelineClient = new codePipelineClientConstructor();

      const dependenciesFactory = (): ICreateStackHandlerDependencies => ({
        codePipelineClient,
        useCaseFactory: (): CreateStackUseCase => new mockCreateStackUseCaseConstructor()
      });

      const event = createDummyCreateStackEvent();
      const expectedUseCaseParams = getCreateStackUseCaseDataFromEvent(event);

      it('handles the event and sets success to the job', async () => {
        const handler = new CreateStackHandler(dependenciesFactory);

        await handler.handle(event);

        expect(mockedExecute.mock.calls[0][0]).toStrictEqual(expectedUseCaseParams);
        expect(mockedPutJobFailureResult.mock.calls[0][0]).toHaveProperty('jobId');
        expect(mockedPutJobFailureResult.mock.calls[0][0]).toHaveProperty('executionDetails');
        expect(mockedPutJobFailureResult.mock.calls[0][0].executionDetails.summary).toEqual(`Created stack ${expectedUseCaseParams.stackName}`);
      });
    });

    describe('when errors happen', () => {
      const mockedExecute = jest.fn().mockRejectedValue('Something happened!');

      const mockCreateStackUseCaseConstructor = jest.fn().mockImplementation(() => ({
        execute: mockedExecute
      })) as jest.Mock<CreateStackUseCase>;

      const mockedPutJobFailureResult = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(undefined)
      });

      const codePipelineClientConstructor = jest.fn().mockImplementation(() => ({
        putJobFailureResult: mockedPutJobFailureResult
      })) as jest.Mock<CodePipeline>;

      const codePipelineClient = new codePipelineClientConstructor();

      const dependenciesFactory = (): ICreateStackHandlerDependencies => ({
        codePipelineClient,
        useCaseFactory: (): CreateStackUseCase => new mockCreateStackUseCaseConstructor()
      });

      const event = createDummyCreateStackEvent();
      const expectedUseCaseParams = getCreateStackUseCaseDataFromEvent(event);

      it('handles the event and puts failure to the job', async () => {
        const handler = new CreateStackHandler(dependenciesFactory);

        await handler.handle(event);

        expect(mockedExecute.mock.calls[0][0]).toStrictEqual(expectedUseCaseParams);
        expect(mockedPutJobFailureResult.mock.calls[0][0]).toHaveProperty('jobId');
        expect(mockedPutJobFailureResult.mock.calls[0][0]).toHaveProperty('failureDetails');
        expect(mockedPutJobFailureResult.mock.calls[0][0].failureDetails.message).toEqual(`Failed to create stack ${expectedUseCaseParams.stackName}`);
      });
    });

    describe('when an error ocurred when setting the job status', () => {
      const mockedExecute = jest.fn().mockRejectedValue('Something happened!');

      const mockCreateStackUseCaseConstructor = jest.fn().mockImplementation(() => ({
        execute: mockedExecute
      })) as jest.Mock<CreateStackUseCase>;

      const mockedPutJobFailureResult = jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('An Error'))
      });

      const codePipelineClientConstructor = jest.fn().mockImplementation(() => ({
        putJobFailureResult: mockedPutJobFailureResult
      })) as jest.Mock<CodePipeline>;

      const codePipelineClient = new codePipelineClientConstructor();

      const dependenciesFactory = (): ICreateStackHandlerDependencies => ({
        codePipelineClient,
        useCaseFactory: (): CreateStackUseCase => new mockCreateStackUseCaseConstructor()
      });

      const event = createDummyCreateStackEvent();

      it('fails', async () => {
        const handler = new CreateStackHandler(dependenciesFactory);

        await expect(handler.handle(event)).rejects.toThrowError();
      });
    });
  });
});