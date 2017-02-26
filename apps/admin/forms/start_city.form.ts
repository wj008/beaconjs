import {Form} from "../../../src/common/form";

export class StartCityForm extends Form {

    public tpl_list = 'startcity';
    public action = '';
    public dbtable = {
        'name': '@pf_start_city',
        'orderby': 'sort asc',
    };

    public async load(fields: {[key: string]: any} = null) {

        this.title = '出发地点';

        if (this.type == Form.ADD) {
            this.action = '添加';
        } else if (this.type == Form.EDIT) {
            this.action = '编辑';
        }

        this.caption = '字典-出发地点';
        this.back_uri = this.ctl.url('~/start_city');

        if (this.type != Form.NONE) {
            this._load = {
                name: {
                    'label': '主题名称',
                    'data_val': {r: true},
                    'data_val_msg': {r: '请输入出发地点名称'},
                    'tips': '请输入出发聚集地点',
                    'box_class': 'form-inp text',
                },
                address: {
                    'label': '详细地址',
                    'data_val': {r: true},
                    'data_val_msg': {r: '请输入聚集详细地址'},
                    'tips': '请输入聚集详细地址',
                    'box_class': 'form-inp text',
                },
                sort: {
                    'label': '排序',
                    'type': 'integer',
                    'data_val': {r: true, int: true},
                    'data_val_msg': {r: '请输入排序值', int: '排序值必须是数值形式'},
                    'var_type': 'i',
                    'tips': '越小越靠前',
                    'box_class': 'form-inp number',
                }
            };
        }
        if (this.type == Form.ADD) {
            let row = await this.ctl.db.getRow('select `sort` from @pf_start_city  order by `sort` desc limit 0,1');
            let sort = row ? row.sort + 10 : 10;
            this._load['sort']['default'] = sort;
        }
        return await super.load(fields);
    }

}