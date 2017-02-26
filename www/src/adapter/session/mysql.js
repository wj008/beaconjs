"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mysql_1 = require("../db/mysql");
class MysqlSession {
    constructor() {
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        this._isUpdate = false;
        this._row = null;
        if (MysqlSession.timeout != null) {
            return;
        }
        let options = Beacon.getConfig('session:*');
        MysqlSession.timeout = options.timeout || 3600;
        MysqlSession.checkTime = options.checkTime || 300;
    }
    init(cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cookie || typeof cookie !== 'string') {
                return;
            }
            this._cookie = cookie;
            this._isUpdate = false;
            if (!MysqlSession.init) {
                let isInit = yield mysql_1.Mysql.getDBInstance().existsTable('@pf_session');
                let pf = mysql_1.Mysql.getDBInstance().prefix;
                if (!isInit) {
                    yield mysql_1.Mysql.getDBInstance().query(`CREATE TABLE \`${pf}session\` (
                \`sid\` varchar(50) NOT NULL,
                \`value\` varchar(255) DEFAULT NULL,
                \`expire\` int(11) DEFAULT NULL,
                \`longv\` tinyint(1) DEFAULT NULL,
                PRIMARY KEY (\`sid\`)
                ) ENGINE=MEMORY DEFAULT CHARSET=utf8 MAX_ROWS=100000000;`);
                }
                let isInitLong = yield mysql_1.Mysql.getDBInstance().existsTable('@pf_session_long');
                if (!isInitLong) {
                    yield mysql_1.Mysql.getDBInstance().query(`CREATE TABLE \`${pf}session_long\` (
              \`sid\` varchar(50) NOT NULL,
              \`value\` text,
              \`expire\` int(11) DEFAULT NULL,
              PRIMARY KEY (\`sid\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);
                }
                MysqlSession.init = true;
            }
            let time = Math.round(Date.now() / 1000);
            let text = '';
            let row = yield mysql_1.Mysql.getDBInstance().getRow('select value,`longv`,expire from @pf_session where sid=? and expire>?', [cookie, time]);
            if (row == null) {
                this._data = { data: {}, expire: 0 };
                this._isInit = true;
                return;
            }
            else {
                this._row = row;
                if (row.longv == 1) {
                    row = yield mysql_1.Mysql.getDBInstance().getRow('select value,expire from @pf_session_long where sid=? and expire>?', [cookie, time]);
                    if (row == null) {
                        this._data = { data: {}, expire: 0 };
                        this._isInit = true;
                        return;
                    }
                }
                text = row.value;
            }
            if (text == '') {
                this._data = { data: {}, expire: 0 };
                this._isInit = true;
                return;
            }
            try {
                let json = JSON.parse(String(text));
                if (json == null) {
                    this._data = { data: {}, expire: 0 };
                    this._isInit = true;
                    return;
                }
                this._data = { data: json, expire: row.expire };
                this._isInit = true;
                return;
            }
            catch (e) {
                this._data = { data: {}, expire: 0 };
                this._isInit = true;
                return;
            }
        });
    }
    get(name) {
        if (!this._isInit || !this._data) {
            return null;
        }
        let time = Math.round(Date.now() / 1000);
        if (this._data.expire < time) {
            this._data = null;
            return null;
        }
        if (name === void 0) {
            return this._data.data || {};
        }
        return this._data.data[name];
    }
    set(name, value) {
        if (!this._isInit) {
            return;
        }
        this._data = this._data || { data: {}, expire: 0 };
        if (this._isUpdate === false) {
            let oldval = this._data.data[name] === void 0 ? null : this._data.data[name];
            let oldtext = JSON.stringify(oldval);
            let newtext = JSON.stringify(value);
            if (oldtext.length !== newtext.length) {
                this._isUpdate = true;
            }
            else if (oldtext != newtext) {
                this._isUpdate = true;
            }
        }
        this._data.data[name] = value;
        this._data.expire = Math.round(Date.now() / 1000) + MysqlSession.timeout;
    }
    delete(name) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            let cookie = this._cookie;
            let row = this._row;
            //如果为空删除
            if (this._data == null) {
                if (row == null) {
                    return;
                }
                if (row.longv == 1) {
                    yield mysql_1.Mysql.getDBInstance().delete('@pf_session_long', 'sid=?', cookie);
                }
                yield mysql_1.Mysql.getDBInstance().delete('@pf_session', 'sid=?', cookie);
                return;
            }
            //如果没有更改仅修改时间即可
            if (!this._isUpdate) {
                this._data.expire = Math.round(Date.now() / 1000) + MysqlSession.timeout;
                if (row != null && row.expire + 10 < this._data.expire) {
                    yield mysql_1.Mysql.getDBInstance().update('@pf_session', { expire: this._data.expire }, 'sid=?', cookie);
                    if (row.longv == 1) {
                        yield mysql_1.Mysql.getDBInstance().update('@pf_session_long', { expire: this._data.expire }, 'sid=?', cookie);
                    }
                }
                return;
            }
            let text = JSON.stringify(this._data.data || {});
            if (row != null) {
                //长度小于250
                if (text.length <= 250) {
                    yield mysql_1.Mysql.getDBInstance().update('@pf_session', {
                        value: text,
                        longv: 0,
                        expire: this._data.expire
                    }, 'sid=?', cookie);
                    if (row.longv == 1) {
                        yield mysql_1.Mysql.getDBInstance().delete('@pf_session_long', 'sid=?', cookie);
                    }
                }
                else {
                    yield mysql_1.Mysql.getDBInstance().update('@pf_session', {
                        value: '',
                        longv: 1,
                        expire: this._data.expire
                    }, 'sid=?', cookie);
                    //如果没有长记录 就添加一条长记录
                    if (row.longv == 0) {
                        yield mysql_1.Mysql.getDBInstance().insert('@pf_session_long', {
                            sid: cookie,
                            value: text,
                            expire: this._data.expire
                        });
                    }
                    else {
                        yield mysql_1.Mysql.getDBInstance().update('@pf_session_long', {
                            value: text,
                            expire: this._data.expire
                        }, 'sid=?', cookie);
                    }
                }
                return;
            }
            if (text.length <= 250) {
                yield mysql_1.Mysql.getDBInstance().insert('@pf_session', {
                    sid: cookie,
                    value: text,
                    longv: 0,
                    expire: this._data.expire
                });
            }
            else {
                yield mysql_1.Mysql.getDBInstance().insert('@pf_session', {
                    sid: cookie,
                    value: '',
                    longv: 1,
                    expire: this._data.expire
                });
                yield mysql_1.Mysql.getDBInstance().insert('@pf_session_long', {
                    sid: cookie,
                    value: text,
                    expire: this._data.expire
                });
            }
            return;
        });
    }
    static gc() {
        let time = Math.round(Date.now() / 1000);
        if (MysqlSession.nextCheckTime > time) {
            return;
        }
        MysqlSession.nextCheckTime = time + MysqlSession.checkTime;
        Promise.all([
            mysql_1.Mysql.getDBInstance().delete('@pf_session', 'expire<=?', time),
            mysql_1.Mysql.getDBInstance().delete('@pf_session_long', 'expire<=?', time)
        ]).catch(function (e) {
        });
    }
}
MysqlSession.timeout = null;
MysqlSession.checkTime = 300;
MysqlSession.nextCheckTime = 0;
MysqlSession.init = false;
MysqlSession.store = {};
exports.MysqlSession = MysqlSession;
//# sourceMappingURL=mysql.js.map