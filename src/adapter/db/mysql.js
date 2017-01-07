"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var mysql = require("mysql2");
var SqlBlock = (function () {
    function SqlBlock(sql, args) {
        this.sql = sql;
        this.args = args == void 0 ? {} : args;
    }
    return SqlBlock;
}());
var Mysql = (function () {
    function Mysql(options) {
        if (options === void 0) { options = null; }
        this.conn = null;
        this._inTransaction = 0;
        this._options = null;
        this.SqlList = [];
        this._options = options;
    }
    Mysql.getDBInstance = function () {
        if (Mysql.instance != null) {
            return Mysql.instance;
        }
        return Mysql.instance = new Mysql();
    };
    Mysql.createPool = function () {
        var options = Beacon.getConfig('mysql:*');
        Mysql.pool = mysql.createPool(options);
    };
    Mysql.prototype.getConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, that, deferred, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.conn) {
                            return [2 /*return*/, this.conn];
                        }
                        if (!(this._options != null)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                mysql.createConnection(this._options, function (err, connection) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    return resolve(connection);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.conn = _c.sent()];
                    case 2:
                        that = this;
                        if (Mysql.pool == null) {
                            Mysql.createPool();
                        }
                        deferred = Beacon.defer();
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
                        _b = this;
                        return [4 /*yield*/, deferred.promise];
                    case 3: return [2 /*return*/, _b.conn = _c.sent()];
                }
            });
        });
    };
    Mysql.prototype.query = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._inTransaction > 0 && this.conn == null) {
                            throw new Error('mysql is disconnect');
                        }
                        return [4 /*yield*/, this.getConnection()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
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
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.release = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.conn) {
                    Mysql.pool.releaseConnection(this.conn);
                    this.conn.release();
                    this.conn = null;
                }
                return [2 /*return*/];
            });
        });
    };
    Mysql.prototype.beginTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        conn = _a.sent();
                        this._inTransaction++;
                        if (this._inTransaction > 1) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                conn.beginTransaction(function (err) {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(true);
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.conn == null) {
                            throw new Error('mysql is disconnect');
                        }
                        this._inTransaction--;
                        if (this._inTransaction > 0) {
                            return [2 /*return*/, false];
                        }
                        conn = this.conn;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                conn.commit(function (err) {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(true);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.rollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.conn == null) {
                            throw new Error('mysql is disconnect');
                        }
                        this._inTransaction--;
                        if (this._inTransaction > 0) {
                            return [2 /*return*/, false];
                        }
                        conn = this.conn;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                conn.rollback(function (err) {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(true);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.getRow = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, args)];
                    case 1:
                        rows = _a.sent();
                        if (!rows || !rows[0]) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    };
    Mysql.prototype.getList = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.getOne = function (sql, args, name) {
        return __awaiter(this, void 0, void 0, function () {
            var row, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRow(sql, args)];
                    case 1:
                        row = _a.sent();
                        if (!row) {
                            return [2 /*return*/, null];
                        }
                        if (name === void 0) {
                            key = Object.keys(row)[0];
                            return [2 /*return*/, row[key] === void 0 ? null : row[key]];
                        }
                        return [2 /*return*/, row[name] === void 0 ? null : row[name]];
                }
            });
        });
    };
    Mysql.prototype.sqlBlock = function (sql, args) {
        return new SqlBlock(sql, args);
    };
    Mysql.prototype.insert = function (tbname, values) {
        return __awaiter(this, void 0, void 0, function () {
            var names, vals, key, item, excsql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Beacon.isObject(values)) {
                            return [2 /*return*/, null];
                        }
                        names = [];
                        vals = [];
                        for (key in values) {
                            item = values[key];
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
                            return [2 /*return*/, null];
                        }
                        excsql = "INSERT INTO " + tbname + " ";
                        excsql += '(`' + names.join('`,`') + '`)';
                        excsql += 'VALUES (' + vals.join(',') + ');';
                        return [4 /*yield*/, this.query(excsql)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.replace = function (tbname, values) {
        return __awaiter(this, void 0, void 0, function () {
            var names, vals, key, item, excsql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Beacon.isObject(values)) {
                            return [2 /*return*/, null];
                        }
                        names = [];
                        vals = [];
                        for (key in values) {
                            item = values[key];
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
                            return [2 /*return*/, null];
                        }
                        excsql = "REPLACE  INTO " + tbname + " ";
                        excsql += '(`' + names.join('`,`') + '`)';
                        excsql += 'VALUES (' + vals.join(',') + ');';
                        return [4 /*yield*/, this.query(excsql)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.update = function (tbname, values, where, args) {
        return __awaiter(this, void 0, void 0, function () {
            var sets, key, item, excsql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Beacon.isObject(values)) {
                            return [2 /*return*/, null];
                        }
                        sets = [];
                        for (key in values) {
                            item = values[key];
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
                            return [2 /*return*/, null];
                        }
                        excsql = "UPDATE " + tbname + " SET ";
                        excsql += sets.join(',');
                        if (!where) {
                            excsql += ' WHERE 1=1';
                        }
                        else {
                            excsql += ' WHERE ' + mysql.format(where, args);
                        }
                        return [4 /*yield*/, this.query(excsql)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.delete = function (tbname, where, args) {
        return __awaiter(this, void 0, void 0, function () {
            var excsql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        excsql = "DELETE  FROM " + tbname;
                        if (!where) {
                            excsql += ' WHERE 1=1';
                        }
                        else {
                            excsql += ' WHERE ' + mysql.format(where, args);
                        }
                        return [4 /*yield*/, this.query(excsql)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.getFields = function (tbname) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("desc " + tbname + ";")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.existsField = function (tbname, name) {
        return __awaiter(this, void 0, void 0, function () {
            var row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRow("describe " + tbname + " `" + name + "`;")];
                    case 1:
                        row = _a.sent();
                        return [2 /*return*/, row !== null];
                }
            });
        });
    };
    Mysql.prototype.addField = function (tbname, name, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var type, len, scale, def, comment, excSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = Object.assign({
                            type: 'VARCHAR',
                            len: 250,
                            scale: 0,
                            def: null,
                            comment: ''
                        }, options);
                        type = options.type, len = options.len, scale = options.scale, def = options.def, comment = options.comment;
                        type = String(type).toUpperCase();
                        excSql = "ALTER TABLE " + tbname + " ADD `" + name + "` ";
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
                        return [4 /*yield*/, this.query(excSql)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.modifyField = function (tbname, name, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var type, len, scale, def, comment, excSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.existsField(tbname, name)];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addField(tbname, name, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        options = Object.assign({
                            type: 'VARCHAR',
                            len: 250,
                            scale: 0,
                            def: null,
                            comment: ''
                        }, options);
                        type = options.type, len = options.len, scale = options.scale, def = options.def, comment = options.comment;
                        type = String(type).toUpperCase();
                        excSql = "ALTER TABLE " + tbname + " MODIFY `" + name + "` ";
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
                        return [4 /*yield*/, this.query(excSql)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.updateField = function (tbname, oldname, newname, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var chkOld, chkNew, type, len, scale, def, comment, excSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(oldname == newname)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.modifyField(tbname, newname, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.existsField(tbname, oldname)];
                    case 3:
                        chkOld = _a.sent();
                        return [4 /*yield*/, this.existsField(tbname, newname)];
                    case 4:
                        chkNew = _a.sent();
                        if (!(!chkOld && !chkNew)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.addField(tbname, newname, options)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6:
                        if (!chkNew) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.modifyField(tbname, newname, options)];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8:
                        options = Object.assign({
                            type: 'VARCHAR',
                            len: 250,
                            scale: 0,
                            def: null,
                            comment: ''
                        }, options);
                        type = options.type, len = options.len, scale = options.scale, def = options.def, comment = options.comment;
                        type = String(type).toUpperCase();
                        excSql = "ALTER TABLE " + tbname + " CHANGE `" + oldname + "` `" + newname + "` ";
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
                        return [4 /*yield*/, this.query(excSql)];
                    case 9: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Mysql.prototype.dropField = function (tbname, name) {
        return __awaiter(this, void 0, void 0, function () {
            var excSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.existsField(tbname, name)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        excSql = "ALTER TABLE " + tbname + " DROP `" + name + "` ;";
                        return [4 /*yield*/, this.query(excSql)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    Mysql.prototype.existsTable = function (tbname) {
        return __awaiter(this, void 0, void 0, function () {
            var row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRow('SHOW TABLES LIKE ?;', tbname)];
                    case 1:
                        row = _a.sent();
                        return [2 /*return*/, row != null];
                }
            });
        });
    };
    Mysql.prototype.dropTable = function (tbname) {
        return __awaiter(this, void 0, void 0, function () {
            var row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRow('DROP TABLE IF EXISTS ?;', tbname)];
                    case 1:
                        row = _a.sent();
                        return [2 /*return*/, row != null];
                }
            });
        });
    };
    return Mysql;
}());
Mysql.pool = null;
Mysql.instance = null;
exports.Mysql = Mysql;
//# sourceMappingURL=mysql.js.map