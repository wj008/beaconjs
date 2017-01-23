import {Beacon} from "../../../src/core/beacon";
import {Captcha} from "../../../src/adapter/pnglib/captcha";

import gm = require("gm");
import path = require('path');


export class Code extends Beacon.Controller {


    //使用gm库 需要安装 GraphicsMagick
    public async indexAction() {

        await this.initSesion();
        let code = Beacon.randNumber(4);
        this.setSession('code', code);
        let buffer = await new Promise(function (resolve, reject) {
            let bgcolor = 'rgb(' + Math.round(255 - Math.random() * 80) + ',' + Math.round(255 - Math.random() * 80) + ',' + Math.round(255 - Math.random() * 80) + ')';
            let w = 70, h = 26;
            let img = gm(w, h, bgcolor);
            img.font(path.join(Beacon.RUNTIME_PATH, 'font', 'Helvetica.ttf'), 24);
            for (var i = 0; i < 20; i++) {
                let color = 'rgb(' + Math.round(255 - Math.random() * 150) + ',' + Math.round(255 - Math.random() * 150) + ',' + Math.round(255 - Math.random() * 150) + ')';
                img.stroke(color, 1);
                img.drawLine(
                    Math.round(Math.random() * w + 1),
                    Math.round(Math.random() * h + 1),
                    Math.round(Math.random() * w + 1),
                    Math.round(Math.random() * h + 1)
                );
            }
            for (let i = 0; i < code.length; i++) {
                let textcolor = 'rgb(' + Math.round(155 + Math.random() * 100) + ',' + Math.round(155 + Math.random() * 100) + ',' + Math.round(155 + Math.random() * 100) + ')';
                img.stroke('#666', 0);
                img.drawText(6 + (15 * i), 20 + 1, code[i]);
                img.fill(textcolor)
                img.drawText(5 + (15 * i), 20, code[i]);
            }
            img.toBuffer('PNG', function (err, buffer) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(buffer);
            });

        });
        this.setContentType('png');
        this.end(buffer);
    }

    //无组件，不完善的png库

    public async imgAction() {
        await this.initSesion();
        let code = Beacon.randNumber(4);
        console.log(code);
        this.setSession('code', code);
        let oo = new Captcha(70, 26, code);
        this.setContentType('png');
        this.end(oo.captchapng().getBuffer());

    }

}