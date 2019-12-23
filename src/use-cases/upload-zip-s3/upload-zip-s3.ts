import { S3ZipDownloader, S3Uploader } from '../../s3';
import * as Cloudformation from 'aws-sdk/clients/cloudformation';
import { Advised } from 'aspect.js';
import { injectable, inject } from 'inversify';
import { IZipFile } from '../../zip';

export interface IUploadZipS3UseCaseDependencies {
  cfnClient: Cloudformation;
  uploader: S3Uploader;
  downloader: S3ZipDownloader;
}

export interface IUploadZipS3UseCaseParams {
  metaDataFileName: string;
  sourceFileName: string;
  zipKey: string;
  zipSourceBucket: string;
  stackName: string;
  destinationBucketLogicalId: string;
}

interface IServerlessState {
  package: { artifactDirectoryName: string };
}

@Advised()
@injectable()
export class UploadZipS3UseCase {
  private cfnClient: Cloudformation;
  private uploader: S3Uploader;
  private downloader: S3ZipDownloader;

  constructor(
    @inject('Factory<IUploadZipS3UseCaseDependencies>')
    dependenciesFactory: () => IUploadZipS3UseCaseDependencies
  ) {
    const { cfnClient, uploader, downloader} = dependenciesFactory();

    this.cfnClient = cfnClient;
    this.uploader = uploader;
    this.downloader = downloader;
  }

  public async execute(params: IUploadZipS3UseCaseParams) {
    const {
      metaDataFileName,
      sourceFileName,
      zipKey,
      zipSourceBucket,
      stackName,
      destinationBucketLogicalId,
    } = params;

    const zipFile = await this.downloader.downloadFile({ key: zipKey, bucket: zipSourceBucket});

    const serverlessState = await this.parseServerlessState(zipFile, metaDataFileName);
    const destinationBucketName = await this.getBucketName(destinationBucketLogicalId, stackName);
    const sourceFile = await zipFile.file(sourceFileName);

    await this.uploader.upload({ 
      bucket: destinationBucketName,
      key: `${serverlessState.package.artifactDirectoryName}/${sourceFileName}`,
      body: sourceFile,
    });
  }

  private async parseServerlessState(zipFile: IZipFile, metadataFileName: string): Promise<IServerlessState> {
    const file = await zipFile.file(metadataFileName);
    return JSON.parse(file.toString()) as IServerlessState;
  }

  private async getBucketName(destinationBucketLogicalId: string, stackName: string): Promise<string> {
    const result = await this.cfnClient.describeStackResource({
      StackName: stackName,
      LogicalResourceId: destinationBucketLogicalId,
    }).promise();

    return result.StackResourceDetail.PhysicalResourceId;
  }
}
