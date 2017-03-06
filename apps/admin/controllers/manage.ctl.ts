import {AdminController} from "./admin.ctl";
import {Beacon} from "../../../src/core/beacon";
import {Selector} from "../../../src/common/selector";
import {ManageForm} from "../forms/manage.form";
import {Form} from "../../../src/common/form";
export class Manage extends AdminController {

    public async indexAction() {
        let selector = new Selector('@pf_manage');
        let keyword = this.get('keyword:s', '').trim();
        if (keyword) {
            selector.where("(`name` LIKE CONCAT('%',?,'%') OR realname LIKE CONCAT('%',?,'%'))", [keyword, keyword]);
        }
        selector.order('id ASC');
        let plist = selector.getPageList();
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        if (this.isAjax()) {
            let data: any = {};
            data.html = this.fetch('extends:common/list_ajax|manage');
            data.pdata = info;
            this.success('获取数据成功', data);
        }
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
        let form = await new ManageForm(this, Form.ADD).init();
        if (this.isGet()) {
            form.display();
            return;
        }
        if (this.isPost()) {
            await form.insert(form.table);
            this.success('添加' + form.title + '成功');
            console.log(Date.now() - this.context.startTime);
        }
    }

    public async editAction() {
        let form = await new ManageForm(this, Form.EDIT).init();
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_manage where id=?', id);
            await form.initValues(row);
            form.display();
            return;
        }
        if (this.isPost()) {
            await form.update('@pf_manage', id);
            this.success('编辑' + form.title + '成功');
        }
    }

    public async delAction() {
        let id = this.param('id:i', 0);
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
            this.assign('row', this.getSession());
            this.display('modify_pass.form');
            return;
        }

        if (this.isPost()) {
            let {oldpass = '', newpass = ''}=this.post();
            if (oldpass == '') {
                this.fail({oldpass: '旧密码不可为空'});
            }
            if (newpass == '') {
                this.fail({newpass: '新密码不可为空'});
            }
            let row = await this.db.getRow('select * from @pf_manage where id=?', this.adminId);
            if (row == null) {
                this.fail('用户不存在');
            }
            if (Beacon.md5(oldpass) != row.pwd) {
                this.fail({oldpass: '旧密码不正确，请重新输入'});
            }
            newpass = Beacon.md5(newpass);
            await this.db.update('@pf_manage', {pwd: newpass}, this.adminId);
            this.success('修改密码成功');
        }
    }

}