import {Form} from "../../../src/common/form";

export class StartCityForm extends Form {


    public async load(fields: {[key: string]: any} = null) {

        if (this.type == Form.ADD) {
            this.title = '添加出发地点';
        } else if (this.type == Form.EDIT) {
            this.title = '编辑出发地点';
        }

        this.caption = '字典-出发地点';
        this.back_uri = this.ctl.url('~/start_city');

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
        return await super.load(fields);
    }

}