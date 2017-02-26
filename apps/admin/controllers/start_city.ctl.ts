import {AdminController} from "./admin.ctl";
import {Selector} from "../../../src/common/selector";
import {StartCityForm} from "../forms/star_city.form";

export class StartCity extends AdminController {

    public async indexAction() {
        let plist = new Selector('@pf_start_city').order('sort asc').getPageList();
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('startcity');
        console.log(Date.now() - this.context.startTime);
    }

    public async addAction() {
        let form = new StartCityForm(this, StartCityForm.ADD);
        if (this.isGet()) {
            let row = await this.db.getRow('select `sort` from @pf_start_city  order by `sort` desc limit 0,1');
            let sort = row ? row.sort + 10 : 10;
            this.assign('row', {sort: sort});
            form.assignFormScript();
            this.display('startcity_add.form');
            return;
        }
        if (this.isPost()) {
            await form.insert('@pf_start_city');
            this.success('添加出发城市成功');
            console.log(Date.now() - this.context.startTime);
        }
    }

    public async editAction() {
        let form = new StartCityForm(this, StartCityForm.EDIT);
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_start_city where id=?', id);
            this.assign('row', row);
            form.assignFormScript();
            this.display('startcity_edit.form');
            return;
        }
        if (this.isPost()) {
            await form.update('@pf_start_city', id);
            this.success('编辑出发城市成功');
        }
    }

    public async delAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete('@pf_start_city', id);
        this.success('删除出发城市成功');
    }

    public async sortAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:i', 0);
        await this.db.update('@pf_start_city', {
            sort: sort
        }, id);
        this.success('更新排序成功');
    }

    public async nameAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let name = this.param('name:s', '');
        await this.db.update('@pf_start_city', {
            name: name
        }, id);
        this.success('更新名称成功');
    }

}