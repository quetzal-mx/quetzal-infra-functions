import { configure } from 'log4js';

configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'basic' 
      }
    }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'debug'
    }
  }
});