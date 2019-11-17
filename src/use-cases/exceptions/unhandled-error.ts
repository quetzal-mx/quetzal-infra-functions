export default class UnhandledError extends Error {
  public message: string;

  constructor(originalError: Error) {
    super();
    let message: string;

    if (originalError['code']) {
      message = `An error ocurred: ${originalError['code']}`;
    } else {
      message = `An error ocurred: ${originalError.message}`;
    }

    this.message = message;
  }
};
