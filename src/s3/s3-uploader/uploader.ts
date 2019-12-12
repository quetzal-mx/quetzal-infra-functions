import { Advised } from 'aspect.js';
import { injectable, inject } from 'inversify';
import * as S3 from 'aws-sdk/clients/s3';

export interface IS3UploaderParams {
  body: Buffer;
  bucket: string;
  key: string;
}

@Advised()
@injectable()
export class S3Uploader {
  constructor(
    @inject('S3Client')
    private client: S3
  ) {}

  public async upload(params: IS3UploaderParams) {
    const { body, bucket, key } = params;

    await this.client.putObject({
      Body: body,
      Bucket: bucket,
      Key: key,
    }).promise();
  }
}
