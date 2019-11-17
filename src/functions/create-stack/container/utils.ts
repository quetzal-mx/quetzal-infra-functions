import { Container } from 'inversify';
import { S3Downloader } from '../../../s3-downloader';
import { JSZip } from '../../../zip';

const container = new Container();

container.bind(S3Downloader).toSelf();
container.bind(JSZip).toSelf();

export default container;