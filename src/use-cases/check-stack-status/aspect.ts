import { aroundMethod, asyncOnThrowOfMethod, Metadata } from 'aspect.js';
import { CheckSuccessStackStatusUseCase } from './check-stack-status';
import { getLogger } from 'log4js';
import UnhandledError from '../exceptions/unhandled-error';

const logger = getLogger('CheckSuccessStackStatusUseCase');

export default class CheckSuccessStackStatusUseCaseAspect {
  @aroundMethod({
    classes: [CheckSuccessStackStatusUseCase],
    methodNamePattern: /execute/
  })
  public async logExecute(meta: Metadata) {
    if (meta.method.result) {
      try {
        const result = await meta.method.result;
        logger.info(`Executed CheckSuccessStackStatusUseCase with result: ${result}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return;
    }

    logger.info(`Executing CheckSuccessStackStatusUseCase`);
  }

  @aroundMethod({
    classes: [CheckSuccessStackStatusUseCase],
    methodNamePattern: /getFirstRelevantEvent/
  })
  public logGetFirstRelevantEvent(meta: Metadata) {
    if (meta.method.result) {
      logger.info(`Found first relevant event ${JSON.stringify(meta.method.result, null, 1)}`);
      return;
    }

    logger.info(`Getting first relevant event`);
  }

  @aroundMethod({
    classes: [CheckSuccessStackStatusUseCase],
    methodNamePattern: /describeStackEvents/
  })
  public async logDescribeStackEvents(meta: Metadata) {
    const stackName = meta.method.args[0];

    if (meta.method.result) {
      try {
        const result = await meta.method.result;
        logger.info(`Found ${result.length} events for stack ${stackName}`);
      } catch(_) {
        meta.method.result = Promise.resolve();
      }

      return;
    }

    logger.info(`Getting events for stack ${stackName}`);
  }

  @aroundMethod({
    classes: [CheckSuccessStackStatusUseCase],
    methodNamePattern: /shouldProcessEvent/
  })
  public logShouldProcessEvent(meta: Metadata) {
    if (typeof meta.method.result === 'undefined') {
      return;
    }

    const event = meta.method.args[0];
    logger.info(`Should process event: ${JSON.stringify(event, null, 1)}, result: ${meta.method.result}`);
  }

  @asyncOnThrowOfMethod({
    classes: [CheckSuccessStackStatusUseCase],
    methodNamePattern: /execute/
  })
  public async handleError(meta: Metadata) {
    const { exception } = meta.method;
  
    logger.error(`An error ocurred while executing the use case: ${exception}, with stack ${exception.stack}`);
    meta.method.result = Promise.reject(new UnhandledError(exception));
  }
}
