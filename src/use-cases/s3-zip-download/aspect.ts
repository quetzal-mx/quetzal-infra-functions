import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { S3ZipDownloadUseCase } from './s3-zip-download';
import { getLogger } from 'log4js';

const logger = getLogger('S3ZipDownloadUseCase');

export default class S3ZipDownloadAspect {
  @aroundMethod({
    classes: [S3ZipDownloadUseCase],
    methodNamePattern: /execute/
  })
  public async logExecute(meta: Metadata){
    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info(`Executed S3ZipDonwloadUseCase`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Executing S3ZipDownloadUseCase with ${JSON.stringify(meta.method.args, null, 1)}`);
  }

  @asyncOnThrowOfMethod({
    classes: [S3ZipDownloadUseCase],
    methodNamePattern: /execute/
  })
  public async handleExecute(meta: Metadata) {
    logger.error(`An error ocurred while executing S3ZipDonwloadUseCase: ${meta.method.exception}, with stack ${meta.method.exception.stack}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }
}
