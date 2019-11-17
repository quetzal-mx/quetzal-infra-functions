import { Container } from 'inversify';
import { CreateStackUseCase, S3ZipDownloadUseCase, CheckSuccessStackStatusUseCase } from '../../../use-cases';

const container = new Container();

container.bind(S3ZipDownloadUseCase).toSelf();
container.bind(CreateStackUseCase).toSelf();
container.bind(CheckSuccessStackStatusUseCase).toSelf();

export default container;