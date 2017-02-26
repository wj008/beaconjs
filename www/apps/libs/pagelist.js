"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const beacon_1 = require("../../src/core/beacon");
class PageList {
    constructor(sql, args = null, size = 20, keyname = 'page', count = -1, only_count = -1) {
        this.sql = sql;
        this.page_size = Math.floor(size);
        this.keyname = keyname;
        this.args = args;
        this.page_count = -1;
        this.records_count = count;
        this.only_count = only_count;
        this.info = null;
    }
    getPageCount(count, size) {
        let pagecount = 1;
        if ((count % size) == 0) {
            pagecount = (count / size);
        }
        else {
            pagecount = Math.floor(count / size) + 1;
        }
        if (pagecount == 0) {
            pagecount = 1;
        }
        return pagecount;
    }
    getInfo(ctl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.info != null) {
                return this.info;
            }
            this.page = ctl.get(this.keyname + ':n', 1);
            let query = (function () {
                let temps = ctl.get();
                let items = [];
                for (let key in temps) {
                    items.push(key + '=' + encodeURIComponent(temps[key]));
                }
                return items.join('&');
            })();
            if (this.records_count === -1) {
                let sql = null;
                if (this.sql.toLowerCase().indexOf(' from ') === this.sql.toLowerCase().lastIndexOf(' from ')) {
                    sql = this.sql.replace(/^select\s+(distinct\s+[a-z][a-z0-9]+\s*,)?(.*)\s+from\s+/i, 'select $1count(1) as temp_count from ');
                }
                else {
                    sql = 'select count(1) as temp_count  from (' + this.sql + ') tempTable';
                }
                let row = yield ctl.db.getRow(sql, this.args);
                this.records_count = row.temp_count;
            }
            else {
                if (typeof this.records_count == 'string' && !beacon_1.Beacon.isNumeric(this.records_count)) {
                    this.records_count = yield ctl.db.getOne(this.records_count);
                }
                if (typeof this.records_count == 'function') {
                    this.records_count = this.records_count(ctl.db);
                }
                if (beacon_1.Beacon.isPromise(this.records_count)) {
                    this.records_count = yield this.records_count;
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
        });
    }
    getList(ctl) {
        return __awaiter(this, void 0, void 0, function* () {
            let info = yield this.getInfo(ctl);
            let start = (this.page - 1) * this.page_size;
            if (start < 0) {
                start = 0;
            }
            let sql = this.sql + ' limit ' + start + ' , ' + this.page_size;
            let list = yield ctl.db.getList(sql, this.args);
            return list;
        });
    }
    getData(ctl) {
        return __awaiter(this, void 0, void 0, function* () {
            let info = yield this.getInfo(ctl);
            let list = yield this.getList(ctl);
            return { info: info, list: list };
        });
    }
}
exports.PageList = PageList;
//# sourceMappingURL=pagelist.js.map