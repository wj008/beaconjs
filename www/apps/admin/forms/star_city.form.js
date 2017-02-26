"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const form_1 = require("../../../src/common/form");
class StartCityForm extends form_1.Form {
    load(fields = null) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            this._load = {
                name: {
                    'label': '',
                    'data_val': { r: true },
                    'data_val_msg': { r: '请输入出发地点名称' },
                },
                address: {
                    'data_val': { r: true },
                    'data_val_msg': { r: '请输入聚集详细地址' },
                },
                sort: {
                    'data_val': { r: true, int: true },
                    'data_val_msg': { r: '请输入排序值', int: '排序值必须是数值形式' },
                    'var_type': 'i',
                }
            };
            return yield _super("load").call(this, fields);
        });
    }
}
exports.StartCityForm = StartCityForm;
//# sourceMappingURL=star_city.form.js.map