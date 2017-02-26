import  mysql=require("mysql2");

declare var Beacon: any;

class SqlBlock {
    public sql: string;
    public args: any;

    constructor(sql: string, args?: any) {
        this.sql = sql;
        this.args = args == void 0 ? {} : args;
    }

}
export class Mysql {

    public static pool = null;
    public static _options = null;
    public conn = null;
    public _inTransaction = 0;
    private _options = null;
    public static instance: Mysql = null;
    public prefix = '';

    private SqlList = [];

    public static getDBInstance(): Mysql {
        if (Mysql.instance != null) {
            return Mysql.instance;
        }
        return Mysql.instance = new Mysql();
    }

    public static createPool() {
        Mysql.pool = mysql.createPool(Mysql._options);
    }

    public constructor(options = null) {
        this._options = options;
        if (this._options == null && Mysql._options == null) {
            let options = Beacon.getConfig('mysql:*');
            Mysql._options = options;
        }
        if (options != null) {
            this.prefix = options.prefix || '';
        } else {
            this.prefix = Mysql._options.prefix || '';
        }
    }

    public async getConnection() {
        if (this.conn && this.conn.stream && !this.conn.stream.destroyed) {
            return this.conn;
        }
        if (this._options != null) {
            return this.conn = await new Promise(function (resolve, reject) {
                mysql.createConnection(this._options, function (err, connection) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(connection);
                })
            });
        }
        let that = this;
        if (Mysql.pool == null) {
            Mysql.createPool();
        }
        let deferred = Beacon.defer();
        Mysql.pool.getConnection(function (err, connection) {
            if (err) {
                return deferred.reject(err);
            }
            if (connection._onerror) {
                connection.removeListener('error', connection._onerror);
            }
            connection._onerror = function (err) {
                that.release();
                console.log(err.code); // 'ER_BAD_DB_ERROR'
            };
            connection.once('error', connection._onerror);
            return deferred.resolve(connection);
        });
        return this.conn = await deferred.promise;
    }

    public async query(sql: any, args?: any): Promise<any> {
        if (this._inTransaction > 0 && this.conn == null) {
            throw new Error('mysql is disconnect');
        }
        if (typeof args === 'number' || (typeof args == 'string' && args.length == 0) || (typeof args == 'boolean' && args === false)) {
            args = [args];
        }
        let conn = await this.getConnection();
        return await new Promise(function (resolve, reject) {
                if (args === void 0 || args === null) {
                    conn.query(sql, function (err, result) {
                        if (err) {
                            if (Beacon.debug) {
                                err.sql = mysql.format(sql, args);
                            }
                            return reject(err);
                        }
                        return resolve(result);
                    });
                } else {
                    conn.query(sql, args, function (err, result) {
                        if (err) {
                            if (Beacon.debug) {
                                err.sql = mysql.format(sql, args);
                            }
                            return reject(err);
                        }
                        return resolve(result);
                    });
                }
            }
        );
    }

    public async release() {
        if (this.conn) {
            Mysql.pool.releaseConnection(this.conn);
            this.conn.release();
            this.conn = null;
        }
    }

    public async beginTransaction() {
        let conn = await this.getConnection();
        this._inTransaction++;
        if (this._inTransaction > 1) {
            return false;
        }
        return await new Promise(function (resolve, reject) {
            conn.beginTransaction(function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    public async commit() {
        if (this.conn == null) {
            throw new Error('mysql is disconnect');
        }
        this._inTransaction--;
        if (this._inTransaction > 0) {
            return false;
        }
        let conn = this.conn;
        return await new Promise(function (resolve, reject) {
            conn.commit(function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    public async rollback() {
        if (this.conn == null) {
            throw new Error('mysql is disconnect');
        }
        this._inTransaction--;
        if (this._inTransaction > 0) {
            return false;
        }
        let conn = this.conn;
        return await new Promise(function (resolve, reject) {
            conn.rollback(function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    public async getRow(sql: string, args?: any) {
        if (this.prefix) {
            sql = sql.replace(/@pf_/g, this.prefix);
        }
        let rows = await this.query(sql, args);
        if (!rows || !rows[0]) {
            return null;
        }
        return rows[0];
    }

    public async getList(sql: string, args?: any): Promise<any> {
        if (this.prefix) {
            sql = sql.replace(/@pf_/g, this.prefix);
        }
        return await this.query(sql, args);
    }

    public async getOne(sql: string, args?: any, name?: string) {
        if (this.prefix) {
            sql = sql.replace(/@pf_/g, this.prefix);
        }
        let row = await this.getRow(sql, args);
        if (!row) {
            return null;
        }
        if (name === void 0) {
            let key = Object.keys(row)[0];
            return row[key] === void 0 ? null : row[key];
        }
        return row[name] === void 0 ? null : row[name];
    }

    public sqlBlock(sql: string, args: any) {
        if (this.prefix) {
            sql = sql.replace(/@pf_/g, this.prefix);
        }
        return new SqlBlock(sql, args);
    }

    public async insert(tbname: string, values: any) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        if (!Beacon.isObject(values)) {
            return null;
        }
        let names = [];
        let vals = [];

        for (let key in values) {
            let item = values[key];
            names.push(key);
            if (Beacon.isObject(item) && item instanceof SqlBlock) {
                vals.push(mysql.format(item.sql, item.args));
            }
            else if (Beacon.isDate(item)) {
                vals.push(mysql.escape(Beacon.datetime(item, 'yyyy-MM-dd HH:mm:ss')));
            }
            else if (Beacon.isBoolean(item)) {
                vals.push(item ? 1 : 0);
            }
            else if (Beacon.isNumber(item)) {
                vals.push(item);
            }
            else if (item === null) {
                vals.push('NULL');
            }
            else if (Beacon.isArray(item) || Beacon.isObject(item)) {
                vals.push(mysql.escape(JSON.stringify(item)));
            }
            else {
                item = String(item);
                vals.push(mysql.escape(item));
            }
        }
        if (names.length == 0 || vals.length == 0) {
            return null;
        }
        let excsql = `INSERT INTO ${tbname} `;
        excsql += '(`' + names.join('`,`') + '`)';
        excsql += ' VALUES (' + vals.join(',') + ');';
        return await this.query(excsql);
    }

    public async replace(tbname: string, values: any) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        if (!Beacon.isObject(values)) {
            return null;
        }
        let names = [];
        let vals = [];
        for (let key in values) {
            let item = values[key];
            names.push(key);
            if (Beacon.isObject(item) && item instanceof SqlBlock) {
                vals.push(mysql.format(item.sql, item.args));
            }
            else if (Beacon.isDate(item)) {
                vals.push(mysql.escape(Beacon.datetime(item, 'yyyy-MM-dd HH:mm:ss')));
            }
            else if (Beacon.isBoolean(item)) {
                vals.push(item ? 1 : 0);
            }
            else if (Beacon.isNumber(item)) {
                vals.push(item);
            }
            else if (item === null) {
                vals.push('NULL');
            }
            else if (Beacon.isArray(item) || Beacon.isObject(item)) {
                vals.push(mysql.escape(JSON.stringify(item)));
            }
            else {
                item = String(item);
                vals.push(mysql.escape(item));
            }
        }
        if (names.length == 0 || vals.length == 0) {
            return null;
        }
        let excsql = `REPLACE  INTO ${tbname} `;
        excsql += '(`' + names.join('`,`') + '`)';
        excsql += ' VALUES (' + vals.join(',') + ');';
        return await this.query(excsql);
    }

    public async update(tbname: string, values: any, where?: any, args?: any) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        if (!Beacon.isObject(values)) {
            return null;
        }
        let sets = [];
        for (let key in values) {
            let item = values[key];
            if (Beacon.isObject(item) && item instanceof SqlBlock) {
                sets.push('`' + key + '`=' + mysql.format(item.sql, item.args));
            }
            else if (Beacon.isDate(item)) {
                sets.push('`' + key + '`=' + mysql.escape(Beacon.datetime(item, 'yyyy-MM-dd HH:mm:ss')));
            }
            else if (Beacon.isBoolean(item)) {
                sets.push('`' + key + '`=' + (item ? 1 : 0));
            }
            else if (Beacon.isNumber(item)) {
                sets.push('`' + key + '`=' + item);
            }
            else if (item === null) {
                sets.push('`' + key + '`=' + 'NULL');
            }
            else if (Beacon.isArray(item) || Beacon.isObject(item)) {
                sets.push('`' + key + '`=' + mysql.escape(JSON.stringify(item)));
            }
            else {
                item = String(item);
                sets.push('`' + key + '`=' + mysql.escape(item));
            }
        }
        if (sets.length == 0) {
            return null;
        }
        let excsql = `UPDATE ${tbname} SET `;
        excsql += sets.join(',');
        if (typeof where == 'number' && /^\d+$/.test(String(where)) && args == void 0) {
            args = where;
            where = 'id=?';
        }
        if (!where) {
            excsql += ' WHERE true';
        } else {
            excsql += ' WHERE ' + mysql.format(where, args);
        }
        return await this.query(excsql);
    }

    public async delete(tbname: string, where?: any, args?: any) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        let excsql = `DELETE  FROM ${tbname}`;
        if (typeof where == 'number' && /^\d+$/.test(String(where)) && args == void 0) {
            args = where;
            where = 'id=?';
        }
        if (!where) {
            excsql += ' WHERE true';
        } else {
            excsql += ' WHERE ' + mysql.format(where, args);
        }
        return await this.query(excsql);
    }

    public async getFields(tbname: string): Promise<any> {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        return await this.query(`desc ${tbname};`);
    }

    public async existsField(tbname: string, name: string) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        let row = await this.getRow(`describe ${tbname} \`${name}\`;`);
        return row !== null;
    }

    public async addField(tbname: string, name: string, options: any = {}) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        options = Object.assign({
            type: 'VARCHAR',
            len: 250,
            scale: 0,
            def: null,
            comment: ''
        }, options);
        let {type, len, scale, def, comment}=options;
        type = String(type).toUpperCase();
        let excSql = `ALTER TABLE ${tbname} ADD \`${name}\` `;
        switch (type) {
            case 'VARCHAR':
            case 'INT':
            case 'BIGINT':
            case 'SMALLINT':
            case 'INTEGER':
            case 'TINYINT':
                excSql += type + '(' + len + ')';
                break;
            case 'DECIMAL':
            case 'DOUBLE':
            case 'FLOAT':
                excSql += type + '(' + len + ',' + scale + ')';
                break;
            default:
                excSql += type;
                break;
        }
        excSql += ' DEFAULT ' + mysql.escape(def);
        if (comment) {
            excSql += ' COMMENT ' + mysql.escape(comment);
        }
        excSql += ';';
        return await this.query(excSql);
    }

    public async modifyField(tbname: string, name: string, options: any = {}) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        if (!await this.existsField(tbname, name)) {
            return await this.addField(tbname, name, options);
        }
        options = Object.assign({
            type: 'VARCHAR',
            len: 250,
            scale: 0,
            def: null,
            comment: ''
        }, options);
        let {type, len, scale, def, comment}=options;
        type = String(type).toUpperCase();
        let excSql = `ALTER TABLE ${tbname} MODIFY \`${name}\` `;
        switch (type) {
            case 'VARCHAR':
            case 'INT':
            case 'BIGINT':
            case 'SMALLINT':
            case 'INTEGER':
            case 'TINYINT':
                excSql += type + '(' + len + ')';
                break;
            case 'DECIMAL':
            case 'DOUBLE':
            case 'FLOAT':
                excSql += type + '(' + len + ',' + scale + ')';
                break;
            default:
                excSql += type;
                break;
        }
        excSql += ' DEFAULT ' + mysql.escape(def);
        if (comment) {
            excSql += ' COMMENT ' + mysql.escape(comment);
        }
        excSql += ';';
        return await this.query(excSql);
    }

    public async updateField(tbname: string, oldname: string, newname: string, options: any = {}) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        //一样的
        if (oldname == newname) {
            return await this.modifyField(tbname, newname, options);
        }
        let chkOld = await this.existsField(tbname, oldname);
        let chkNew = await this.existsField(tbname, newname);
        if (!chkOld && !chkNew) {
            return await this.addField(tbname, newname, options);
        }
        if (chkNew) {
            return await this.modifyField(tbname, newname, options);
        }
        options = Object.assign({
            type: 'VARCHAR',
            len: 250,
            scale: 0,
            def: null,
            comment: ''
        }, options);
        let {type, len, scale, def, comment}=options;
        type = String(type).toUpperCase();
        let excSql = `ALTER TABLE ${tbname} CHANGE \`${oldname}\` \`${newname}\` `;
        switch (type) {
            case 'VARCHAR':
            case 'INT':
            case 'BIGINT':
            case 'SMALLINT':
            case 'INTEGER':
            case 'TINYINT':
                excSql += type + '(' + len + ')';
                break;
            case 'DECIMAL':
            case 'DOUBLE':
            case 'FLOAT':
                excSql += type + '(' + len + ',' + scale + ')';
                break;
            default:
                excSql += type;
                break;
        }
        excSql += ' DEFAULT ' + mysql.escape(def);
        if (comment) {
            excSql += ' COMMENT ' + mysql.escape(comment);
        }
        excSql += ';';
        return await this.query(excSql);
    }

    public async dropField(tbname: string, name: string) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        if (await this.existsField(tbname, name)) {
            let excSql = `ALTER TABLE ${tbname} DROP \`${name}\` ;`;
            return await this.query(excSql);
        }
        return null;
    }

    public async existsTable(tbname: string) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        let row = await this.getRow('SHOW TABLES LIKE ?;', tbname);
        return row != null;
    }

    public async dropTable(tbname: string) {
        if (this.prefix) {
            tbname = tbname.replace(/@pf_/g, this.prefix);
        }
        let row = await this.getRow('DROP TABLE IF EXISTS ?;', tbname);
        return row != null;
    }

}
