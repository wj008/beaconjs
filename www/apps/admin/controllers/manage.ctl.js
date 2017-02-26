"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const admin_ctl_1 = require("./admin.ctl");
const beacon_1 = require("../../../src/core/beacon");
const pagelist_1 = require("../../libs/pagelist");
class Manage extends admin_ctl_1.AdminController {
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let plist = new pagelist_1.PageList('select * from @pf_manage order by id asc');
            let { info, list } = yield plist.getData(this);
            this.assign('list', list);
            this.assign('pdata', info);
            this.display('manage');
        });
    }
    checkNameAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let username = this.param('username', '');
            let id = this.param('id', 0);
            let row = yield this.db.getRow('select id from @pf_manage where `name`=? and id<>?', [username, id]);
            if (row) {
                this.fail('用户名已经存在');
            }
            this.success('用户名可以使用');
        });
    }
    addAction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isGet()) {
                this.display('manage_add.form');
                return;
            }
            if (this.isPost()) {
                let { username = '', password = '', type = 1 } = this.post();
                if (username == '') {
                    this.fail('用户名不可为空', { username: '用户名不可为空' });
                }
                if (password == '') {
                    this.fail('密码不可为空', { password: '密码不可为空' });
                }
                let row = yield this.db.getRow('select id from @pf_manage where `name`=?', username);
                if (row) {
                    this.fail('用户名已经存在', { username: '密码不可为空' });
                }
                let vals = {
                    name: username,
                    pwd: beacon_1.Beacon.md5(password),
                    type: 1
                };
                yield this.db.insert('@pf_manage', vals);
                this.success('添加账号成功');
            }
        });
    }
    editAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            if (this.isGet()) {
                let row = yield this.db.getRow('select `id`,`name`,`type` from @pf_manage where id=?', id);
                this.assign('row', row);
                this.display('manage_edit.form');
                return;
            }
            if (this.isPost()) {
                let { username = '', password = '', type = 1 } = this.post();
                if (username == '') {
                    this.fail('用户名不可为空', { username: '用户名不可为空' });
                }
                let row = yield this.db.getRow('select id from @pf_manage where `name`=? and id<>?', [username, id]);
                if (row) {
                    this.fail('用户名已经存在', { username: '用户名已经存在' });
                }
                let vals = {
                    name: username,
                    type: 1
                };
                if (password) {
                    vals.pwd = beacon_1.Beacon.md5(password);
                }
                yield this.db.update('@pf_manage', vals, id);
                this.success('编辑账号成功');
            }
        });
    }
    delAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            if (id == 1) {
                this.fail('最高管理员不可删除');
            }
            yield this.db.delete('@pf_manage', id);
            this.success('删除账号成功');
        });
    }
    //修改账号密码
    modifyPassAction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isGet()) {
                this.assign('row', this.getSession());
                this.display('modify_pass.form');
                return;
            }
            if (this.isPost()) {
                let { oldpass = '', newpass = '' } = this.post();
                if (oldpass == '') {
                    this.fail('旧密码不可为空', { oldpass: '旧密码不可为空' });
                }
                if (newpass == '') {
                    this.fail('新密码不可为空', { newpass: '新密码不可为空' });
                }
                let row = yield this.db.getRow('select * from @pf_manage where id=?', this.adminId);
                if (row == null) {
                    this.fail('用户不存在');
                }
                if (beacon_1.Beacon.md5(oldpass) != row.pwd) {
                    this.fail('旧密码不正确，请重新输入', { oldpass: '旧密码不正确，请重新输入' });
                }
                newpass = beacon_1.Beacon.md5(newpass);
                yield this.db.update('@pf_manage', { pwd: newpass }, this.adminId);
                this.success('修改密码成功');
            }
        });
    }
}
exports.Manage = Manage;
//# sourceMappingURL=manage.ctl.js.map