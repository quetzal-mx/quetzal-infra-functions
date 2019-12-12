import { configure } from 'log4js';

configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%c] %m', 
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