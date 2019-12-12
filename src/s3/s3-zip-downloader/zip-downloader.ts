import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';
import * as S3 from 'aws-sdk/clients/s3';
import { IZipFile, IZip } from '../../zip';

export interface IS3ZipDownloaderDependencies {
  zip: IZip;
  client: S3;
}

export interface IS3ZipDownloaderDownloadFileParams {
  key: string;
  bucket: string;
}

@Advised()
@injectable()
export class S3ZipDownloader {
  private zip: IZip;
  private client: S3;

  constructor(
    @inject('Factory<IS3ZipDownloaderDependencies>') 
    dependenciesFactory: () => IS3ZipDownloaderDependencies) {
      const { client, zip } = dependenciesFactory();

      this.client = client;
      this.zip = zip;
  }

  public async downloadFile(params: IS3ZipDownloaderDownloadFileParams): Promise<IZipFile> {
    const { bucket, key } = params;
    const zipped = await this.client.getObject({ 
      Key: key,
      Bucket: bucket,
    }).promise();

    return await this.zip.unzip(zipped.Body as Buffer);
  }
}
