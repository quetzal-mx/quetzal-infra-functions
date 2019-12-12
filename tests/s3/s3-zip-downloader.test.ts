import * as S3 from 'aws-sdk/clients/s3';
import { generateZip, promisedRandomBytes } from '../helpers';
import { S3ZipDownloader, IS3ZipDownloaderDependencies } from '../../src/s3';
import { JSZip } from '../../src/zip';

describe('S3ZipDownloader', () => {
  describe('#downloadFile', () => {
    const zip = new JSZip();
    let mockedFile: Buffer;
    let mockedBody: Buffer;
    let mockedGetObject: jest.Mock;
    let mockClient: S3;

    const mockClientConstructor = jest.fn().mockImplementation(() => (
      {
        getObject: mockedGetObject
      }
    )) as jest.Mock<S3>;

    const dependenciesFactory = (): IS3ZipDownloaderDependencies => ({
      client: mockClient,
      zip,
    });

    beforeAll(async () => {
      mockedFile = await promisedRandomBytes(256);
      mockedBody = await generateZip([{buffer: mockedFile, fileName: 'test'}]);
      mockedGetObject = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Body: mockedBody })
      });
      mockClient = new mockClientConstructor();
    });

    it('downloads the file and returns a ZipFile object', async () => {
      const downloader = new S3ZipDownloader(dependenciesFactory);
      const result = await downloader.downloadFile({key: 'the_file', bucket: 'bucket'});

      await expect(result.file('test')).resolves.toEqual(mockedFile);
    });
  });
});
