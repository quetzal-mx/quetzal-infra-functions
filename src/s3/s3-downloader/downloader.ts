import { IS3Downloader, IDownloadFileParams } from './interface';
import * as S3 from 'aws-sdk/clients/s3';
import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';
import 'reflect-metadata';

@Advised()
@injectable()
export class S3Downloader implements IS3Downloader {
  private client: S3;

  constructor(@inject('S3Client') client: S3) {
    this.client = client;
  }

  public async downloadFile(params: IDownloadFileParams): Promise<Buffer> {
    const { bucket, key } = params;
    const request = { Bucket: bucket, Key: key }
    const object = await this.client.getObject(request).promise();

    return object.Body as Buffer;
  }
}