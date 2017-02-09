import {AdminController} from "./admin.ctl";
import {Beacon} from "../../../src/core/beacon";
export class Manage extends AdminController {

    public async indexAction() {
        let list = await this.db.getList('select * from @pf_manage order by id asc');
        this.assign('list', list);
        this.display('manage');
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