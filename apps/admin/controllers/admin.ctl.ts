import {Beacon} from "../../../src/core/beacon";
import path = require('path');


export class AdminController extends Beacon.Controller {
    public adminId = 0;
    public adminName = '';

    public constructor(context) {
        super(context);
        this.template_dirs = path.join(Beacon.VIEW_PATH, 'admin') + '/';
    }

    public fail(message: any, jump?: any, code?: any, timeout: number = 3) {
        if (this.isAjax()) {
            let ret: any = {};
            ret.message = message;
            ret.status = false;
            ret.timeout = timeout;
            if (jump !== void 0) {
                ret.jump = jump;
            }
            if (code !== void 0) {
                ret.code = code;
            }
            this.returnJson(ret);
        }
        if (jump === void 0) {
            jump = this.getReferrer();
        }
        else if (jump == false) {
            jump = 'javascript:history.go(-1);';
        }
        this.assign('message', message);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.assign('code', code);
        this.display('fail');
        this.exit();
    }

    public success(message: any, jump?: any, code?: any, timeout: number = 3) {
        if (jump === void 0) {
            jump = this.param('__BACK__', this.getReferrer()) || null;
        }
        if (this.isAjax()) {
            let ret: any = {};
            ret.message = message;
            ret.status = true;
            ret.timeout = timeout;
            if (jump !== void 0) {
                ret.jump = jump;
            }
            if (code !== void 0) {
                ret.code = code;
            }
            this.returnJson(ret);
        }
        if (jump == false) {
            jump = 'javascript:history.go(-1);';
        }
        this.assign('message', message);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.assign('code', code);
        this.display('success');
        this.exit();
    }

    public returnJson(data) {
        this.setContentType('json');
        this.end(JSON.stringify(data));
        this.exit();
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
        let row = await this.db.getRow('select * from @pf_manage where `username`=?', username);
        if (row == null) {
            this.fail('账号不存在！');
        }
        if (row.password != Beacon.md5(password)) {
            this.fail('用户密码不正确！');
        }
        this.setSession('adminId', row.id);
        this.setSession('amdinName', row.username);
        let fields = await this.db.getFields('@pf_manage');
        let temp = [];
        for (let i = 0; i < fields.length; i++) {
            temp.push(fields[i]['Field']);
        }
        let vals = {};
        if (temp.indexOf('thisdate') >= 0 && temp.indexOf('lastdate') >= 0) {
            vals['thisdate'] = Beacon.getDate();
            vals['lastdate'] = row.thisdate;
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