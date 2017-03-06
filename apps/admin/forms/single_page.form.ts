import {Form} from "../../../src/common/form";

export class SinglePageForm extends Form {

    public tplList = 'singlepage';
    public title = '文章单页';
    public caption = '字典-文章单页';
    public table = '@pf_singlepage';
    public orderby = 'sort ASC'


    public async load(fields: {[key: string]: any} = null) {
        if (this.type != Form.NONE) {
            this._load = {
                title: {
                    'label': '标题',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入文章标题'},
                    'tips': '请输入文章标题',
                    'box-class': 'form-inp ltext',
                },
                key: {
                    'label': '标识',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入文章标识'},
                    'tips': '请输入文章标识',
                    'box-class': 'form-inp text',
                },
                group: {
                    'label': '标识',
                    'var-type': 'i',
                    'type': 'select',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请选择分组'},
                    'tips': '选择所属分组',
                    'box-class': 'form-inp select',
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
                islink: {
                    'label': '是否连接地址',
                    'type': 'bool',
                    'default': true,
                },
                link: {
                    'label': '是否连接地址',
                    'view-hide': true,
                    'data-val': {r: true, url: true},
                    'data-val-msg': {r: '请输入连接地址', url: '连接格式不正确'},
                    'data-val-off': true,
                    'tips': '填写连接地址',
                    'box-class': 'form-inp text',
                },
                content: {
                    'label': '文章内容',
                    'type': 'xheditor',
                    'data-val': {r: true},
                    'data-val-msg': {r: '请输入文章内容'},
                    'tips': '请输入文章内容',
                    'box-class': 'form-inp xh-editor',
                },
            };
        }
        if (this.type == Form.ADD) {
            let sort = await this.ctl.db.getMax(this.table, 'sort');
            this._load['sort']['default'] = sort ? sort + 10 : 10;
        }

        let opts = await this.ctl.db.getList('select name as text,id as value from @pf_singlegroup order by id asc');
        opts.unshift({text: '请选择文章分组', value: ''});
        this._load['group']['options'] = opts;

        return await super.load(fields);
    }

    public beforeValid() {
        if (this.fields['islink'].value) {
            this.fields['link'].dataValOff = false;
            this.fields['content'].dataValOff = true;
        } else {
            this.fields['link'].dataValOff = true;
            this.fields['content'].dataValOff = false;
        }
    }

}