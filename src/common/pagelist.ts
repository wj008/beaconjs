import {Beacon} from "../core/beacon";
export class PageList {

    private sql: string;
    private records_count: number;  //记录数
    private only_count: number; //仅显示
    private page_size: number; //页面大小
    private page_count: number; //最大页数
    private keyname: string;
    private args: any;
    private info: any;
    private page: number;

    public constructor(sql: string, args: any = null, size: number = 20, keyname: string = 'page', count: any = -1, only_count: number = -1) {
        this.sql = sql;
        this.page_size = Math.floor(size);
        this.keyname = keyname;
        this.args = args;
        this.page_count = -1;
        this.records_count = count;
        this.only_count = only_count;
        this.info = null;
    }

    private getPageCount(count: number, size: number) {
        let pagecount: number = 1;
        if ((count % size) == 0) {
            pagecount = (count / size);
        } else {
            pagecount = Math.floor(count / size) + 1;
        }
        if (pagecount == 0) {
            pagecount = 1;
        }
        return pagecount;
    }

    public async getInfo(ctl) {
        if (this.info != null) {
            return this.info;
        }
        this.page = ctl.get(this.keyname + ':n', 1);
        let query = (function () {
            let temps = ctl.context.query;
            let items = [];
            for (let key in temps) {
                items.push(key + '=' + encodeURIComponent(temps[key]));
            }
            return items.join('&');
        })();
        if (this.records_count === -1) {
            let sql: string = null;
            if (this.sql.toLowerCase().indexOf(' from ') === this.sql.toLowerCase().lastIndexOf(' from ')) {
                sql = this.sql.replace(/^select\s+(distinct\s+[a-z][a-z0-9]+\s*,)?(.*)\s+from\s+/i, 'select $1count(1) as temp_count from ');
            } else {
                sql = 'select count(1) as temp_count  from (' + this.sql + ') tempTable';
            }
            let row = await ctl.db.getRow(sql, this.args);
            this.records_count = row.temp_count;
        } else {
            if (typeof this.records_count == 'string' && !Beacon.isNumeric(this.records_count)) {
                this.records_count = await ctl.db.getOne(this.records_count);
            }
            if (typeof this.records_count == 'function') {
                this.records_count = this.records_count(ctl.db);
            }
            if (Beacon.isPromise(this.records_count)) {
                this.records_count = await  this.records_count;
            }
        }
        if (this.only_count == -1 || this.only_count > this.records_count) {
            this.only_count = this.records_count;
        }
        if (this.page_count == -1) {
            this.page_count = this.getPageCount(this.only_count, this.page_size);
        }
        if (this.page <= 0) {
            this.page = 1;
        }
        if (this.page > this.page_count) {
            this.page = this.page_count;
        }
        this.info = {
            keyname: this.keyname,
            query: query,
            page: this.page,
            page_count: this.page_count,
            records_count: this.records_count,
            only_count: this.only_count,
            page_size: this.page_size
        };
        return this.info;
    }

    public async getList(ctl) {
        let info = await this.getInfo(ctl);
        let start = (this.page - 1) * this.page_size;
        if (start < 0) {
            start = 0;
        }
        let sql: string = this.sql + ' limit ' + start + ' , ' + this.page_size;
        let list = await ctl.db.getList(sql, this.args);
        return list;
    }

    public async getData(ctl) {
        let info = await this.getInfo(ctl);
        let list = await this.getList(ctl);
        return {info: info, list: list};
    }

}