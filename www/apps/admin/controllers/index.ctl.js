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
class Index extends admin_ctl_1.AdminController {
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let rows = yield this.db.getList('select * from @pf_sysmenu where pid=0 and allow=1 order by sort asc');
            this.assign('rows', rows);
            let adm = yield this.db.getRow('select * from @pf_manage where id=?', this.adminId);
            this.assign('adm', adm);
            this.display('index');
            console.log(Date.now() - this.context.startTime);
        });
    }
    leftAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let pid = this.get('pid:n', 0);
            let info = yield this.db.getRow('select * from @pf_sysmenu where id=?', pid);
            this.assign('info', info);
            let rows = yield this.db.getList('select * from @pf_sysmenu where pid=? and allow=1 order by sort asc', pid);
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                row.childs = yield this.db.getList('select * from @pf_sysmenu where pid=? and allow=1 order by sort asc', row.id);
            }
            this.assign('rows', rows);
            this.display('left');
            console.log(Date.now() - this.context.startTime);
        });
    }
    logoutAction() {
        return __awaiter(this, void 0, void 0, function* () {
            this.delSession();
            this.redirect('~/index');
        });
    }
    welcomeAction() {
        return __awaiter(this, void 0, void 0, function* () {
            this.display('welcome');
        });
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map