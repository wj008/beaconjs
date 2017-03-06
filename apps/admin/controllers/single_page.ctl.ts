import {CmsController} from "./cms.ctl";
import {Selector} from "../../../src/common/selector";
import {Form} from "../../../src/common/form";

export class SinglePage extends CmsController {

    public async indexAction() {
        let form = await this.form;
        let selector = new Selector(form.table);
        let keyword = this.get('keyword:s', '').trim();
        if (keyword) {
            selector.where("(`title` LIKE CONCAT('%',?,'%') OR `key` LIKE CONCAT('%',?,'%'))", [keyword, keyword]);
        }
        if (this.form.orderby) {
            selector.order(form.orderby);
        }
        let plist = selector.getPageList();
        let {info, list} = await plist.getData(this);
        let map = {};
        for (let item of list) {
            if (map[item.group] !== void 0) {
                item.groupName = map[item.group];
                continue;
            }
            let row = await this.db.getRow('select name from @pf_singlegroup where id=?', item.group);
            map[item.group] = item.groupName = row ? row.name : '';
        }
        this.assign('list', list);
        this.assign('pdata', info);
        this.display(this.form.tplList);
        console.log(Date.now() - this.context.startTime);
    }

    public async addAction() {
        let form = await this.form.setType(Form.ADD).init();
        if (this.isGet()) {
            form.display('singlepage.form');
            return;
        }
        if (this.isPost()) {
            await form.insert(form.table);
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
        if (this.isGet()) {
            let row = await this.db.getRow('select * from ' + form.table + ' where id=?', id);
            await form.initValues(row);
            form.display('singlepage.form');
            return;
        }
        if (this.isPost()) {
            await form.update(form.table, id);
            this.success('编辑' + form.title + '成功');
        }
    }
}