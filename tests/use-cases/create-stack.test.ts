import { CreateStackUseCase, S3ZipDownloadUseCase, ICreateStackUseCaseDependencies, CheckSuccessStackStatusUseCase } from '../../src/use-cases';
import * as Cloudformation from 'aws-sdk/clients/cloudformation';
import { promisedRandomBytes } from '../helpers';

describe('CreateStackUseCase', () => {
  describe('#execute', () => {
    describe('when the stack exists and checks the status', () => {
      const mockedDescribeStacks = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });

      const mockCfnClientConstructor = jest.fn().mockImplementation(() => ({
        describeStacks: mockedDescribeStacks
      })) as jest.Mock<Cloudformation>;

      const cfnClient = new mockCfnClientConstructor();

      const mockS3ZipDownloadUseCaseConstructor = jest.fn().mockImplementation(() => ({
      })) as jest.Mock<S3ZipDownloadUseCase>;

      const mockedCheckStatusExecute = jest.fn().mockResolvedValue(true);

      const mockCheckSuccessStackStatusUseCaseConstructor = jest.fn().mockImplementation(() => ({
        execute: mockedCheckStatusExecute,
      })) as jest.Mock<CheckSuccessStackStatusUseCase>;

      const checkSuccessStackStatusUseCaseFactory = (): CheckSuccessStackStatusUseCase => {
        return new mockCheckSuccessStackStatusUseCaseConstructor();
      };

      const dependenciesFactory = (): ICreateStackUseCaseDependencies => ({
        cfnClient,
        s3ZipDownloadUseCaseFactory: (): S3ZipDownloadUseCase => new mockS3ZipDownloadUseCaseConstructor(),
        checkSuccessStackStatusUseCaseFactory,
      });

      it('does not create it', async () => {
        const useCase = new CreateStackUseCase(dependenciesFactory);
        await useCase.execute({ stackName: 'stackName', bucket: 'bucket', key: 'key', fileName: 'fileName'});

        expect(mockedDescribeStacks.mock.calls[0][0]).toStrictEqual({
          StackName: 'stackName',
        });
      });

    });
  });

  describe('when the stack does not exists', () => {
    const mockedDescribeStacks = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue({
        code: 'ValidationError'
      }),
    });

    const mockedCreateStack = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });

    const mockCfnClientConstructor = jest.fn().mockImplementation(() => ({
      describeStacks: mockedDescribeStacks,
      createStack: mockedCreateStack,
    }));

    const cfnClient = new mockCfnClientConstructor();

    let cfnTemplate: Buffer;
    let mockedExecute: jest.Mock;

    const mockS3ZipDownloadUseCaseConstructor = jest.fn().mockImplementation(() => ({
      execute: mockedExecute,
    }));

    const mockedCheckStatusExecute = jest.fn().mockResolvedValue(true);

    const mockCheckSuccessStackStatusUseCaseConstructor = jest.fn().mockImplementation(() => ({
      execute: mockedCheckStatusExecute,
    })) as jest.Mock<CheckSuccessStackStatusUseCase>;

    const checkSuccessStackStatusUseCaseFactory = (): CheckSuccessStackStatusUseCase => {
      return new mockCheckSuccessStackStatusUseCaseConstructor();
    };

    const s3ZipDownloadUseCaseFactory = (): S3ZipDownloadUseCase => {
      return new mockS3ZipDownloadUseCaseConstructor();
    };

    const dependenciesFactory = (): ICreateStackUseCaseDependencies => ({
      cfnClient,
      s3ZipDownloadUseCaseFactory,
      checkSuccessStackStatusUseCaseFactory,
    });

    beforeAll(async () => {
      cfnTemplate = await promisedRandomBytes(256);
      mockedExecute = jest.fn().mockResolvedValue(cfnTemplate);
    });

    it('creates the stack', async () => {
      const useCase = new CreateStackUseCase(dependenciesFactory);
      await useCase.execute({ stackName: 'stackName', bucket: 'bucket', key: 'key', fileName: 'fileName' });

      expect(mockedExecute.mock.calls[0][0]).toStrictEqual({ bucket: 'bucket', key: 'key', fileName: 'fileName' });
      expect(mockedCreateStack.mock.calls[0][0]).toStrictEqual({
        StackName: 'stackName',
        Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
        TemplateBody: cfnTemplate.toString(),
      });
      expect(mockedCheckStatusExecute).toHaveBeenCalledWith({stackName: 'stackName'});
    });
  });

  describe('when the stack did not end up in a success state', () => {
    const mockedDescribeStacks = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue({
        code: 'ValidationError'
      }),
    });

    const mockedCreateStack = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });

    const mockCfnClientConstructor = jest.fn().mockImplementation(() => ({
      describeStacks: mockedDescribeStacks,
      createStack: mockedCreateStack,
    }));

    const cfnClient = new mockCfnClientConstructor();

    let cfnTemplate: Buffer;
    let mockedExecute: jest.Mock;

    const mockS3ZipDownloadUseCaseConstructor = jest.fn().mockImplementation(() => ({
      execute: mockedExecute,
    }));

    const mockedCheckStatusExecute = jest.fn().mockResolvedValue(false);

    const mockCheckSuccessStackStatusUseCaseConstructor = jest.fn().mockImplementation(() => ({
      execute: mockedCheckStatusExecute,
    })) as jest.Mock<CheckSuccessStackStatusUseCase>;

    const checkSuccessStackStatusUseCaseFactory = (): CheckSuccessStackStatusUseCase => {
      return new mockCheckSuccessStackStatusUseCaseConstructor();
    };

    const s3ZipDownloadUseCaseFactory = (): S3ZipDownloadUseCase => {
      return new mockS3ZipDownloadUseCaseConstructor();
    };

    const dependenciesFactory = (): ICreateStackUseCaseDependencies => ({
      cfnClient,
      s3ZipDownloadUseCaseFactory,
      checkSuccessStackStatusUseCaseFactory,
    });

    beforeAll(async () => {
      cfnTemplate = await promisedRandomBytes(256);
      mockedExecute = jest.fn().mockResolvedValue(cfnTemplate);
    });

    it('throws an error', async () => {
      const useCase = new CreateStackUseCase(dependenciesFactory);

      await expect(useCase.execute({ stackName: 'stackName', bucket: 'bucket', key: 'key', fileName: 'fileName' })).rejects.toThrowError();
      expect(mockedExecute).toHaveBeenCalledWith({ bucket: 'bucket', key: 'key', fileName: 'fileName' });
      expect(mockedCreateStack).toHaveBeenCalledWith({
        StackName: 'stackName',
        Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
        TemplateBody: cfnTemplate.toString(),
      });
      expect(mockedCheckStatusExecute).toHaveBeenCalledWith({stackName: 'stackName'});
    });
  });

  describe('when an error occurs', () => {
    const mockedDescribeStacks = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue({
        code: 'SomeOtherError'
      }),
    });

    const mockCfnClientConstructor = jest.fn().mockImplementation(() => ({
      describeStacks: mockedDescribeStacks,
    }));

    const cfnClient = new mockCfnClientConstructor();

    const mockS3ZipDownloadUseCaseConstructor = jest.fn().mockImplementation(() => ({
    }));

    const mockCheckSuccessStackStatusUseCaseConstructor = jest.fn().mockImplementation(() => ({
    })) as jest.Mock<CheckSuccessStackStatusUseCase>;

    const s3ZipDownloadUseCaseFactory = (): S3ZipDownloadUseCase => {
      return new mockS3ZipDownloadUseCaseConstructor();
    };

    const dependenciesFactory = (): ICreateStackUseCaseDependencies => ({
      cfnClient,
      s3ZipDownloadUseCaseFactory,
      checkSuccessStackStatusUseCaseFactory: (): CheckSuccessStackStatusUseCase => new mockCheckSuccessStackStatusUseCaseConstructor(),
    });

    it('it fails', async () => {
      const useCase = new CreateStackUseCase(dependenciesFactory);
      await expect(useCase.execute({ stackName: 'stackName', bucket: 'bucket', key: 'key', fileName: 'fileName' })).rejects.toThrowError('An error ocurred: SomeOtherError');
    });
  });
});
