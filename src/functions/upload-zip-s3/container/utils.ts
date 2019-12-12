import { Container } from 'inversify';
import { S3Uploader, S3ZipDownloader } from '../../../s3';
import { JSZip } from '../../../zip';

const container = new Container();

container.bind(JSZip).toSelf();
container.bind(S3ZipDownloader).toSelf();
container.bind(S3Uploader).toSelf();

export default container;