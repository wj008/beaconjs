import {Beacon} from "../../../src/core/beacon";
export class Index extends Beacon.Controller {

    public async indexAction() {
        await this.initSesion();
        console.log(this.getSession('abc'));
        this.assign('title', this.getSession('abc'));
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
      //  throw new Error('数据异常请重试.');
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }

    public async loginAction() {
        await this.initSesion();
        console.log(Date.now() - this.context.startTime);
        this.setSession('abc','xxxxxx');
        this.end('login');
    }
}