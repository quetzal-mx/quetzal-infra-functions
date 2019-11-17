import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { getLogger } from 'log4js';
import { S3Downloader } from './s3-downloader';

const logger = getLogger('S3Downloader');

export default class S3DownloaderAspect {
  @aroundMethod({
    classes: [S3Downloader],
    methodNamePattern: /downloadFile/
  })
  public async logDownloadFile(meta: Metadata) {
    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info(`Called 'getObject'`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return;
    }

    logger.info(`Calling 'getObject' with ${JSON.stringify(meta.method.args, null, 1)}`);
  }

  @asyncOnThrowOfMethod({
    classes: [S3Downloader],
    methodNamePattern: /downloadFile/
  })
  public async handleError(meta: Metadata) {
    logger.error(`An error occurred while calling '${meta.method.name}': ${meta.method.exception}, with stack: ${meta.method.exception.stack}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }
}
