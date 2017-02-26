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
const pagelist_1 = require("./pagelist");
class SqlItem {
    constructor(text, args = null) {
        this.text = '';
        this.args = null;
        this.text = text;
        this.args = args;
    }
    add(text, args = null) {
        this.text += text;
        if (args != null && args instanceof Array == false) {
            switch (typeof (args)) {
                case 'string':
                case 'number':
                case 'boolean':
                    args = [args];
                    break;
                default:
                    if (beacon_1.Beacon.isDate(args)) {
                        args = [args];
                    }
                    else {
                        args = null;
                    }
                    break;
            }
        }
        if (args == null) {
            return this;
        }
        if (this.args == null) {
            this.args = [];
        }
        this.args = this.args.concat(args);
    }
}
class SqlCondition {
    constructor(type = 'and') {
        this.items = [];
        this.type = 'and';
        this.type = type.toLocaleLowerCase();
    }
    where(sql, args = null) {
        if (sql instanceof SqlCondition) {
            this.items.push(sql);
            return this;
        }
        if (typeof sql != 'string') {
            return this;
        }
        sql = sql.trim();
        if (sql.length == 0) {
            return this;
        }
        if (args != null && args instanceof Array == false) {
            switch (typeof (args)) {
                case 'string':
                case 'number':
                case 'boolean':
                    args = [args];
                    break;
                default:
                    if (beacon_1.Beacon.isDate(args)) {
                        args = [args];
                    }
                    else {
                        args = null;
                    }
                    break;
            }
        }
        this.items.push([sql, args]);
        return this;
    }
    search(sql, value, type = 0, format = null) {
        switch (type) {
            case 0:
                if (beacon_1.Beacon.isEmpty(sql) || beacon_1.Beacon.isEmpty(value)) {
                    return this;
                }
                break;
            case 1:
                if (beacon_1.Beacon.isEmpty(sql) || beacon_1.Beacon.isNull(value)) {
                    return this;
                }
                break;
            case 2:
                if (beacon_1.Beacon.isEmpty(sql) || beacon_1.Beacon.isNull(value)) {
                    return this;
                }
                switch (typeof value) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        if (String(value) == '') {
                            return this;
                        }
                        break;
                    default:
                        return this;
                }
                break;
            case 3:
                if (beacon_1.Beacon.isEmpty(sql) || beacon_1.Beacon.isNull(value)) {
                    return this;
                }
                switch (typeof value) {
                    case 'string':
                        if (value.trim() == '0' || /^[-+]?\d+(\.\d+)$/.test(value.trim())) {
                            return this;
                        }
                        break;
                    case 'number':
                        if (value === 0) {
                            return this;
                        }
                    case 'boolean':
                        if (!value) {
                            return this;
                        }
                        break;
                    default:
                        return this;
                }
                break;
        }
        if (format && typeof format == 'string') {
            value = format.replace(/\{0\}/g, value);
        }
        this.where(sql, value);
        return this;
    }
    getFrame() {
        let sqlItems = [];
        let sqla = [];
        let args = [];
        for (let item of this.items) {
            if (item instanceof SqlCondition) {
                let frame = item.getFrame();
                if (frame.sql) {
                    if (frame.type) {
                        sqlItems.push([frame.type + ' (' + frame.sql + ')', frame.args]);
                    }
                    else {
                        sqlItems.push(['(' + frame.sql + ')', frame.args]);
                    }
                }
            }
            else {
                sqlItems.push(item);
            }
        }
        for (let item of sqlItems) {
            let [tempSql, tempArgs] = item;
            if (/^or\s+/i.test(tempSql)) {
                if (sqla.length == 0) {
                    tempSql = tempSql.replace(/^or\s+/i, '');
                }
            }
            else if (/^and\s+/i.test(tempSql)) {
                if (sqla.length == 0) {
                    tempSql = tempSql.replace(/^and\s+/i, '');
                }
            }
            else {
                if (sqla.length > 0) {
                    tempSql = 'and ' + tempSql;
                }
            }
            sqla.push(tempSql);
            if (tempArgs instanceof Array) {
                args = args.concat(tempArgs);
            }
            else if (typeof tempArgs == 'string' || typeof tempArgs == 'number' || tempArgs == 'boolean' || beacon_1.Beacon.isDate(tempArgs)) {
                args.push(tempArgs);
            }
        }
        return { sql: sqla.join(' '), args: args, type: this.type };
    }
}
exports.SqlCondition = SqlCondition;
class Selector {
    constructor(table) {
        this.table = '';
        this._order = null;
        this._group = null;
        this._find = null;
        this._limit = '';
        this.condition = null;
        this.table = table;
        this.condition = new SqlCondition();
    }
    where(sql, args = null) {
        this.condition.where(sql, args);
        return this;
    }
    search(sql, value, type = 0, format = null) {
        this.condition.search(sql, value, type, format);
        return this;
    }
    getFrame() {
        return this.condition.getFrame();
    }
    field(find, args = null) {
        this._find = new SqlItem(find, args);
        return this;
    }
    order(order, args = null) {
        order = order.trim();
        if (!/^by\s+/i.test(order)) {
            order = 'by ' + order;
        }
        if (this._order == null) {
            this._order = new SqlItem(order, args);
        }
        else {
            this._order.add(',' + order, args);
        }
        return this;
    }
    group(group, args = null) {
        group = group.trim();
        if (/^by\s+/i.test(group)) {
            group = group.replace(/^by\s+/i, '');
        }
        if (this._group == null) {
            this._group = new SqlItem(group, args);
        }
        else {
            this._group.add(',' + group, args);
        }
        return this;
    }
    limit(offset = 0, len = 0) {
        if (offset == 0 && len == 0) {
            return this;
        }
        if (len == 0) {
            this._limit = 'limit ' + offset;
        }
        else {
            this._limit = 'limit ' + offset + ',' + len;
        }
        return this;
    }
    createSql(type = 0) {
        let sqla = [];
        let args = [];
        if (type == 2) {
            sqla.push('SELECT COUNT(*) FROM ' + this.table);
        }
        else if (type == 1) {
            let findText = 'A.*';
            let findArgs = null;
            if (this._find) {
                findText = this._find.text;
                findArgs = this._find.args;
            }
            sqla.push(`SELECT A.* FROM \`${this.table}\` A,(SELECT id FROM \`${this.table}\``);
            if (findArgs && findArgs instanceof Array) {
                args = args.concat(findArgs);
            }
        }
        else {
            let findText = '*';
            let findArgs = null;
            if (this._find) {
                findText = this._find.text;
                findArgs = this._find.args;
            }
            sqla.push(`SELECT ${findText} FROM \`${this.table}\``);
            if (findArgs && findArgs instanceof Array) {
                args = args.concat(findArgs);
            }
        }
        let frame = this.condition.getFrame();
        if (frame.sql) {
            if (/^(and|or)\s+/i.test(frame.sql)) {
                sqla.push(frame.sql.replace(/^(and|or)\s+/i, ''));
            }
            else {
                sqla.push(frame.sql);
            }
        }
        if (frame.args && frame.args instanceof Array) {
            args = args.concat(frame.args);
        }
        if (this._group) {
            let groupText = this._group.text;
            let groupArgs = this._group.args;
            if (groupText) {
                sqla.push('group by ' + groupText);
            }
            if (groupArgs) {
                args = args.concat(groupArgs);
            }
        }
        if (type != 2 && this._order) {
            let orderText = this._order.text;
            let orderArgs = this._order.args;
            if (orderText) {
                sqla.push('order ' + orderText);
            }
            if (orderArgs) {
                args = args.concat(orderArgs);
            }
        }
        if (type != 2 && this._limit) {
            sqla.push(this._limit);
        }
        if (type == 1) {
            sqla.push(') B where A.id=B.id');
            if (this._order) {
                let orderText = this._order.text;
                let orderArgs = this._order.args;
                if (orderText) {
                    orderText = orderText.replace(/by\s+(`?\w+`?)\s+(desc|asc)/ig, function ($0, $1, $2) {
                        return 'by A.' + $1 + ' ' + $2;
                    });
                    sqla.push('order ' + orderText);
                }
                if (orderArgs) {
                    args = args.concat(orderArgs);
                }
            }
        }
        return { sql: sqla.join(' '), args: args };
    }
    getCount(db) {
        return __awaiter(this, void 0, void 0, function* () {
            let { sql = '', args = null } = this.createSql(2);
            let count = yield db.getOne(sql, args);
            if (count === null) {
                return -1;
            }
            let ret = parseInt(count);
            return ret;
        });
    }
    getPageList(size = 20, keyname = 'page', count = -1, only_count = -1) {
        let that = this;
        if (count == -1) {
            count = function (db) {
                return that.getCount(db);
            };
        }
        let plist = new pagelist_1.PageList('', null, size, keyname, count, only_count);
        plist.getList = function (ctl) {
            return __awaiter(this, void 0, void 0, function* () {
                let info = yield this.getInfo(ctl);
                let start = (this.page - 1) * this.page_size;
                if (start < 0) {
                    start = 0;
                }
                that.limit(start, this.page_size);
                let { sql = '', args = null } = that.createSql(1);
                //console.log(sql,args);
                let list = yield ctl.db.getList(sql, this.args);
                return list;
            });
        };
        return plist;
    }
    getList(db) {
        let { sql = '', args = null } = this.createSql(0);
        return db.getList(sql, args);
    }
}
exports.Selector = Selector;
//# sourceMappingURL=selector.js.map