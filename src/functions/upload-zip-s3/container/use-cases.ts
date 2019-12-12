import { Container } from 'inversify';
import { UploadZipS3UseCase } from '../../../use-cases';

const container = new Container();

container.bind(UploadZipS3UseCase).toSelf();

export default container;
