import {AdminController} from "./admin.ctl";
import {PageList} from "../../libs/pagelist";

export class Member extends AdminController {

    public async indexAction() {
        let plist = new PageList('select * from @pf_member order by id desc');
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('member');
    }

    public async editAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_member where id=?', id);
            this.assign('row', row);
            this.display('member_edit.form');
            return;
        }
        if (this.isPost()) {
            let {email = '', mobile = ''}=this.post();
            if (email == '' && mobile == '') {
                this.fail('电子邮箱及手机号码至少一个不可为空', {email: '电子邮箱及手机号码至少一个不可为空', mobile: '电子邮箱及手机号码至少一个不可为空'});
            }
            if (email != '' && !/^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,8}([\.][a-zA-Z]{2,8})?$/.test(email)) {
                this.fail('电子邮箱格式不正确', {email: '电子邮箱格式不正确'});
            }
            if (mobile != '' && !/^1[34578]\d{9}$/.test(mobile)) {
                this.fail('手机号码格式不正确', {email: '手机号码格式不正确'});
            }
            let vals = {
                email: email,
                mobile: mobile
            }
            await this.db.update('@pf_member', vals, id);
            this.success('编辑会员信息成功');
        }
    }

    public async delAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete('@pf_member', id);
        this.success('删除会员信息成功');
    }

    public async lockAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:n', 0);
        await this.db.update('@pf_member', {
            lock: true
        }, id);
        this.success('账号锁定成功');
    }

    public async unlockAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.update('@pf_member', {
            lock: false,
            errtice: 0
        }, id);
        this.success('账号解锁成功');
    }

}