import { createDummyUploadZipS3Event } from '../helpers';
import { getUploadZipS3UseCaseDataFromEvent, UploadZipS3UseCase} from '../../src/use-cases';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';
import { IUploadZipS3HandlerDependencies, UploadZipS3Handler } from '../../src/handlers';

describe('UploadZipS3Handler', () => {
  describe('#handle', () => {
    const event = createDummyUploadZipS3Event();
    const {
      metaDataFileName,
      destinationBucketLogicalId,
      sourceFileName,
      stackName,
      zipKey,
      zipSourceBucket,
    } = getUploadZipS3UseCaseDataFromEvent(event);

    const putJobSuccessResult = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(null),
    });

    const codePipelineClientConstructor = jest.fn().mockImplementation(() => ({
      putJobSuccessResult,
    })) as jest.Mock<CodePipeline>;
    const codePipelineClient = new codePipelineClientConstructor();

    const execute = jest.fn().mockResolvedValue(null);
    const useCaseConstructor = jest.fn().mockImplementation(() => ({
      execute,
    })) as jest.Mock<UploadZipS3UseCase>;

    const dependenciesFactory = (): IUploadZipS3HandlerDependencies => ({
      useCaseFactory: () => new useCaseConstructor(),
      codePipelineClient,
    });

    it('handles the event', async () => {
      const handler = new UploadZipS3Handler(dependenciesFactory);

      await handler.handle(event);

      expect(execute).toHaveBeenCalledWith({
        metaDataFileName,
        sourceFileName,
        zipKey,
        zipSourceBucket,
        stackName,
        destinationBucketLogicalId,
      });

      expect(putJobSuccessResult).toHaveBeenCalled();
    });
  });
});
