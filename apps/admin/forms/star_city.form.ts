import {Form} from "../../../src/common/form";

export class StartCityForm extends Form {

    public async load(fields: {[key: string]: any} = null) {
        this._load = {
            name: {
                'label': '',
                'data_val': {r: true},
                'data_val_msg': {r: '请输入出发地点名称'},
            },
            address: {
                'data_val': {r: true},
                'data_val_msg': {r: '请输入聚集详细地址'},
            },
            sort: {
                'data_val': {r: true, int: true},
                'data_val_msg': {r: '请输入排序值', int: '排序值必须是数值形式'},
                'var_type': 'i',
            }
        };
        return await super.load(fields);
    }

}