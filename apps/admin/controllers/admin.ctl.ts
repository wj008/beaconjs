import {Beacon} from "../../../src/core/beacon";
import path = require('path');


export class AdminController extends Beacon.Controller {
    public adminId = 0;
    public adminName = '';

    public constructor(context) {
        super(context);
        this.template_dirs = path.join(Beacon.VIEW_PATH, 'admin')+'/';
    }

    public error(msg: string, jump = this.getReferrer(), timeout = 3) {
        this.assign('message', msg);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.display('error');
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
        if (username == '') {
            this.error('用户名不能为空！');
        }
        if (password == '') {
            this.error('用户密码不能为空！');
        }

        let row = await this.db.getRow('select * from @pf_manage where `username`=?', username);
        if (row == null) {
            this.error('账号不存在！');
        }
        if (row.password != Beacon.md5(password)) {
            this.error('用户密码不正确！');
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
        this.redirect('index.html');
        this.exit();
    }

}