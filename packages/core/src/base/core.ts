import { Context } from '../context';
import KotoriConfig from './config';
import Events from './events';
import Modules from './modules';

declare module '../context' {
  interface Context extends KotoriConfig {}
}

export default class Kotori extends Context {
  constructor(config?: KotoriConfig) {
    super();
    this.provide('config', new KotoriConfig(config));
    this.mixin('config', ['pkg', 'baseDir', 'config', 'options']);
    this.provide('events', new Events());
    this.mixin('events', ['emit', 'on', 'once', 'off', 'offAll']);
    this.provide('modules', new Modules(this));
    this.mixin('modules', ['load', 'dispose']);
  }
}
