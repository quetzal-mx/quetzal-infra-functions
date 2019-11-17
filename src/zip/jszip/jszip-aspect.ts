import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { JSZip } from './jszip';
import { getLogger } from 'log4js'; 

const logger = getLogger('JSZip');

export default class JSZipAspect {
  @aroundMethod({
    classes: [ JSZip ],
    methodNamePattern: /unzip/
  })
  public async logUnzip(meta: Metadata) {
    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info('File from buffer unzipped');
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info('Unzipping file from buffer');
  }

  @asyncOnThrowOfMethod({
    classes:[ JSZip ],
    methodNamePattern: /unzip/
  })
  public async handleError(meta: Metadata) {
    logger.error(`An error ocurred while unzipping file: ${meta.method.exception}, with stack ${meta.method.exception.stack}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }
}
