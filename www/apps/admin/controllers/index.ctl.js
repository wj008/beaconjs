"use strict";
const admin_ctl_1 = require("./admin.ctl");
class Index extends admin_ctl_1.AdminController {
    async indexAction() {
        let rows = await this.db.getList('select * from @pf_sysmenu where pid=0 and allow=1 order by sort asc');
        this.assign('rows', rows);
        let adm = await this.db.getRow('select * from @pf_manage where id=?', this.adminId);
        this.assign('adm', adm);
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }
    async logoutAction() {
        this.delSession();
        this.redirect('__APPROOT__/index.html');
    }
    async welcomeAction() {
        this.display('welcome');
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map