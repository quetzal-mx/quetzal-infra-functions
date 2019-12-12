import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';
import { IS3Downloader } from '../../s3';
import { IZip } from '../../zip';

export interface IS3ZipDownloadUseCaseDependencies {
  s3Downloader: IS3Downloader;
  zip: IZip;
}

export interface IS3ZipDownloadUseCaseParams {
  bucket: string;
  key: string
  fileName: string;
}

@Advised()
@injectable()
export class S3ZipDownloadUseCase {
  private s3Downloader: IS3Downloader;
  private zip: IZip;

  constructor(
    @inject('Factory<IS3ZipDownloadUseCaseDependencies>')
    dependencyFactory: () => IS3ZipDownloadUseCaseDependencies) {
    const { s3Downloader, zip } = dependencyFactory();

    this.s3Downloader = s3Downloader;
    this.zip = zip;
  }

  public async execute(params: IS3ZipDownloadUseCaseParams): Promise<Buffer> {
    const { fileName, ...rest } = params;
    const zipped = await this.s3Downloader.downloadFile(rest) as Buffer;
    const zipFile = await this.zip.unzip(zipped);

    return await zipFile.file(fileName);
  }
};
