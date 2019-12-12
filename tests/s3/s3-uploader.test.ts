import { S3Uploader } from '../../src/s3';
import { promisedRandomBytes } from '../helpers';
import * as S3 from 'aws-sdk/clients/s3';

describe('S3Uploader', () => {
  describe('#execute', () => {
    const putObject = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(null),
    });

    const mockedConstructor = jest.fn().mockImplementation(() => ({ putObject })) as jest.Mock<S3>;
    const client = new mockedConstructor();
    let body: Buffer;

    beforeAll(async () => {
      body = await promisedRandomBytes(256);
    });

    it('uploads the file to the specified s3 bucket with the specified key', async () => {
      const uploader = new S3Uploader(client);

      await uploader.upload({ body, bucket: 'bucket', key: 'key'});

      expect(putObject).toHaveBeenCalledWith({ Body: body, Bucket: 'bucket', Key: 'key'});
    });
  });
});
