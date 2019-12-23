import { injectable, inject } from 'inversify';
import { Advised } from 'aspect.js';
import * as Cloudformation from 'aws-sdk/clients/cloudformation';
import { whilst } from 'async';

const FINAL_STATUS = [
  'CREATE_COMPLETE',
  'UPDATE_COMPLETE',
  'ROLLBACK_COMPLETE',
  'UPDATE_ROLLBACK_COMPLETE'
];

const COMPLETE_STATUS = [
  'CREATE_COMPLETE',
  'UPDATE_COMPLETE',
  'UPDATE_ROLLBACK_COMPLETE'
];

const DEFAULT_CONFIGURATION = {
  delay: 5000,
  retries: 8,
};

export interface ICheckStackStatusUseCaseDependencies {
  cfnClient: Cloudformation;
}

export interface ICheckStackStatusUseCaseExecute {
  delay?: number;
  stackName: string;
  retries?: number;
}

@Advised()
@injectable()
export class CheckSuccessStackStatusUseCase {
  private cfnClient: Cloudformation;
  private stackStatus = '';
  private executions = 1;
  private monitoredSince: Date;
  private loggedEvents: Array<string> = [];
  private error: any;

  constructor(
    @inject('Factory<ICheckStatusUseCaseDependencies>')
    dependenciesFactory: () => ICheckStackStatusUseCaseDependencies) {
    const { cfnClient } = dependenciesFactory();

    this.cfnClient = cfnClient;
  }

  public execute(params: ICheckStackStatusUseCaseExecute): Promise<boolean> {
    const { delay, retries, stackName } = Object.assign(DEFAULT_CONFIGURATION, params);

    return new Promise<boolean>((resolve, reject) => {
      return whilst(
        () => {
          return this.shouldExecute(retries);
        },
        callback => {
          setTimeout(
            async () => {
              try {
                const stackEvents = await this.describeStackEvents(stackName);
                const firstRelevantEvent= this.getFirstRelevantEvent(stackEvents);
                
                if (firstRelevantEvent) {
                  const eventDate = new Date(firstRelevantEvent.Timestamp);
                  const updateDate = eventDate.setSeconds(eventDate.getSeconds() - 5);
                  this.monitoredSince = new Date(updateDate);
                }

                stackEvents.reverse().forEach(event => this.processEvent(event));
              } catch(error) {
                this.error = error;
              }

              this.executions++;
              return callback();
          }, delay);
        },
        () => {
          if (typeof this.error !== 'undefined') {
            reject(this.error);
            return;
          }

          resolve(COMPLETE_STATUS.indexOf(this.stackStatus) !== -1);
        }
      )
    });
  }

  private shouldExecute(retries: number): boolean {
    return this.executions <= retries && FINAL_STATUS.indexOf(this.stackStatus) === -1;
  }

  private async describeStackEvents(StackName: string): Promise<Cloudformation.StackEvents> {
    const result = await this.cfnClient.describeStackEvents({ StackName }).promise();

    return result.StackEvents;
  }

  private getFirstRelevantEvent(events: Cloudformation.StackEvents): Cloudformation.StackEvent {
    return events.find(event => {
      const isStackEvent = 'AWS::CloudFormation::Stack' === event.ResourceType;
      const statuses = ['UPDATE_IN_PROGRESS', 'CREATE_IN_PROGRESS', 'DELETE_IN_PROGRESS'];

      return isStackEvent && statuses.indexOf(event.ResourceStatus) !== -1;
    });
  }

  private processEvent(event: Cloudformation.StackEvent): void {
    if (this.shouldProcessEvent(event)) {
      this.stackStatus = event.ResourceStatus;
      this.loggedEvents.push(event.EventId);
    }
  }

  private shouldProcessEvent(event: Cloudformation.StackEvent): boolean {
    const eventInRange = this.monitoredSince <= event.Timestamp;
    const eventNotLogged = this.loggedEvents.indexOf(event.EventId) === -1;
    const isStackEvent = event.ResourceType === 'AWS::CloudFormation::Stack' && event.StackName === event.LogicalResourceId;

    return eventInRange && eventNotLogged && isStackEvent;
  }
}
