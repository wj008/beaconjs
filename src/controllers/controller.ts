import path =require( 'path');
import {HttpContext} from '../core/http_context';
declare var beacon: any;
export class Controller {

    public context: HttpContext = null;

    public constructor(context: HttpContext) {
        this.context = context;
    }

    public indexAction() {
        this.end('hello beaconjs.');
    }

    public getIP() {
        return this.context.getIP();
    }

    public getMethod() {
        return this.context.method.toLowerCase();
    }

    public isMethod(method) {
        return this.context.method === method.toUpperCase();
    }

    public isGet() {
        return this.context.isGet();
    }

    public isPost() {
        return this.context.isPost();
    }

    public isAjax() {
        return this.context.isAjax();
    }


    public get(name?: string, def?) {
        return this.context.get(name, def);
    }

    public post(name?: string, def?) {
        return this.context.post(name, def);
    }

    public param(name?: string, def?) {
        return this.context.param(name, def);
    }

    public file(name?: string) {
        return this.context.file(name);
    }

    public getHeader(name?: string) {
        return this.context.getHeader(name);
    }

    public setHeader(name: string, value) {
        return this.context.setHeader(name, value);
    }


    public getUserAgent() {
        return this.context.getUserAgent();
    }

    public getReferrer(host?: string) {
        return this.context.getReferrer(host);
    }

    public setStatus(status: number = 200) {
        return this.context.setStatus(status);
    }

    //获取配置项
    public  getConfig(key, def?) {
        return beacon.getConfig(key, def);
    }

    //获取配置项
    public  route(name, def?) {
        return this.context.route(name, def);
    }

    //获取配置项
    public  setConfig(key, def?) {
        return beacon.getConfig(key, def);
    }

    public getCookie(name?: string) {
        return this.context.getCookie(name);
    }

    public setCookie(name: string, value: string, options?) {
        return this.context.setCookie(name, value, options);
    }

    public redirect(url, code?: number) {
        this.context.redirect(url, code);
    }


    public setExpires(time) {
        this.context.setExpires(time);
        return this;
    }

    public write(obj = null, encoding: string = null) {
        return this.context.write(obj, encoding);
    }

    /**
     * end output
     * @param  {Object} obj      []
     * @param  {String} encoding [content encoding]
     * @return {}          []
     */
    public end(obj = null, encoding = null) {
        this.context.end(obj, encoding);
    }


    public getContentType() {
        return this.context.getContentType();
    }

    public setContentType(ext, encoding) {
        return this.context.setContentType(ext, encoding);
    }


    public sendTime(name) {
        return this.context.sendTime(name);
    }


}
