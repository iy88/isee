export default class log {
  isLog: boolean = true;
  chalk: any = undefined;

  constructor(isLog: boolean) {
    this.isLog = isLog;
    if (this.isLog) {
      this.chalk = require('chalk')
    }
  }

  debug(msg: string) {
    if (this.isLog) {
      console.log(this.chalk.green('[debug] ' + msg));
    }
  }

  info(msg: string) {
    if (this.isLog) {
      console.log(this.chalk.blue('[info] ' + msg));
    }
  }
}