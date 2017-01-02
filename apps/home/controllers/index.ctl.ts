import  {Beacon} from '../../../src/core/beacon';
export class Index extends Beacon.Controller {

    public async indexAction() {
        this.end('111');
        console.log(Date.now()-this.context.startTime);
    }

    public async loginAction() {
        this.end('login');
    }
}