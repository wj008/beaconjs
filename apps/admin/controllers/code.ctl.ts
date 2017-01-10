import {Beacon} from "../../../src/core/beacon";
import {Captcha} from "../../../src/adapter/pnglib/captcha";
import path = require('path');


export class Code extends Beacon.Controller {

    public async indexAction() {
        await this.initSesion();
        let code = Beacon.randNumber(4);
        this.setSession('code', code);
        let oo = new Captcha(70, 26, code);
        this.setContentType('image/png');
        this.end(oo.captchapng().getBuffer());
    }

}