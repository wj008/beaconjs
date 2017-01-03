import {Beacon} from "../../../src/core/beacon";
export class Index extends Beacon.Controller {

    public async indexAction() {

        this.assign('title', 'hello sdopx');
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
      //  throw new Error('数据异常请重试.');
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }

    public async loginAction() {
        this.end('login');
    }
}