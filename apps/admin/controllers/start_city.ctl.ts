import {AdminController} from "./admin.ctl";
import {PageList} from "../../libs/pagelist";

export class StartCity extends AdminController {

    public async indexAction() {
        let plist = new PageList('select * from @pf_start_city order by sort asc');
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('startcity');
        console.log(Date.now() - this.context.startTime);
    }

    public async addAction() {
        if (this.isGet()) {
            let row = await this.db.getRow('select `sort` from @pf_start_city  order by `sort` desc limit 0,1');
            let sort = row ? row.sort + 10 : 10;
            this.assign('row', {sort: sort});
            this.display('startcity_add.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:n', 0);
            if (name == '') {
                this.fail('出发城市不可为空', {name: '出发城市不可为空'});
            }
            if (address == '') {
                this.fail('详细地址不可为空', {address: '详细地址不可为空'});
            }
            let vals = {
                name: name,
                sort: sort,
                address: address
            }
            await this.db.insert('@pf_start_city', vals);
            this.success('添加出发城市成功');
            console.log(Date.now() - this.context.startTime);
        }
    }

    public async editAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_start_city where id=?', id);
            this.assign('row', row);
            this.display('startcity_edit.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:n', 0);
            if (name == '') {
                this.fail('出发城市不可为空', {name: '出发城市不可为空'});
            }
            if (address == '') {
                this.fail('详细地址不可为空', {address: '详细地址不可为空'});
            }
            let vals = {
                name: name,
                sort: sort,
                address: address
            }
            await this.db.update('@pf_start_city', vals, id);
            this.success('编辑出发城市成功');
        }
    }

    public async delAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete('@pf_start_city', id);
        this.success('删除出发城市成功');
    }

    public async sortAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:n', 0);
        await this.db.update('@pf_start_city', {
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
        await this.db.update('@pf_start_city', {
            sort: name
        }, id);
        this.success('更新名称成功');
    }

}