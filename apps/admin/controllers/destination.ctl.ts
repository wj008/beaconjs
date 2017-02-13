import {AdminController} from "./admin.ctl";
import {PageList} from "../../libs/pagelist";

export class Destination extends AdminController {

    public async indexAction() {
        let plist = new PageList('select * from @pf_destination order by sort asc');
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('destination');
    }

    public async addAction() {
        if (this.isGet()) {
            let row = await this.db.getRow('select `sort` from @pf_destination  order by `sort` desc limit 0,1');
            let sort = row ? row.sort + 10 : 10;
            this.assign('row', {sort: sort});
            this.display('destination_add.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:n', 0);
            if (name == '') {
                this.fail('目的地不可为空', {name: '目的地不可为空'});
            }
            let vals = {
                name: name,
                sort: sort
            }
            await this.db.insert('@pf_destination', vals);
            this.success('添加目的地成功');
        }
    }

    public async editAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_destination where id=?', id);
            this.assign('row', row);
            this.display('destination_edit.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:n', 0);
            if (name == '') {
                this.fail('目的地不可为空', {name: '目的地不可为空'});
            }
            let vals = {
                name: name,
                sort: sort
            }
            await this.db.update('@pf_destination', vals, id);
            this.success('编辑目的地成功');
        }
    }

    public async delAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete('@pf_destination', id);
        this.success('删除目的地成功');
    }

    public async sortAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:n', 0);
        await this.db.update('@pf_destination', {
            sort: sort
        }, id);
        this.success('更新排序成功');
    }

    public async nameAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let name = this.param('name:s', '');
        await this.db.update('@pf_destination', {
            name: name
        }, id);
        this.success('更新名称成功');
    }

}