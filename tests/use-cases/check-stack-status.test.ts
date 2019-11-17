import { CheckSuccessStackStatusUseCase } from '../../src/use-cases';
import * as Cloudformation from 'aws-sdk/clients/cloudformation';
import { v4 } from 'uuid';

describe('CheckSuccessStackStatusUseCase', () => {
  describe('#execute', () => {
    describe('when the stack is created', () => {
      const describeStackEvents = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValueOnce({
          StackEvents: [
            {
              ResourceType: 'AWS::CloudFormation::Stack',
              ResourceStatus: 'CREATE_COMPLETE',
              Timestamp: new Date(),
              EventId: v4(),
              StackName: 'TestStack',
              LogicalResourceId: 'TestStack'
            },
            {
              ResourceType: 'AWS::CloudFormation::Stack',
              ResourceStatus: 'CREATE_IN_PROGRESS',
              Timestamp: new Date(),
              EventId: v4(),
              StackName: 'TestStack',
              LogicalResourceId: 'TestStack'
            }
        ]})
      });

      const mockCfnClientConstructor = jest.fn().mockImplementation(() => (
        {
          describeStackEvents,
        }
      )) as jest.Mock<Cloudformation>;

      const dependenciesFactory = () => ({
        cfnClient: new mockCfnClientConstructor()
      });

      it('returns true', async () => {
        const useCase = new CheckSuccessStackStatusUseCase(dependenciesFactory);

        await expect(useCase.execute({delay: 10, stackName: 'TestStack'})).resolves.toEqual(true);
        expect(describeStackEvents).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the stack events doest not contain complete events', () => {
      const describeStackEvents = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          StackEvents: [
            {
              ResourceType: 'AWS::CloudFormation::Stack',
              ResourceStatus: 'CREATE_IN_PROGRESS',
              Timestamp: new Date(),
              EventId: v4(),
              StackName: 'TestStack',
              LogicalResourceId: 'TestStack'
            }
          ]
        })
      });

      const mockCfnClientConstructor = jest.fn().mockImplementation(() => (
        {
          describeStackEvents,
        }
      )) as jest.Mock<Cloudformation>;

      const dependenciesFactory = () => ({
        cfnClient: new mockCfnClientConstructor()
      });

      it('executes 8 times and returns false', async  () => {
        const useCase = new CheckSuccessStackStatusUseCase(dependenciesFactory);

        await expect(useCase.execute({delay: 1, stackName: 'TestStack'})).resolves.toEqual(false);
        expect(describeStackEvents).toHaveBeenCalledTimes(8);
      });
    });

    describe('when non stack events are found', () => {
      const describeStackEvents = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValueOnce({
          StackEvents: [{
            ResourceType: 'AWS::CloudFormation::Something',
            ResourceStatus: 'CREATE_COMPLETE',
            Timestamp: new Date(),
            EventId: v4(),
            StackName: 'TestStack',
            LogicalResourceId: 'TestStack'
          },
          {
            ResourceType: 'AWS::CloudFormation::Stack',
            ResourceStatus: 'CREATE_IN_PROGRESS',
            Timestamp: new Date(),
            EventId: v4(),
            StackName: 'TestStack',
            LogicalResourceId: 'TestStack'
          }]
        })
        .mockResolvedValueOnce({
          StackEvents: [{
            ResourceType: 'AWS::CloudFormation::Stack',
            ResourceStatus: 'CREATE_COMPLETE',
            Timestamp: new Date(),
            EventId: v4(),
            StackName: 'TestStack',
            LogicalResourceId: 'TestStack'
          }]
        })
      });

      const mockCfnClientConstructor = jest.fn().mockImplementation(() => (
        {
          describeStackEvents,
        }
      )) as jest.Mock<Cloudformation>;

      const dependenciesFactory = () => ({
        cfnClient: new mockCfnClientConstructor()
      });

      it('ignores them', async () => {
        const useCase = new CheckSuccessStackStatusUseCase(dependenciesFactory);

        await expect(useCase.execute({delay: 1, stackName: 'TestStack'})).resolves.toEqual(true);
        expect(describeStackEvents).toHaveBeenCalledTimes(2);
      });
    });

    describe('when an error happens', () => {
      const describeStackEvents= jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('An error!'))
      });

      const mockCfnClientConstructor = jest.fn().mockImplementation(() => (
        {
          describeStackEvents,
        }
      )) as jest.Mock<Cloudformation>;

      const dependenciesFactory = () => ({
        cfnClient: new mockCfnClientConstructor()
      });

      it('throws it', async () => {
        const useCase = new CheckSuccessStackStatusUseCase(dependenciesFactory);

        await expect(useCase.execute({delay: 10, stackName: 'TestStack'})).rejects.toThrowError('An error!');
      });
    });

  });
});
