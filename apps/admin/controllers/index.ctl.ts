import {AdminController} from "./admin.ctl";
export class Index extends AdminController {


    public async indexAction() {
        let rows = await this.db.getList('select * from @pf_sysmenu where pid=0 and allow=1 order by sort asc');
        this.assign('rows', rows);
        let adm = await this.db.getRow('select * from @pf_manage where id=?', this.adminId);
        this.assign('adm', adm);
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }

    public async logoutAction() {
        this.delSession();
        this.redirect('__APPROOT__/index.html');
    }

    public async welcomeAction() {
        this.display('welcome');
    }

}
