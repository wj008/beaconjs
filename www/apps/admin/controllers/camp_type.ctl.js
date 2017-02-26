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
class CampType extends admin_ctl_1.AdminController {
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let plist = new pagelist_1.PageList('select * from @pf_camp_type order by sort asc');
            let { info, list } = yield plist.getData(this);
            this.assign('list', list);
            this.assign('pdata', info);
            this.display('camp_type');
        });
    }
    addAction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isGet()) {
                let row = yield this.db.getRow('select `sort` from @pf_camp_type  order by `sort` desc limit 0,1');
                let sort = row ? row.sort + 10 : 10;
                this.assign('row', { sort: sort });
                this.display('camp_type_add.form');
                return;
            }
            if (this.isPost()) {
                let { name = '', address = '' } = this.post();
                let sort = this.post('sort:i', 0);
                if (name == '') {
                    this.fail('活动类型不可为空', { name: '活动类型不可为空' });
                }
                let vals = {
                    name: name,
                    sort: sort
                };
                yield this.db.insert('@pf_camp_type', vals);
                this.success('添加活动类型成功');
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
                let row = yield this.db.getRow('select * from @pf_camp_type where id=?', id);
                this.assign('row', row);
                this.display('camp_type_edit.form');
                return;
            }
            if (this.isPost()) {
                let { name = '', address = '' } = this.post();
                let sort = this.post('sort:i', 0);
                if (name == '') {
                    this.fail('活动类型不可为空', { name: '活动类型不可为空' });
                }
                let vals = {
                    name: name,
                    sort: sort
                };
                yield this.db.update('@pf_camp_type', vals, id);
                this.success('编辑活动类型成功');
            }
        });
    }
    delAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            yield this.db.delete('@pf_camp_type', id);
            this.success('删除活动类型成功');
        });
    }
    sortAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            let sort = this.param('sort:i', 0);
            yield this.db.update('@pf_camp_type', {
                sort: sort
            }, id);
            this.success('更新排序成功');
        });
    }
}
exports.CampType = CampType;
//# sourceMappingURL=camp_type.ctl.js.map