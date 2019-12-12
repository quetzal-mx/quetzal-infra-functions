import { asyncOnThrowOfMethod, aroundMethod, Metadata } from 'aspect.js';
import { getLogger } from 'log4js';
import { UploadZipS3UseCase } from './upload-zip-s3';

const logger = getLogger('UploadZipS3UseCase');

export default class UploadZipS3Aspect {
  @aroundMethod({
    classes: [UploadZipS3UseCase],
    methodNamePattern: /execute/,
  })
  public async logExecute(meta: Metadata) {
    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info(`UploadZipS3UseCase executed`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Executing UploadZipS3UseCase with ${JSON.stringify(meta.method.args, null, 1)}`);
  }

  @asyncOnThrowOfMethod({
    classes: [UploadZipS3UseCase],
    methodNamePattern: /.*/,
  })
  public async handleException(meta: Metadata) {
    logger.error(`An error occurred while calling '${meta.method.name}': ${meta.method.exception}, with stack: ${meta.method.exception.stack}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }

  @aroundMethod({
    classes: [UploadZipS3UseCase],
    methodNamePattern: /parseServerlessState/,
  })
  public async logParseServerlessState(meta: Metadata) {
    if (meta.method.result) {
      try {
        const result = await meta.method.result;

        logger.info(`Serverless state parsed: ${JSON.stringify(result, null, 1)}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Parsing serverless state from: ${JSON.stringify(meta.method.args[1], null, 1)}`);
  }

  @aroundMethod({
    classes: [UploadZipS3UseCase],
    methodNamePattern: /getBucketName/,
  })
  public async getBucketName(meta: Metadata) {
    if (meta.method.result) {
      try {
        const result = await meta.method.result;

        logger.info(`Bucket name: ${result}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Getting bucket name with: ${JSON.stringify(meta.method.args, null, 1)}`);
  }
}
