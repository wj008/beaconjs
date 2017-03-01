import {Form} from "../../../src/common/form";

export class AreaForm extends Form {

    public tplList = 'area';
    public title = '城市区域';
    public caption = '字典-城市区域';
    public table = '@pf_area';
    public orderby = 'sort ASC'

    public constructor(ctl: any, type: number = Form.NONE) {
        super(ctl, type);
        this.backUri = ctl.url('~/area');
    }

    public async load(fields: {[key: string]: any} = null) {
        if (this.type != Form.NONE) {
            this._load = {
                name: {
                    'label': '地理位置名称',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入地理位置名称'},
                    'tips': '请输入地理位置，可以添加多个，每行一个',
                    'box-class': 'form-inp text',
                },
                allow: {
                    'label': '是否启用',
                    'type': 'bool',
                    'default': true,
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
            this._load['name']['type'] = 'textarea';
            let sort = await this.ctl.db.getMax(this.table, 'sort');
            this._load['sort']['default'] = sort ? sort + 10 : 10;
        }

        return await super.load(fields);
    }

}