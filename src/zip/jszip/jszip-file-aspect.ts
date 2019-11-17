import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { JSZipFile } from './jszip-file';
import { getLogger } from 'log4js';

const logger = getLogger('JSZipFile');

export default class JSZipFileAspect {
  @aroundMethod({
    classes: [JSZipFile],
    methodNamePattern: /file/
  })
  public async logFile(meta: Metadata) {
    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info(`Extracted file ${meta.method.args[0]} from zip file`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Extracting file ${meta.method.args[0]} from zip file`);
  }

  @asyncOnThrowOfMethod({
    classes: [JSZipFile],
    methodNamePattern: /file/
  })
  public async handleFile(meta: Metadata) {
    logger.error(`An error occurred while extracting file ${meta.method.args[0]} from zip file: ${meta.method.exception}, stack ${meta.method.exception.stacl}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }
}
