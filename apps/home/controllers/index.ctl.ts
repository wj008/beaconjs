import {Beacon} from "../../../src/core/beacon";
import {Redis} from "../../../src/adapter/db/redis";
import crypto=require('crypto');
import request=require('request');
export class Index extends Beacon.Controller {

    public redis: Redis;

    public async init() {
        await this.initSesion();
        await this.initDB('mysql');
        // this.redis = Redis.getRedisInstance();
    }


    public async indexAction() {

        let vals: any = {};
        vals.code = '023460';
        vals.yzdw = 'ZW01002';
        vals.yzzx = '圆形';
        vals.yzzj = '3.0';
        vals.yzbk = '4.0';
        vals.yzsk = '海南波泰农畜业开发有限公司';
        vals.yzzk = '五角星';
        vals.yzxk1 = '公章,财务章 ';
        vals.yzxk2 = '发票专用章91460105MA5RDHWP60';
        vals.yzxk3 = '';
        vals.yzxk4 = '';
        vals.yzlx = '牛角';
        vals.yzsl = 3;
        let key = 'oinjshxwj008hxyzxh';


        vals.sign = Beacon.md5(
            vals.code +
            vals.yzdw +
            vals.yzzx +
            vals.yzzj +
            vals.yzbk +
            vals.yzsk +
            vals.yzsl +
            vals.yzlx +
            vals.yzzk +
            vals.yzxk1 +
            vals.yzxk2 +
            vals.yzxk3 +
            vals.yzxk4 + key);

        let body = await new Promise(function (resolve, reject) {
            request.post({
                url: 'http://www.hkyzxh.cam/api/add',
                form: vals
            }, function (err, httpResponse, body) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
        });
        console.log(body);
        this.end(body);
        console.log(Date.now() - this.context.startTime);
    }

    public async loginAction() {
        let vals: any = {};
        vals.code = '023458';
        let key = 'oinjshxwj008hxyzxh';
        vals.sign = Beacon.md5(vals.code + key);

        let body = await new Promise(function (resolve, reject) {
            request.post({
                url: 'http://www.hkyzxh.cam/api/get',
                form: vals
            }, function (err, httpResponse, body) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
        });
        console.log(body);
        this.end(body);
        console.log(Date.now() - this.context.startTime);
    }

}