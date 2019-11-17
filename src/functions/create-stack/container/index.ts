import { Container } from 'inversify';
import AWSClientsContainer from './aws-clients';
import Factories from './factories';
import Utils from './utils';
import UseCases from './use-cases';
import Handler from './handler';

let container: Container;

container = [AWSClientsContainer, Factories, Utils, UseCases, Handler].reduce((current, child) => (
  Container.merge(current, child) as Container
), new Container());

export default container;
