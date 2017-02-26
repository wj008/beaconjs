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
const pagelist_1 = require("../../libs/pagelist");
class Member extends admin_ctl_1.AdminController {
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let plist = new pagelist_1.PageList('select * from @pf_member order by id desc');
            let { info, list } = yield plist.getData(this);
            this.assign('list', list);
            this.assign('pdata', info);
            this.display('member');
        });
    }
    editAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            if (this.isGet()) {
                let row = yield this.db.getRow('select * from @pf_member where id=?', id);
                this.assign('row', row);
                this.display('member_edit.form');
                return;
            }
            if (this.isPost()) {
                let { email = '', mobile = '' } = this.post();
                if (email == '' && mobile == '') {
                    this.fail('电子邮箱及手机号码至少一个不可为空', { email: '电子邮箱及手机号码至少一个不可为空', mobile: '电子邮箱及手机号码至少一个不可为空' });
                }
                if (email != '' && !/^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,8}([\.][a-zA-Z]{2,8})?$/.test(email)) {
                    this.fail('电子邮箱格式不正确', { email: '电子邮箱格式不正确' });
                }
                if (mobile != '' && !/^1[34578]\d{9}$/.test(mobile)) {
                    this.fail('手机号码格式不正确', { email: '手机号码格式不正确' });
                }
                let vals = {
                    email: email,
                    mobile: mobile
                };
                yield this.db.update('@pf_member', vals, id);
                this.success('编辑会员信息成功');
            }
        });
    }
    delAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            yield this.db.delete('@pf_member', id);
            this.success('删除会员信息成功');
        });
    }
    lockAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            let sort = this.param('sort:i', 0);
            yield this.db.update('@pf_member', {
                lock: true
            }, id);
            this.success('账号锁定成功');
        });
    }
    unlockAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            yield this.db.update('@pf_member', {
                lock: false,
                errtice: 0
            }, id);
            this.success('账号解锁成功');
        });
    }
}
exports.Member = Member;
//# sourceMappingURL=member.ctl.js.map