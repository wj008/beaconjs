/**
 * Created by Administrator on 2017/1/4.
 */
declare var Beacon: any;
import {SessionBase} from "../../core/session_base";
import {Mysql} from "../db/mysql";
import path=require('path');
import os=require('os');
import fs=require('fs');


export class MysqlSession implements SessionBase {

    public static timeout = null;
    public static init = false;
    public static store = {};
    private _data = null;
    private _isInit = false;
    private _cookie = null;
    private _isUpdate = false;

    public constructor() {
        if (MysqlSession.timeout != null) {
            return;
        }
        let options = Beacon.getConfig('session:*');
        MysqlSession.timeout = options.timeout || 3600;
    }

    public async init(cookie: string) {
        if (!cookie || typeof cookie !== 'string') {
            return;
        }
        this._cookie = cookie;
        this._isUpdate = false;
        if (!MysqlSession.init) {
            let isInit = await Mysql.getDBInstance().existsTable('@pf_session');
            let pf = Mysql.getDBInstance().prefix;
            if (!isInit) {
                await Mysql.getDBInstance().query(`CREATE TABLE \`${pf}session\` (
                \`sid\` varchar(50) NOT NULL,
                \`value\` varchar(255) DEFAULT NULL,
                \`expire\` int(11) DEFAULT NULL,
                \`longv\` tinyint(1) DEFAULT NULL,
                PRIMARY KEY (\`sid\`)
                ) ENGINE=MEMORY DEFAULT CHARSET=utf8 MAX_ROWS=100000000;`);
            }
            let isInitLong = await Mysql.getDBInstance().existsTable('@pf_session_long');
            if (!isInitLong) {
                await Mysql.getDBInstance().query(`CREATE TABLE \`${pf}session_long\` (
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
        let row = await Mysql.getDBInstance().getRow('select value,`longv`,expire from @pf_session where sid=? and expire>?', [cookie, time]);
        if (row == null) {
            this._data = {data: {}, expire: 0};
            this._isInit = true;
            return;
        } else {
            if (row.longv == 1) {
                row = await Mysql.getDBInstance().getRow('select value,expire from @pf_session_long where sid=? and expire>?', [cookie, time]);
                if (row == null) {
                    this._data = {data: {}, expire: 0};
                    this._isInit = true;
                    return;
                }
            }
            text = row.value;
        }
        if (text == '') {
            this._data = {data: {}, expire: 0};
            this._isInit = true;
            return;
        }
        try {
            let json = JSON.parse(String(text));
            if (json == null) {
                this._data = {data: {}, expire: 0};
                this._isInit = true;
                return;
            }
            this._data = {data: json, expire: row.expire};
            this._isInit = true;
            return;
        } catch (e) {
            this._data = {data: {}, expire: 0};
            this._isInit = true;
            return;
        }
    }

    public get(name?: string) {
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

    public set(name: string, value: any) {
        if (!this._isInit) {
            return;
        }
        this._data = this._data || {data: {}, expire: Math.round(Date.now() / 1000) + MysqlSession.timeout};
        if (this._isUpdate === false) {
            let oldval = this._data.data[name] === void 0 ? null : this._data.data[name];
            let oldtext = JSON.stringify(oldval);
            let newtext = JSON.stringify(value);
            if (oldtext.length !== newtext.length) {
                this._isUpdate = true;
            } else if (oldtext != newtext) {
                this._isUpdate = true;
            }
        }
        this._data.data[name] = value;
    }

    public delete(name?: string) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }

    public async flush() {
        console.log(this._data, this._cookie);
        let cookie = this._cookie;
        let row = await Mysql.getDBInstance().getRow('select `longv` from @pf_session where sid=?', cookie);
        //如果为空删除
        if (this._data == null) {
            if (row == null) {
                return;
            }
            if (row.longv == 1) {
                await Mysql.getDBInstance().delete('@pf_session_long', 'sid=?', cookie);
            }
            await Mysql.getDBInstance().delete('@pf_session', 'sid=?', cookie);
            return;
        }
        //如果没有更改仅修改时间即可
        if (!this._isUpdate) {
            this._data.expire = Math.round(Date.now() / 1000) + MysqlSession.timeout;
            if (row != null) {
                await Mysql.getDBInstance().update('@pf_session', {expire: this._data.expire}, 'sid=?', cookie);
                if (row.longv == 1) {
                    await Mysql.getDBInstance().update('@pf_session_long', {expire: this._data.expire}, 'sid=?', cookie);
                }
            }
            return;
        }
        let text = JSON.stringify(this._data.data || {});
        if (row != null) {
            //长度小于250
            if (text.length <= 250) {
                await Mysql.getDBInstance().update('@pf_session', {
                    value: text,
                    longv: 0,
                    expire: this._data.expire
                }, 'sid=?', cookie);
                if (row.longv == 1) {
                    await Mysql.getDBInstance().delete('@pf_session_long', 'sid=?', cookie);
                }
            } else {
                await Mysql.getDBInstance().update('@pf_session', {
                    value: '',
                    longv: 1,
                    expire: this._data.expire
                }, 'sid=?', cookie);
                //如果没有长记录 就添加一条长记录
                if (row.longv == 0) {
                    await Mysql.getDBInstance().insert('@pf_session_long', {
                        sid: cookie,
                        value: text,
                        expire: this._data.expire
                    });
                } else {
                    await Mysql.getDBInstance().update('@pf_session_long', {
                        value: text,
                        expire: this._data.expire
                    }, 'sid=?', cookie);
                }
            }
            return;
        }

        if (text.length <= 250) {
            await Mysql.getDBInstance().insert('@pf_session', {
                sid: cookie,
                value: text,
                longv: 0,
                expire: this._data.expire
            });
        } else {
            await Mysql.getDBInstance().insert('@pf_session', {
                sid: cookie,
                value: '',
                longv: 1,
                expire: this._data.expire
            });
            await Mysql.getDBInstance().insert('@pf_session_long', {
                sid: cookie,
                value: text,
                expire: this._data.expire
            });
        }
        return;
    }

    public static gc() {
        let time = Math.round(Date.now() / 1000);
        Promise.all([
            Mysql.getDBInstance().delete('@pf_session', 'expire<=?', time),
            Mysql.getDBInstance().delete('@pf_session_long', 'expire<=?', time)
        ]).catch(function (e) {

        })
    }
}

