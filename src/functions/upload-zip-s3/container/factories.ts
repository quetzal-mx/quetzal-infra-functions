import { Container, interfaces } from 'inversify';
import { UploadZipS3UseCase, IUploadZipS3UseCaseDependencies } from '../../../use-cases';
import * as CloudFormation from 'aws-sdk/clients/cloudformation';
import { S3ZipDownloader, S3Uploader, IS3ZipDownloaderDependencies } from '../../../s3';
import { JSZip } from '../../../zip';

const container = new Container();

container.bind<interfaces.Factory<IS3ZipDownloaderDependencies>>('Factory<IS3ZipDownloaderDependencies>')
  .toFactory<IS3ZipDownloaderDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      client: cont.get('S3Client'),
      zip: cont.get(JSZip),
    }
  });

container.bind<interfaces.Factory<IUploadZipS3UseCaseDependencies>>('Factory<IUploadZipS3UseCaseDependencies>')
  .toFactory<IUploadZipS3UseCaseDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      cfnClient: cont.get<CloudFormation>('CloudFormationClient'),
      downloader: cont.get(S3ZipDownloader),
      uploader: cont.get(S3Uploader),
    }
  });

container.bind<interfaces.Factory<UploadZipS3UseCase>>('Factory<UploadZipS3UseCase>')
  .toFactory<UploadZipS3UseCase>((context: interfaces.Context) => () => {
    const cont = context.container;

    return cont.get(UploadZipS3UseCase);
  });

export default container;
