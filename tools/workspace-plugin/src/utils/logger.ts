import * as chalk from 'chalk';

function logGreen(message: string) {
  console.log(chalk.green(message));
}

function logRed(message: string) {
  console.log(chalk.red(message));
}

function logBlue(message: string) {
  console.log(chalk.blue(message));
}

function logYellow(message: string) {
  console.log(chalk.yellow(message));
}

function log(message: string) {
  console.log(message);
}

function empty() {
  console.log('');
}

function header(message: string) {
  empty();
  log(message);
  empty();
}

function divider(message?: string) {
  const title = message ? `------------- ${message} ---------------` : '----------------------------';

  log(title);
}

export const Logger = {
  success: logGreen,
  error: logRed,
  warning: logYellow,
  note: logBlue,
  log,
  empty,
  header,
  divider,
};
