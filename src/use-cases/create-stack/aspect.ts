import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { CreateStackUseCase } from './create-stack';
import { getLogger } from 'log4js';

const logger = getLogger('CreatStackUseCase');

export default class CreateStackUseCaseAspect {
  @aroundMethod({
    classes: [CreateStackUseCase],
    methodNamePattern: /stackExists/,
  })
  public async logStackExists(meta: Metadata) {
    const stackName = meta.method.args[0];

    if (meta.method.result) {
      try {
        const result = await meta.method.result;
        logger.info(`Stack ${stackName} exists?: ${result}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Calling 'describeStacks' with ${stackName}`);
  }

  @aroundMethod({
    classes: [CreateStackUseCase],
    methodNamePattern: /createStack/,
  })
  public async logCreateStack(meta: Metadata) {
    const stackName = meta.method.args[0];

    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info(`Created stack ${stackName}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Calling 'createStack' with ${JSON.stringify(meta.method.args, null, 1)}`);
  }

  @aroundMethod({
    classes: [CreateStackUseCase],
    methodNamePattern: /execute/,
  })
  public async logExecute(meta: Metadata) {
    if (meta.method.result) {
      try {
        await meta.method.result;
        logger.info(`CreateStackUseCase executed`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return meta.method.result;
    }

    logger.info(`Executing CreateStackUseCase with ${JSON.stringify(meta.method.args, null, 1)}`);
  }

 @asyncOnThrowOfMethod({
    classes: [CreateStackUseCase],
    methodNamePattern: /.*/,
  })
  public async handleException(meta: Metadata) {
    logger.error(`An error occurred while calling '${meta.method.name}': ${meta.method.exception}, with stack: ${meta.method.exception.stack}`);

    meta.method.result = Promise.reject(meta.method.exception);
  }
}
