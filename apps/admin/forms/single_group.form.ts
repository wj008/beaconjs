import {Form} from "../../../src/common/form";

export class SingleGroupForm extends Form {

    public tplList = 'singlegroup';
    public title = '文章分组';
    public caption = '字典-文章分组';
    public table = '@pf_singlegroup';
    public orderby = 'sort ASC'

    public async load(fields: {[key: string]: any} = null) {
        if (this.type != Form.NONE) {
            this._load = {
                name: {
                    'label': '分组名称',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入分组名称'},
                    'tips': '请输入分组名称',
                    'box-class': 'form-inp text',
                },
                sort: {
                    'label': '排序',
                    'type': 'integer',
                    'data-val': {r: true, int: true},
                    'data-val-msg': {r: '请输入排序值', int: '排序值必须是数值形式'},
                    'tips': '越小越靠前',
                    'box-class': 'form-inp number',
                },
            };
        }

        if (this.type == Form.ADD) {
            let sort = await this.ctl.db.getMax(this.table, 'sort');
            this._load['sort']['default'] = sort ? sort + 10 : 10;
        }
        return await super.load(fields);
    }

}