import {AdminController} from "./admin.ctl";
import {Selector} from "../../../src/common/selector";
import {Beacon} from "../../../src/core/beacon";
import {Form} from "../../../src/common/form";
import path=require('path');
import fs=require('fs');

export class CmsController extends AdminController {

    public form = null;
    public static picks = {};

    public async init() {
        await super.init();
        let fname = Beacon.toUnder(this.route('ctl'));
        if (CmsController.picks[fname]) {
            let cls = CmsController.picks[fname] || null;
            if (cls) {
                this.form = new cls(this, Form.NONE);
                return;
            }
        }
        let filename = path.join(__dirname, '../forms/' + fname + '.form.js');
        if (fs.existsSync(filename)) {
            let pick = require(filename);
            let cname = Beacon.toCamel(fname) + 'Form';
            let cls = pick[cname] || null;
            if (cls) {
                CmsController.picks[fname] = cls;
                this.form = new cls(this, Form.NONE);
                return;
            }
        }
        this.fail('没有找到页面');
    }

    public async indexAction() {
        let selector = new Selector(this.form.dbtable.name);
        if (this.form.dbtable.orderby) {
            selector.order(this.form.dbtable.orderby);
        }
        let plist = selector.getPageList();
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display(this.form.tpl_list);
        console.log(Date.now() - this.context.startTime);
    }

    public async addAction() {
        let form = await this.form.setType(Form.ADD).init();
        if (this.isGet()) {
            form.display();
            return;
        }
        if (this.isPost()) {
            await form.insert(form.dbtable.name);
            this.success(form.action + form.title + '成功');
            console.log(Date.now() - this.context.startTime);
        }
    }

    public async editAction() {
        let form = await this.form.setType(Form.EDIT).init();
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        if (this.isGet()) {
            let row = await this.db.getRow('select * from ' + form.dbtable.name + ' where id=?', id);
            await form.initValues(row);
            form.display();
            return;
        }
        if (this.isPost()) {
            await form.update(form.dbtable.name, id);
            this.success(form.action + form.title + '成功');
        }
    }

    public async delAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        await this.db.delete(this.form.dbtable.name, id);
        this.success('删除出发城市成功');
    }

    public async sortAction() {
        let id = this.param('id:i', 0);
        if (!id) {
            this.fail('参数有误');
        }
        let sort = this.param('sort:i', 0);
        await this.db.update(this.form.dbtable.name, {
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
        await this.db.update(this.form.dbtable.name, {
            name: name
        }, id);
        this.success('更新名称成功');
    }

}