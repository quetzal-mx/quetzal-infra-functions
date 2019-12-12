import { S3Downloader } from '../../src/s3';
import * as S3 from 'aws-sdk/clients/s3';

describe('S3Downloader', () => {
  const mockedBody = Buffer.alloc(256);
  const mockedGetObject = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({Body: mockedBody}),
  });

  const mockClientConstructor = jest.fn().mockImplementation(() => (
    {
      getObject: mockedGetObject
    }
  )) as jest.Mock<S3>;

  const mockClient = new mockClientConstructor();

  it('calls the client with the fileName', async () => {
    const downloader = new S3Downloader(mockClient);
    const result = await downloader.downloadFile({key: 'the_file', bucket:'bucket'});

    expect(result).toEqual(mockedBody);
    expect(mockedGetObject.mock.calls[0][0]).toEqual({Bucket: 'bucket', Key: 'the_file'});
  });
});
