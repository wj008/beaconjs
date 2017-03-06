import {CmsController} from "./cms.ctl";
import {Selector} from "../../../src/common/selector";

export class SingleGroup extends CmsController {

    public async indexAction() {
        let form = await this.form;
        let selector = new Selector(form.table);
        let keyword = this.get('keyword:s', '').trim();
        selector.search("`name` LIKE CONCAT('%',?,'%')", keyword);
        if (this.form.orderby) {
            selector.order(form.orderby);
        }
        let plist = selector.getPageList();
        let {info, list} = await plist.getData(this);
        this.assign('list', list);
        this.assign('pdata', info);
        this.display(this.form.tplList);
        console.log(Date.now() - this.context.startTime);
    }
}