import {Beacon} from "../../../src/core/beacon";
import {Mysql} from "../../../src/adapter/db/mysql";

export class Index extends Beacon.Controller {

    public async init() {
        await this.initSesion();
        await this.initDB('mysql');
    }

    public async indexAction() {
        let db:Mysql = this.db;
        await db.beginTransaction();
        try {
            let fields = await db.existsTable('t_product_sku');
            await db.addField('t_product_sku', 'Fbox2');
            console.log(fields);
            let iret = await db.insert('t_product_sku', {
                'Fname': 'xxxx'
            });
            console.log(iret);
            let row = await db.getRow('SELECT * FROM t_product_sk WHERE Fid=?', iret.insertId);
            console.log(row);
            await db.insert('t_product_sku', {
                'Fname': 'xxxx'
            });
            await db.commit();
        } catch (e) {

            await db.rollback();
            throw e;
        }
        console.log(this.getSession('abc'));
        this.assign('title', this.getSession('abc'));
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
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