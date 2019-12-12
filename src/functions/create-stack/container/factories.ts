import { Container, interfaces } from 'inversify';
import { S3Downloader } from '../../../s3';
import { JSZip } from '../../../zip';
import * as CloudFormation from 'aws-sdk/clients/cloudformation';

import { 
  IS3ZipDownloadUseCaseDependencies,
  ICreateStackUseCaseDependencies,
  S3ZipDownloadUseCase,
  CreateStackUseCase,
  ICheckStackStatusUseCaseDependencies,
  CheckSuccessStackStatusUseCase
} from '../../../use-cases';

const container = new Container();

container.bind<interfaces.Factory<IS3ZipDownloadUseCaseDependencies>>('Factory<IS3ZipDownloadUseCaseDependencies>')
  .toFactory<IS3ZipDownloadUseCaseDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      s3Downloader: cont.get(S3Downloader),
      zip: cont.get(JSZip),
    }
  });

container.bind<interfaces.Factory<S3ZipDownloadUseCase>>('Factory<S3ZipDownloadUseCase>')
  .toFactory<S3ZipDownloadUseCase>((context: interfaces.Context) => () => (
    context.container.get(S3ZipDownloadUseCase)
  ));

container.bind<interfaces.Factory<ICheckStackStatusUseCaseDependencies>>('Factory<ICheckStatusUseCaseDependencies>')
  .toFactory<ICheckStackStatusUseCaseDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      cfnClient: cont.get<CloudFormation>('CloudFormationClient')
    };
  });

container.bind<interfaces.Factory<CheckSuccessStackStatusUseCase>>('Factory<CheckSuccessStackStatusUseCase>')
 .toFactory<CheckSuccessStackStatusUseCase>((context: interfaces.Context) => () => {
    const cont = context.container;

    return cont.get(CheckSuccessStackStatusUseCase);
 });

container.bind<interfaces.Factory<ICreateStackUseCaseDependencies>>('Factory<ICreateStackUseCaseDependencies>')
  .toFactory<ICreateStackUseCaseDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      cfnClient: cont.get<CloudFormation>('CloudFormationClient'),
      s3ZipDownloadUseCaseFactory: cont.get('Factory<S3ZipDownloadUseCase>'),
      checkSuccessStackStatusUseCaseFactory: cont.get('Factory<CheckSuccessStackStatusUseCase>')
    }
  });

container.bind<interfaces.Factory<CreateStackUseCase>>('Factory<CreateStackUseCaseFactory>')
  .toFactory<CreateStackUseCase>((context: interfaces.Context) => () => {
    const cont = context.container;

    return cont.get(CreateStackUseCase);
  });

export default container;
