import { Container, interfaces } from 'inversify';
import { CreateStackHandler, ICreateStackHandlerDependencies } from '../../../handlers';
import * as CodePipeline from 'aws-sdk/clients/codepipeline';

const container = new Container();

container.bind<interfaces.Factory<ICreateStackHandlerDependencies>>('Factory<ICreateStackHandlerDependencies>')
  .toFactory<ICreateStackHandlerDependencies>((context: interfaces.Context) => () => {
    const cont = context.container;

    return {
      codePipelineClient: cont.get<CodePipeline>('CodePipelineClient'),
      useCaseFactory: cont.get('Factory<CreateStackUseCaseFactory>')
    }
  });

container.bind(CreateStackHandler).toSelf();

export default container;