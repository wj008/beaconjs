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

    public async leftAction() {
        let pid = this.get('pid:n', 0);
        let info = await this.db.getRow('select * from @pf_sysmenu where id=?', pid);
        this.assign('info', info);
        let rows = await this.db.getList('select * from @pf_sysmenu where pid=? and allow=1 order by sort asc', pid);
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            row.childs = await this.db.getList('select * from @pf_sysmenu where pid=? and allow=1 order by sort asc', row.id);
        }
        this.assign('rows', rows);
        this.display('left');
    }

    public async logoutAction() {
        this.delSession();
        this.redirect('__APPROOT__/index.html');
    }

    public async welcomeAction() {
        this.display('welcome');
    }

}
