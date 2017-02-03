"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mysql = require("mysql2");
class SqlBlock {
    constructor(sql, args) {
        this.sql = sql;
        this.args = args == void 0 ? {} : args;
    }
}
class Mysql {
    constructor(options = null) {
        this.conn = null;
        this._inTransaction = 0;
        this._options = null;
        this.prefix = '';
        this.SqlList = [];
        this._options = options;
        if (this._options == null && Mysql._options == null) {
            let options = Beacon.getConfig('mysql:*');
            Mysql._options = options;
        }
        if (options != null) {
            this.prefix = options.prefix || '';
        }
        else {
            this.prefix = Mysql._options.prefix || '';
        }
    }
    static getDBInstance() {
        if (Mysql.instance != null) {
            return Mysql.instance;
        }
        return Mysql.instance = new Mysql();
    }
    static createPool() {
        Mysql.pool = mysql.createPool(Mysql._options);
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.conn && this.conn.stream && !this.conn.stream.destroyed) {
                return this.conn;
            }
            if (this._options != null) {
                return this.conn = yield new Promise(function (resolve, reject) {
                    mysql.createConnection(this._options, function (err, connection) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(connection);
                    });
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
            return this.conn = yield deferred.promise;
        });
    }
    query(sql, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._inTransaction > 0 && this.conn == null) {
                throw new Error('mysql is disconnect');
            }
            let conn = yield this.getConnection();
            return yield new Promise(function (resolve, reject) {
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
                }
                else {
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
            });
        });
    }
    release() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.conn) {
                Mysql.pool.releaseConnection(this.conn);
                this.conn.release();
                this.conn = null;
            }
        });
    }
    beginTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            let conn = yield this.getConnection();
            this._inTransaction++;
            if (this._inTransaction > 1) {
                return false;
            }
            return yield new Promise(function (resolve, reject) {
                conn.beginTransaction(function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
            });
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.conn == null) {
                throw new Error('mysql is disconnect');
            }
            this._inTransaction--;
            if (this._inTransaction > 0) {
                return false;
            }
            let conn = this.conn;
            return yield new Promise(function (resolve, reject) {
                conn.commit(function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
            });
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.conn == null) {
                throw new Error('mysql is disconnect');
            }
            this._inTransaction--;
            if (this._inTransaction > 0) {
                return false;
            }
            let conn = this.conn;
            return yield new Promise(function (resolve, reject) {
                conn.rollback(function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
            });
        });
    }
    getRow(sql, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                sql = sql.replace('@pf_', this.prefix);
            }
            let rows = yield this.query(sql, args);
            if (!rows || !rows[0]) {
                return null;
            }
            return rows[0];
        });
    }
    getList(sql, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                sql = sql.replace('@pf_', this.prefix);
            }
            return yield this.query(sql, args);
        });
    }
    getOne(sql, args, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                sql = sql.replace('@pf_', this.prefix);
            }
            let row = yield this.getRow(sql, args);
            if (!row) {
                return null;
            }
            if (name === void 0) {
                let key = Object.keys(row)[0];
                return row[key] === void 0 ? null : row[key];
            }
            return row[name] === void 0 ? null : row[name];
        });
    }
    sqlBlock(sql, args) {
        if (this.prefix) {
            sql = sql.replace('@pf_', this.prefix);
        }
        return new SqlBlock(sql, args);
    }
    insert(tbname, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
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
                else if (Beacon.isBoolean(item)) {
                    vals.push(item ? 1 : 0);
                }
                else if (item === null) {
                    vals.push('NULL');
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
            return yield this.query(excsql);
        });
    }
    replace(tbname, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
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
                else if (Beacon.isBoolean(item)) {
                    vals.push(item ? 1 : 0);
                }
                else if (item === null) {
                    vals.push('NULL');
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
            return yield this.query(excsql);
        });
    }
    update(tbname, values, where, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
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
                else if (Beacon.isBoolean(item)) {
                    sets.push('`' + key + '`=' + (item ? 1 : 0));
                }
                else if (item === null) {
                    sets.push('`' + key + '`=' + 'NULL');
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
            if (typeof where == 'number' && /^\d+$/.test(where) && args == void 0) {
                args = where;
                where = 'id=?';
            }
            if (!where) {
                excsql += ' WHERE true';
            }
            else {
                excsql += ' WHERE ' + mysql.format(where, args);
            }
            return yield this.query(excsql);
        });
    }
    delete(tbname, where, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            let excsql = `DELETE  FROM ${tbname}`;
            if (typeof where == 'number' && /^\d+$/.test(where) && args == void 0) {
                args = where;
                where = 'id=?';
            }
            if (!where) {
                excsql += ' WHERE true';
            }
            else {
                excsql += ' WHERE ' + mysql.format(where, args);
            }
            return yield this.query(excsql);
        });
    }
    getFields(tbname) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            return yield this.query(`desc ${tbname};`);
        });
    }
    existsField(tbname, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            let row = yield this.getRow(`describe ${tbname} \`${name}\`;`);
            return row !== null;
        });
    }
    addField(tbname, name, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            options = Object.assign({
                type: 'VARCHAR',
                len: 250,
                scale: 0,
                def: null,
                comment: ''
            }, options);
            let { type, len, scale, def, comment } = options;
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
            return yield this.query(excSql);
        });
    }
    modifyField(tbname, name, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            if (!(yield this.existsField(tbname, name))) {
                return yield this.addField(tbname, name, options);
            }
            options = Object.assign({
                type: 'VARCHAR',
                len: 250,
                scale: 0,
                def: null,
                comment: ''
            }, options);
            let { type, len, scale, def, comment } = options;
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
            return yield this.query(excSql);
        });
    }
    updateField(tbname, oldname, newname, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            //一样的
            if (oldname == newname) {
                return yield this.modifyField(tbname, newname, options);
            }
            let chkOld = yield this.existsField(tbname, oldname);
            let chkNew = yield this.existsField(tbname, newname);
            if (!chkOld && !chkNew) {
                return yield this.addField(tbname, newname, options);
            }
            if (chkNew) {
                return yield this.modifyField(tbname, newname, options);
            }
            options = Object.assign({
                type: 'VARCHAR',
                len: 250,
                scale: 0,
                def: null,
                comment: ''
            }, options);
            let { type, len, scale, def, comment } = options;
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
            return yield this.query(excSql);
        });
    }
    dropField(tbname, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            if (yield this.existsField(tbname, name)) {
                let excSql = `ALTER TABLE ${tbname} DROP \`${name}\` ;`;
                return yield this.query(excSql);
            }
            return null;
        });
    }
    existsTable(tbname) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            let row = yield this.getRow('SHOW TABLES LIKE ?;', tbname);
            return row != null;
        });
    }
    dropTable(tbname) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.prefix) {
                tbname = tbname.replace('@pf_', this.prefix);
            }
            let row = yield this.getRow('DROP TABLE IF EXISTS ?;', tbname);
            return row != null;
        });
    }
}
Mysql.pool = null;
Mysql._options = null;
Mysql.instance = null;
exports.Mysql = Mysql;
//# sourceMappingURL=mysql.js.map