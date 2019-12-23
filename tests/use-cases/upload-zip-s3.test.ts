import { generateJSZip, promisedRandomBytes, generateServerlessState } from '../helpers';
import { IZipFile } from '../../src/zip';
import { IUploadZipS3UseCaseDependencies, UploadZipS3UseCase } from '../../src/use-cases';

describe('UploadZipS3UseCase', () => {
  describe('#execute', () => {
    let zip: IZipFile;
    let zipSourceFile: Buffer;
    let downloadFile: jest.Mock;

    const zipKey = 'the/file/to/download.zip';
    const zipSourceBucket = 'source-bucket';
    const stackName = 'stackName';
    const sourceFileName = 'source-code.zip';
    const metaDataFileName = 'serverless-state.json';
    const destinationBucketLogicalId = 'destination-bucket-logical-id';

    const serverlessState = generateServerlessState();
    const serverlessStateJSON = JSON.parse(serverlessState.toString()); 

    const destinationBucket = 'destination-bucket';
    const describeStackResource = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        StackResourceDetail: {
          LogicalResourceId: destinationBucketLogicalId,
          PhysicalResourceId: destinationBucket,
        }
      })
    });

    const upload = jest.fn().mockResolvedValue(null);

    const downloaderConstructor = jest.fn().mockImplementation(() => ({
      downloadFile,
    }));

    const cfnClientConstructor = jest.fn().mockImplementation(() => ({
      describeStackResource,
    }));
    const cfnClient = new cfnClientConstructor();

    const uploaderConstructor = jest.fn().mockImplementationOnce(() => ({
      upload,
    }));
    const uploader = new uploaderConstructor();

    const dependenciesFactory = (): IUploadZipS3UseCaseDependencies => ({
      downloader: new downloaderConstructor(),
      cfnClient,
      uploader,
    });

    beforeAll(async () => {
      zipSourceFile = await promisedRandomBytes(256);

      zip = await generateJSZip([
        { fileName: sourceFileName, buffer: zipSourceFile },
        { fileName: metaDataFileName, buffer: serverlessState }
      ]);

      downloadFile = jest.fn().mockResolvedValue(zip);
    });

    it('extracts the file from the zip and uploads the content to s3', async () => {
      const useCase = new UploadZipS3UseCase(dependenciesFactory);

      await useCase.execute({
        metaDataFileName,
        sourceFileName,
        zipKey,
        zipSourceBucket,
        stackName,
        destinationBucketLogicalId,
      });

      expect(downloadFile).toHaveBeenCalledWith({
        key: zipKey,
        bucket: zipSourceBucket,
      });
      expect(describeStackResource).toHaveBeenCalledWith({
        StackName: stackName,
        LogicalResourceId: destinationBucketLogicalId
      });
      expect(upload).toHaveBeenCalledWith({
        bucket: destinationBucket,
        key: `${serverlessStateJSON['package']['artifactDirectoryName']}/${sourceFileName}`,
        body: zipSourceFile,
      });
    });
  });
});
