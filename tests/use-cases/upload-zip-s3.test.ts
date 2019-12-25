import { generateJSZip, promisedRandomBytes, generateServerlessState } from '../helpers';
import { IZipFile } from '../../src/zip';
import { IUploadZipS3UseCaseDependencies, UploadZipS3UseCase } from '../../src/use-cases';

describe('UploadZipS3UseCase', () => {
  describe('#execute', () => {
    let zip: IZipFile;
    let downloadFile: jest.Mock;

    const zipKey = 'the/file/to/download.zip';
    const zipSourceBucket = 'source-bucket';
    const stackName = 'stackName';
    const metaDataFileName = 'serverless-state.json';
    const destinationBucketLogicalId = 'destination-bucket-logical-id';

    const serverlessState = generateServerlessState();
    const serverlessStateJSON = JSON.parse(serverlessState.toString()); 

    const sourceFileNames = ['source-code.zip', 'another-source-code.zip'];
    const sourceFiles: Array<{fileName: string, buffer: Buffer}> = [
      {fileName: metaDataFileName, buffer: serverlessState}
    ];

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
      for (let fileName of sourceFileNames) {
        sourceFiles.push({fileName, buffer: await promisedRandomBytes(5)});
      }

      zip = await generateJSZip(sourceFiles);

      downloadFile = jest.fn().mockResolvedValue(zip);
    });

    it('extracts the file from the zip and uploads the content to s3', async () => {
      const useCase = new UploadZipS3UseCase(dependenciesFactory);

      await useCase.execute({
        metaDataFileName,
        sourceFileNames,
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
      expect(upload).toHaveBeenNthCalledWith(1, {
        bucket: destinationBucket,
        key: `${serverlessStateJSON['package']['artifactDirectoryName']}/${sourceFileNames[0]}`,
        body: sourceFiles[1].buffer,
      });
      expect(upload).toHaveBeenNthCalledWith(2, {
        bucket: destinationBucket,
        key: `${serverlessStateJSON['package']['artifactDirectoryName']}/${sourceFileNames[1]}`,
        body: sourceFiles[2].buffer,
      });
    });
  });
});
