import { aroundMethod, asyncOnThrowOfMethod, Metadata} from 'aspect.js';
import { UploadZipS3Handler } from './upload-zip-s3';
import { getLogger } from 'log4js';

const logger = getLogger('UploadZipS3Handler');

export default class UploadZipS3HandlerAspect {
  @aroundMethod({
    classes: [UploadZipS3Handler],
    methodNamePattern: /handle/
  })
  public async logHandle(data: Metadata) {
   if (data.method.result) {
     try {
      await data.method.result;
      logger.info(`Finished handling event`);
     } catch(_) {
       data.method.result = Promise.resolve();
     }

     return data.method.result;
   }

   logger.info(`Handling event ${JSON.stringify(data.method.args[0], null, 1)}`);
  }

  @aroundMethod({
    classes: [UploadZipS3Handler],
    methodNamePattern: /putJob.*/
  })
  public async logPutJobResult(data: Metadata) {
    const params = JSON.stringify(data.method.args, null, 1);

    if (data.method.result) {
      try {
        await data.method.result;
        logger.info(`Called '${data.method.name}' with ${params}`);
      } catch(_) {
        data.method.result = Promise.resolve();
      }

      return data.method.result;
    }

    logger.info(`Calling '${data.method.name}' with ${params}`);
  }

  @asyncOnThrowOfMethod({
    classes: [UploadZipS3Handler],
    methodNamePattern: /(putJob|handle).*/
  })
  public async handleErrors(data: Metadata) {
    logger.error(`An error occurred while calling '${data.method.name}': ${data.method.exception}, with stack: ${data.method.exception.stack}`);

    data.method.result = Promise.reject(data.method.exception);
  }
}
