import {AdminController} from "./admin.ctl";
import {Beacon} from "../../../src/core/beacon";
import {PageList} from "../../libs/pagelist";
export class Manage extends AdminController {

    public async indexAction() {
        let plist = new PageList('select * from @pf_manage order by id asc');
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('manage');
    }

    public async checkNameAction() {
        let username = this.param('username', '');
        let id = this.param('id', 0);
        let row = await this.db.getRow('select id from @pf_manage where `name`=? and id<>?', [username, id]);
        if (row) {
            this.fail('用户名已经存在');
        }
        this.success('用户名可以使用');
    }

    public async addAction() {
        if (this.isGet()) {
            this.display('manage_add.form');
            return;
        }
        if (this.isPost()) {
            let {username = '', password = '', type = 1}=this.post();
            if (username == '') {
                this.fail('用户名不可为空');
            }
            if (password == '') {
                this.fail('密码不可为空');
            }
            let row = await this.db.getRow('select id from @pf_manage where `name`=?', username);
            if (row) {
                this.fail('用户名已经存在');
            }
            let vals = {
                name: username,
                pwd: Beacon.md5(password),
                type: 1
            }
            await this.db.insert('@pf_manage', vals);
            this.success('添加账号成功');
        }
    }

    public async editAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select `id`,`name`,`type` from @pf_manage where id=?', id);
            this.assign('info', row);
            this.display('manage_edit.form');
            return;
        }
        if (this.isPost()) {
            let {username = '', password = '', type = 1}=this.post();
            if (username == '') {
                this.fail('用户名不可为空');
            }
            let row = await this.db.getRow('select id from @pf_manage where `name`=? and id<>?', [username, id]);
            if (row) {
                this.fail('用户名已经存在');
            }
            let vals: any = {
                name: username,
                type: 1
            }
            if (password) {
                vals.pwd = Beacon.md5(password);
            }
            await this.db.update('@pf_manage', vals, id);
            this.success('编辑账号成功');
        }
    }

    public async delAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (id == 1) {
            this.fail('最高管理员不可删除');
        }
        await this.db.delete('@pf_manage', id);
        this.success('删除账号成功');
    }

    //修改账号密码
    public async modifyPassAction() {

        if (this.isGet()) {
            this.assign('info', this.getSession());
            this.display('modify_pass.form');
            return;
        }

        if (this.isPost()) {
            let {oldpass = '', newpass = ''}=this.post();
            if (oldpass == '') {
                this.fail('旧密码不可为空');
            }
            if (newpass == '') {
                this.fail('新密码不可为空');
            }
            let row = await this.db.getRow('select * from @pf_manage where id=?', this.adminId);
            if (row == null) {
                this.fail('用户不存在');
            }
            if (Beacon.md5(oldpass) != row.pwd) {
                this.fail('旧密码不正确，请重新输入');
            }
            newpass = Beacon.md5(newpass);
            await this.db.update('@pf_manage', {pwd: newpass}, this.adminId);
            this.success('修改密码成功');
        }
    }

}