import {Beacon} from "../../../src/core/beacon";
import {Mysql} from "../../../src/adapter/db/mysql";
import {Redis} from "../../../src/adapter/db/redis";
import crypto=require('crypto');
export class Index extends Beacon.Controller {

    public redis: Redis;

    public async init() {
        await this.initSesion();
        await this.initDB('mysql');
        // this.redis = Redis.getRedisInstance();
    }


    public async indexAction() {
        let db: Mysql = this.db;
        await db.beginTransaction();
        let list = await db.getList('select * from t_product_sku limit 0,1');
        await db.rollback();
        console.log(list);
        console.log(this.getSession('abc'));
        this.assign('title', this.getSession('abc'));
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
        //console.log(Beacon);

        //  throw new Error('数据异常请重试.');
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }

    public async loginAction() {
        console.log(Date.now() - this.context.startTime);
        this.setSession('abc', 'xxxxxx');
        this.end('login');
    }

}