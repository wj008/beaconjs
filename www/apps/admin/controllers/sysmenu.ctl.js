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
class Sysmenu extends admin_ctl_1.AdminController {
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let items = [];
            let rows = yield this.db.getList('select * from @pf_sysmenu where pid=0 order by sort asc');
            for (let item of rows) {
                let title = item.name;
                item.title = '<b>' + title + '</b>';
                item.create = true;
                items.push(item);
                let temp = yield this.db.getList('select * from @pf_sysmenu where pid=? order by sort asc', item.id);
                for (let rs of temp) {
                    rs.title = '+--- <span>' + rs.name + '</span>';
                    rs.create = true;
                    items.push(rs);
                    let xtemp = yield this.db.getList('select * from @pf_sysmenu where pid=? order by sort asc', rs.id);
                    for (let xrs of xtemp) {
                        xrs.title = '+---+--- <span class="blue">' + xrs.name + '</span>';
                        xrs.create = false;
                        items.push(xrs);
                    }
                }
            }
            this.assign('list', items);
            let time = Date.now();
            this.display('sysmenu');
            console.log('渲染模板', Date.now() - time);
        });
    }
    getOptions(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let opts = [{ value: 0, text: '顶层栏目' }];
            let rows = yield this.db.getList('select * from @pf_sysmenu where pid=0 and id<>? order by sort asc', id);
            for (let item of rows) {
                opts.push({ value: item.id, text: item.name });
                let temp = yield this.db.getList('select * from @pf_sysmenu where pid=? and id<>? order by sort asc', [item.id, id]);
                for (let rs of temp) {
                    opts.push({ value: rs.id, text: '+-- ' + rs.name });
                }
            }
            return opts;
        });
    }
    addAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let pid = this.param('pid:i', 0);
            if (this.isGet()) {
                let row = yield this.db.getRow('select `sort` from @pf_sysmenu  where pid=? order by `sort` desc limit 0,1', pid);
                let sort = row ? row.sort + 10 : 10;
                let opts = yield this.getOptions(0);
                this.assign('row', { pid: pid, sort: sort });
                this.assign('opts', opts);
                this.display('sysmenu_add.form');
                return;
            }
            if (this.isPost()) {
                let { name = '', url = '', icon = '', remark = '' } = this.post();
                let allow = this.post('allow:b', false);
                let sort = this.post('sort:i', 0);
                if (name == '') {
                    this.fail('菜单不可为空');
                }
                let vals = {
                    name: name,
                    url: url,
                    icon: icon,
                    remark: remark,
                    allow: allow,
                    sort: sort,
                    pid: pid
                };
                yield this.db.insert('@pf_sysmenu', vals);
                this.success('添加菜单成功');
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
                let row = yield this.db.getRow('select * from @pf_sysmenu where id=?', id);
                let opts = yield this.getOptions(id);
                this.assign('row', row);
                this.assign('opts', opts);
                this.display('sysmenu_edit.form');
                return;
            }
            if (this.isPost()) {
                let { name = '', url = '', icon = '', remark = '' } = this.post();
                let allow = this.post('allow:b', false);
                let sort = this.post('sort:i', 0);
                let pid = this.post('pid:i', 0);
                if (name == '') {
                    this.fail('菜单不可为空');
                }
                let vals = {
                    name: name,
                    url: url,
                    icon: icon,
                    remark: remark,
                    allow: allow,
                    sort: sort,
                    pid: pid
                };
                yield this.db.update('@pf_sysmenu', vals, id);
                this.success('编辑菜单成功');
            }
        });
    }
    delAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            let count = yield this.db.getOne('select count(1) from @pf_sysmenu where pid=?', id);
            if (count) {
                this.fail('该菜单中含有子菜单，请先删除子菜单');
            }
            yield this.db.delete('@pf_sysmenu', id);
            this.success('删除菜单成功');
        });
    }
    sortAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            let sort = this.param('sort:i', 0);
            yield this.db.update('@pf_sysmenu', {
                sort: sort
            }, id);
            this.success('更新排序成功');
        });
    }
}
exports.Sysmenu = Sysmenu;
//# sourceMappingURL=sysmenu.ctl.js.map