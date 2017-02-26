import {Form} from "../../../src/common/form";

export class StartCityForm extends Form {

    public tpl_list = 'startcity';
    public title = '出发地点';
    public caption = '字典-出发地点';
    public table = '@pf_start_city';
    public orderby = 'sort asc'

    public constructor(ctl: any, type: number = Form.NONE) {
        super(ctl, type);
        this.back_uri = ctl.url('~/start_city');
    }

    public async load(fields: {[key: string]: any} = null) {
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