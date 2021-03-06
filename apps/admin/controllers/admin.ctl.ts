﻿import {Beacon} from "../../../src/core/beacon";
import {Controller} from "../../../src/common/controller";
import path = require('path');


export class AdminController extends Controller {
    public adminId = 0;
    public adminName = '';

    public constructor(context) {
        super(context);
        this.template_dirs = path.join(Beacon.VIEW_PATH, 'admin') + '/';
    }

    public getReferrer() {
        let back = this.get('__BACK__:s', '');
        if (back != '') {
            return back;
        }
        return super.getReferrer();
    }

    public async init() {
        this.initDB('mysql');
        await this.initSesion();
        await this.checkLogin();
    }

    public async checkLogin() {
        this.adminId = this.getSession('adminId') || 0;
        this.adminName = this.getSession('adminName') || '';
        if (!Beacon.isEmpty(this.adminId)) {
            return;
        }
        if (this.isGet()) {
            this.display('login');
            this.exit();
        }
        let username = this.post('username:s', '');
        let password = this.post('password:s', '');
        let code = this.post('code:s', '').toUpperCase();

        if (username == '') {
            this.fail('用户名不能为空！');
        }
        if (password == '') {
            this.fail('用户密码不能为空！');
        }
        let pcode = this.getSession('code') || '';
        if (pcode == '' || pcode != code) {
            this.setSession('code', '');
            this.fail('验证码有误！');
        }
        let row = await this.db.getRow('select * from @pf_manage where `name`=?', username);
        if (row == null) {
            this.fail('账号不存在！');
        }
        if (row.pwd != Beacon.md5(password)) {
            this.fail('用户密码不正确！');
        }
        this.setSession('adminId', row.id);
        this.setSession('amdinName', row.name);
        let fields = await this.db.getFields('@pf_manage');
        let temp = [];
        for (let i = 0; i < fields.length; i++) {
            temp.push(fields[i]['Field']);
        }
        let vals = {};
        if (temp.indexOf('thistime') >= 0 && temp.indexOf('lasttime') >= 0) {
            vals['thistime'] = new Date();
            vals['lasttime'] = row.thistime;
        }
        if (temp.indexOf('thisip') >= 0 && temp.indexOf('lastip') >= 0) {
            vals['thisip'] = this.getIP();
            vals['lastip'] = row.thisip;
        }
        if (Object.keys(vals).length > 0) {
            await this.db.update('@pf_manage', vals, 'id=?', row.id);
        }
        this.redirect('~/index');
        this.exit();
    }

}