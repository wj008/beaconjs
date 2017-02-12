import {AdminController} from "./admin.ctl";
import {PageList} from "../../libs/pagelist";

export class CampType extends AdminController {

    public async indexAction() {
        let plist = new PageList('select * from @pf_camp_type order by sort asc');
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display('camp_type');
    }

    public async addAction() {
        if (this.isGet()) {
            let row = await this.db.getRow('select `sort` from @pf_camp_type  order by `sort` desc limit 0,1');
            let sort = row ? row.sort + 10 : 10;
            this.assign('row', {sort: sort});
            this.display('camp_type_add.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:n', 0);
            if (name == '') {
                this.fail('活动类型不可为空', {name: '活动类型不可为空'});
            }
            let vals = {
                name: name,
                sort: sort
            }
            await this.db.insert('@pf_camp_type', vals);
            this.success('添加活动类型成功');
        }
    }

    public async editAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from @pf_camp_type where id=?', id);
            this.assign('row', row);
            this.display('camp_type_edit.form');
            return;
        }
        if (this.isPost()) {
            let {name = '', address = ''}=this.post();
            let sort = this.post('sort:n', 0);
            if (name == '') {
                this.fail('活动类型不可为空', {name: '活动类型不可为空'});
            }
            let vals = {
                name: name,
                sort: sort
            }
            await this.db.update('@pf_camp_type', vals, id);
            this.success('编辑活动类型成功');
        }
    }

    public async delAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete('@pf_camp_type', id);
        this.success('删除活动类型成功');
    }

    public async sortAction() {
        let id = this.param('id:n', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:n', 0);
        await this.db.update('@pf_camp_type', {
            sort: sort
        }, id);
        this.success('更新排序成功');
    }

}