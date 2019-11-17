import { S3ZipDownloadUseCase, IS3ZipDownloadUseCaseDependencies } from '../../src/use-cases';
import { IS3Downloader } from '../../src/s3-downloader';
import { IZipFile, IZip } from '../../src/zip';
import { promisedRandomBytes } from '../helpers';

describe('S3ZipDownloadUseCase', () => {
  describe('#execute', () => {
    let zippedFile: Buffer;
    let mockedDownloadFile: jest.Mock;

    const mockS3DownloaderConstructor = jest.fn().mockImplementation(() => ({
      downloadFile: mockedDownloadFile,
    })) as jest.Mock<IS3Downloader>;

    let cfnFile: Buffer;
    let mockedFile;

    const mockIZipFileConstructor = jest.fn().mockImplementation(() => ({
      file: mockedFile
    })) as jest.Mock<IZipFile>;

    let mockedUnzip;

    const mockIZipConstructor = jest.fn().mockImplementation(() => ({
      unzip: mockedUnzip
    })) as jest.Mock<IZip>;

    const dependenciesFactory = (): IS3ZipDownloadUseCaseDependencies => ({
      s3Downloader: new mockS3DownloaderConstructor(),
      zip: new mockIZipConstructor(),
    });

    beforeAll(async () => {
      zippedFile = await promisedRandomBytes(256);
      mockedDownloadFile = jest.fn().mockResolvedValue(zippedFile);

      cfnFile = await promisedRandomBytes(256);
      mockedFile = jest.fn().mockResolvedValue(cfnFile);

      mockedUnzip = jest.fn().mockResolvedValue(new mockIZipFileConstructor());
    });

    it('retrieves the cfn template from a zip file', async () => {
      const useCase = new S3ZipDownloadUseCase(dependenciesFactory);
      const fileParams = { bucket: 'bucket', key: 'key', fileName: 'fileName' }
      const { fileName, ...rest } = fileParams;

      await useCase.execute(fileParams);

      expect(mockedDownloadFile.mock.calls[0][0]).toStrictEqual(rest);
      expect(mockedUnzip.mock.calls[0][0]).toEqual(zippedFile);
      expect(mockedFile.mock.calls[0][0]).toEqual(fileName);
    });
  });
});