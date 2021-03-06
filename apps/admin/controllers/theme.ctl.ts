import {AdminController} from "./admin.ctl";
import {Selector} from "../../../src/common/selector";

export class Theme extends AdminController {

    public async indexAction() {

        let selector = new Selector('@pf_theme');
        let keyword = this.get('keyword:s', '').trim();
        selector.search("`name` LIKE CONCAT('%',?,'%')", keyword);
        selector.order('sort ASC');
        let plist = selector.getPageList();
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('theme');
    }

    public async addAction() {
        if (this.isGet()) {
            let row = await this.db.getRow('select `sort` from @pf_theme  order by `sort` desc limit 0,1');
            let sort = row ? row.sort + 10 : 10;
            this.assign('row', {sort: sort});
            this.display('theme_add.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:i', 0);
            if (name == '') {
                this.fail({name: '活动主题不可为空'});
            }
            let vals = {
                name: name,
                sort: sort
            }
            await this.db.insert('@pf_theme', vals);
            this.success('添加活动主题成功');
        }
    }

    public async editAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_theme where id=?', id);
            this.assign('row', row);
            this.display('theme_edit.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:i', 0);
            if (name == '') {
                this.fail({name: '活动主题不可为空'});
            }
            let vals = {
                name: name,
                sort: sort
            }
            await this.db.update('@pf_theme', vals, id);
            this.success('编辑活动主题成功');
        }
    }

    public async delAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete('@pf_theme', id);
        this.success('删除活动主题成功');
    }

    public async sortAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:i', 0);
        await this.db.update('@pf_theme', {
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
        await this.db.update('@pf_theme', {
            name: name
        }, id);
        this.success('更新名称成功');
    }

}