import {Form} from "../../../src/common/form";

export class StartCityForm extends Form {

    public tplList = 'startcity';
    public title = '出发地点';
    public caption = '字典-出发地点';
    public table = '@pf_start_city';
    public orderby = 'sort ASC'

    public constructor(ctl: any, type: number = Form.NONE) {
        super(ctl, type);
        this.backUri = ctl.url('~/start_city');
    }

    public async load(fields: {[key: string]: any} = null) {
        if (this.type != Form.NONE) {
            this._load = {
                name: {
                    'label': '主题名称',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入出发地点名称'},
                    'tips': '请输入出发聚集地点',
                    'box-class': 'form-inp text',
                },
                address: {
                    'label': '详细地址',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入聚集详细地址'},
                    'tips': '请输入聚集详细地址',
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
                addtime: {
                    'label': '时间',
                    'type': 'upfile',
                    'data-val': {r: true, date: true},
                    'data-val-msg': {r: '时间不可为空', date: '请输入正确的时间格式'},
                    'tips': '越小越靠前',
                    'box-class': 'form-inp upfile',
                },
                test: {
                    'label': '测试',
                    'options': [
                        {
                            group: [
                                {value: 1, text: '选项1'},
                                {value: 2, text: '选项2'},
                            ], text: '选择组1'
                        },
                        {value: 4, text: '选项3'},
                        {value: 8, text: '选项4'}
                    ],
                    'names': ['a', 'b', 'c', 'd'],
                    'type': 'xheditor',
                    'box-class': 'form-inp xh-editor',
                    // 'tips': '请选择1个选项',
                }
            };
        }

        if (this.type == Form.ADD) {
            let sort = await this.ctl.db.getMax('@pf_start_city', 'sort');
            this._load['sort']['default'] = sort ? sort + 10 : 10;
        }

        return await super.load(fields);
    }

}