import {Beacon} from '../../../src/core/beacon';
export class Index extends Beacon.Controller {

    public indexAction() {
        this.end(Beacon.BEACON_LIB_PATH);
       // throw new Error('dddd');
        console.log(Date.now()-this.context.startTime);
    }

}
