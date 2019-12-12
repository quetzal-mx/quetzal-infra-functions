import { Container, interfaces } from 'inversify';
import { IUploadZipS3HandlerDependencies, UploadZipS3Handler} from '../../../handlers';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';

const container = new Container();

container.bind<interfaces.Factory<IUploadZipS3HandlerDependencies>>('Factory<IUploadZipS3HandlerDependencies>')
  .toFactory<IUploadZipS3HandlerDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      codePipelineClient: cont.get<CodePipeline>('CodePipelineClient'),
      useCaseFactory: cont.get('Factory<UploadZipS3UseCase>')
    }
  });

container.bind(UploadZipS3Handler).toSelf();

export default container;
