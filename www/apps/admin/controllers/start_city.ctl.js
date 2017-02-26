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
const selector_1 = require("../../libs/selector");
const star_city_form_1 = require("../forms/star_city.form");
class StartCity extends admin_ctl_1.AdminController {
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let plist = new selector_1.Selector('@pf_start_city').order('sort asc').getPageList();
            let { info, list } = yield plist.getData(this);
            this.assign('list', list);
            this.assign('pdata', info);
            this.display('startcity');
            console.log(Date.now() - this.context.startTime);
        });
    }
    addAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let form = new star_city_form_1.StartCityForm(this, star_city_form_1.StartCityForm.ADD);
            if (this.isGet()) {
                let row = yield this.db.getRow('select `sort` from @pf_start_city  order by `sort` desc limit 0,1');
                let sort = row ? row.sort + 10 : 10;
                this.assign('row', { sort: sort });
                form.assignFormScript();
                this.display('startcity_add.form');
                return;
            }
            if (this.isPost()) {
                yield form.insert('@pf_start_city');
                this.success('添加出发城市成功');
                console.log(Date.now() - this.context.startTime);
            }
        });
    }
    editAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let form = new star_city_form_1.StartCityForm(this, star_city_form_1.StartCityForm.EDIT);
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            if (this.isGet()) {
                let row = yield this.db.getRow('select * from @pf_start_city where id=?', id);
                this.assign('row', row);
                form.assignFormScript();
                this.display('startcity_edit.form');
                return;
            }
            if (this.isPost()) {
                yield form.update('@pf_start_city', id);
                this.success('编辑出发城市成功');
            }
        });
    }
    delAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            yield this.db.delete('@pf_start_city', id);
            this.success('删除出发城市成功');
        });
    }
    sortAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            let sort = this.param('sort:i', 0);
            yield this.db.update('@pf_start_city', {
                sort: sort
            }, id);
            this.success('更新排序成功');
        });
    }
    nameAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.param('id:i', 0);
            if (!id) {
                this.fail('参数有误');
            }
            let name = this.param('name:s', '');
            yield this.db.update('@pf_start_city', {
                name: name
            }, id);
            this.success('更新名称成功');
        });
    }
}
exports.StartCity = StartCity;
//# sourceMappingURL=start_city.ctl.js.map