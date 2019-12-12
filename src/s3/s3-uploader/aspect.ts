import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { S3Uploader } from './uploader';
import { getLogger } from 'log4js';

const logger = getLogger('S3Uploader');

export default class S3UploaderAspect {
  @aroundMethod({
    classes: [S3Uploader],
    methodNamePattern: /upload/
  })
  public async logUpload(meta: Metadata) {
    const { bucket, key } = meta.method.args[0];
    const destination = `${bucket}/${key}`;

    if (meta.method.result) {
      try {
        await meta.method.result;

        logger.info(`Uploaded file to ${destination}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return;
    }

    logger.info(`Uploading file to ${destination}`);
  }

  @asyncOnThrowOfMethod({
    classes: [S3Uploader],
    methodNamePattern: /.*/,
  })
  public async handleException(meta: Metadata) {
    logger.error(`An error occurred while calling '${meta.method.name}': ${meta.method.exception}, with stack: ${meta.method.exception.stack}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }
}
