"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const beacon_1 = require("../../../src/core/beacon");
const images = require("images");
const path = require("path");
const fs = require("fs");
class Upload extends beacon_1.Beacon.Controller {
    fail(message, jump, code) {
        let ret = {};
        ret.message = message;
        ret.status = false;
        if (jump !== void 0) {
            ret.jump = jump;
        }
        if (code !== void 0) {
            ret.code = code;
        }
        this.setContentType('json');
        this.end(JSON.stringify(ret));
        this.exit();
    }
    success(message, info) {
        let ret = {};
        ret.message = message;
        ret.status = true;
        ret.info = info;
        this.setContentType('json');
        this.end(JSON.stringify(ret));
        this.exit();
    }
    createFileName(ext) {
        var date = new Date();
        var str = '';
        str += date.getFullYear();
        var month = date.getMonth() + 1;
        if (month.toString().length < 2) {
            str += '0';
        }
        str += month;
        return '/' + str + '/' + beacon_1.Beacon.uuid(8) + '.' + ext;
    }
    sizeCalculation(img, width, height) {
        let old_width = img.width();
        let old_height = img.height();
        let new_width = width;
        let new_height = height;
        //如果超出宽度
        if (old_width > width) {
            let pt = width / old_width;
            new_height = pt * old_height;
            //在检查高
            if (new_height > height) {
                var pt2 = height / old_height;
                new_height = height;
                new_width = pt2 * old_width;
            }
        }
        else if (old_height > height) {
            var pt = height / old_height;
            new_width = pt * old_width;
            if (new_width > width) {
                let pt2 = width / old_width;
                new_width = width;
                new_height = pt2 * old_height;
            }
        }
        else {
            new_width = old_width;
            new_height = old_height;
        }
        img.size(new_width, new_height);
    }
    //上传
    upload() {
        return __awaiter(this, void 0, void 0, function* () {
            let RootPath = path.join(beacon_1.Beacon.RUNTIME_PATH, 'public/upload');
            let file = this.file('upload');
            if (file == null) {
                this.fail('错误的字段名', 2);
            }
            //判断类型
            let mime = beacon_1.Beacon.getConfig('post:allow_upload_types') || {};
            var ext = path.extname(file.path);
            ext = ext ? ext.slice(1).toLowerCase() : '';
            if (ext === '' || typeof (mime[ext]) === 'undefined') {
                this.fail('不支持的文件类型', 10);
                return;
            }
            let filetype = 'file';
            if (['gif', 'jpg', 'jpeg', 'png'].indexOf(ext) >= 0) {
                filetype = 'image';
            }
            //按类型保存
            let typedirname = this.post('type', '');
            if (typedirname == '' && filetype == 'image') {
                typedirname = 'images';
            }
            if (!/^(albums|images|files)$/.test(typedirname)) {
                typedirname = 'files';
            }
            let sortname = this.createFileName(ext);
            let fullname = path.join(RootPath, typedirname, sortname);
            let uploadDir = path.dirname(fullname);
            //判断文件夹判断是否成功
            try {
                beacon_1.Beacon.mkdir(uploadDir);
            }
            catch (e) {
                this.fail('服务器创建文件夹失败，可能没有权限', 4);
            }
            let host = '//' + this.getHeader('host');
            let info = {
                'host': host,
                'url': '/upload/' + typedirname + sortname,
                'fullurl': host + '/upload/' + typedirname + sortname,
                'size': file.size,
                'localname': file.originalFilename,
            };
            //处理图片
            if (filetype == 'image') {
                this.validimg(file, info, RootPath, typedirname, sortname);
            }
            //判断文件移动是否成功
            try {
                yield new Promise(function (resolve, reject) {
                    fs.rename(file.path, fullname, function (err) {
                        if (err) {
                            let is = fs.createReadStream(file.path);
                            let os = fs.createWriteStream(fullname);
                            is.once('error', function (err) {
                                fs.unlink(file.path);
                                reject(err);
                            });
                            is.once('end', function () {
                                fs.unlink(file.path);
                                resolve(true);
                            });
                            is.pipe(os);
                            return;
                        }
                        resolve(true);
                    });
                });
            }
            catch (e) {
                this.fail('服务器拷贝文件失败', 5);
            }
            return info;
        });
    }
    //验证图片
    validimg(file, info, RootPath, typedirname, sortname) {
        let size_urls = {};
        //是否严格尺寸 0:不约束,1:比例约束,2:大小约束
        let strict_size = this.post('strict_size:n', 0);
        let cat_size = this.post('cat_size', '');
        //图片宽
        let img_width = this.post('img_width:n', 100);
        //图片高
        let img_height = this.post('img_height:n', 100);
        //尺寸控制
        if (strict_size == 1 || strict_size == 2) {
            var imga = images(file.path);
            var old_width = imga.width();
            var old_height = imga.height();
            //超严格模式
            if (strict_size == 2) {
                if (img_width != old_width || img_height != old_height) {
                    this.fail('图片尺寸不符，我们要求的是 ' + img_width + 'x' + img_height + ' 的尺寸，可您本次上传的图片尺寸是：' + old_width + 'x' + old_height + '  ', 7);
                }
            }
            //容差模式
            if (strict_size == 1) {
                if (img_width > old_width || img_height > old_height) {
                    this.fail('图片尺寸不符，我们要求至少是 ' + img_width + 'x' + img_height + ' 以上的尺寸，且保持比例，可您本次上传的图片尺寸是：' + old_width + 'x' + old_height + '', 8);
                }
                if (!((img_width / old_width - 0.01) < (img_height / old_height) && (img_width / old_width + 0.01) > (img_height / old_height))) {
                    this.fail('图片尺寸比例不符，我们要求至少是 ' + img_width + 'x' + img_height + ' 以上的尺寸，且保持比例，可您本次上传的图片尺寸是：' + old_width + 'x' + old_height + '', 9);
                }
            }
        }
        //主动生成缩略图
        if (cat_size != '') {
            var sizes = cat_size.split(',');
            for (var i = 0; i < sizes.length; i++) {
                var tsize = sizes[i];
                if (!/^\d+(x\d+)?$/.test(tsize)) {
                    continue;
                }
                var infos = tsize.match(/^(\d+)(?:x(\d+))?$/i);
                var width = parseInt(infos[1] || 100);
                var height = parseInt(infos[2] || width);
                var sname = sortname.replace(/\.(jpg|jpeg|png|gif)$/i, '_' + tsize + '.$1');
                var outpath = path.join(RootPath, typedirname, sname);
                var img = images(file.path);
                this.sizeCalculation(img, width, height);
                img.save(outpath, { quality: 100 });
                size_urls[tsize] = '/upload/' + typedirname + sname;
                images.gc();
                info.size_urls = size_urls;
            }
        }
    }
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            //处理GET
            if (this.isMethod('GET')) {
                var info = [];
                info.push('<form action="/service/upload" enctype="multipart/form-data" method="post">');
                info.push('图片尺寸：<input type="text" name="cat_size"> 逗号隔开 如 100x100,200,200x300<br>');
                info.push('上传文件：<input type="file" name="upload" multiple="multiple"><br>');
                info.push('<input type="submit" value="Upload"></form>');
                this.end(info.join(''));
                return;
            }
            //处理POST
            if (this.isMethod('POST')) {
                let info = yield this.upload();
                this.success('上传成功', info);
            }
        });
    }
}
exports.Upload = Upload;
//# sourceMappingURL=upload.ctl.js.map