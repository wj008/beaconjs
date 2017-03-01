import {Form} from "../../../src/common/form";
import {Selector} from "../../../src/common/selector";
import {AreaForm} from "../forms/area.form";
import {AdminController} from "./admin.ctl";

export class Area extends AdminController {

    public form = null;

    public async init() {
        await super.init();
        this.form = new AreaForm(this, Form.NONE);
    }

    public async indexAction() {
        let pid = this.get('pid:i', 0);
        let form = await this.form;
        let selector = new Selector(form.table);
        selector.where('pid=?', pid);
        if (this.form.orderby) {
            selector.order(form.orderby);
        }
        let plist = selector.getPageList();
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        let prow = null;
        if (pid > 0) {
            prow = await this.db.getRow('select * from ' + form.table + ' where id=?', pid);
        }
        this.assign('prow', prow);
        this.display(this.form.tplList);
        console.log(Date.now() - this.context.startTime);
    }

    public async addAction() {
        let form = await this.form.setType(Form.ADD).init();
        if (this.isGet()) {
            form.display();
            return;
        }
        if (this.isPost()) {
            let pid = this.get('pid:i', 0);
            let vals = await form.autoComplete(true);
            let names = vals['name'].split(/\n|,/);
            for (let name of names) {
                vals['name'] = name.trim();
                vals['pid'] = pid;
                if (pid == 0) {
                    vals['level'] = 1;
                } else {
                    let level = await this.db.getOne('select level from ' + form.table + ' where id=?', pid);
                    if (level === null) {
                        level = 1;
                    } else {
                        level = level + 1;
                    }
                }
                await this.db.insert(form.table, vals);
            }
            this.success('添加' + form.title + '成功');
            console.log(Date.now() - this.context.startTime);
        }
    }

    public async editAction() {
        let form = await this.form.setType(Form.EDIT).init();
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let row = await this.db.getRow('select * from ' + form.table + ' where id=?', id);
        if (row == null) {
            this.fail('不存在的数据信息');
        }
        if (this.isGet()) {
            await form.initValues(row);
            form.display();
            return;
        }
        if (this.isPost()) {
            let vals = await form.autoComplete(true);
            vals['level'] = row.pid == 0 ? 1 : 2;
            await this.db.update(form.table, vals, id);
            this.success('编辑' + form.title + '成功');
        }
    }

    public async delAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let c = await this.db.getOne('select count(1) from ' + this.form.table + ' where pid=?', id);
        if (c !== null && c > 0) {
            this.fail('该地区存在下级数据，请先删除下级数据');
        }
        await this.db.delete(this.form.table, id);
        this.success('删除' + this.form.title + '成功');
    }

    public async allowAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let allow = await this.db.getOne('select allow from ' + this.form.table + ' where id=?', id);
        allow = allow == 1 ? 0 : 1;
        await this.db.update(this.form.table, {
            allow: allow
        }, id);
        let ret: any = {};
        ret.message = '操作成功';
        ret.status = true;
        ret.info = {allow: allow};
        this.returnJson(ret);
    }

    public async sortAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:i', 0);
        await this.db.update(this.form.table, {
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
        await this.db.update(this.form.table, {
            name: name
        }, id);
        this.success('更新名称成功');
    }
}