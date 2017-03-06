import {Redis} from "../../../src/adapter/db/redis";
import {Controller} from "../../../src/common/controller";
import crypto=require('crypto');

export class Index extends Controller {

    public redis: Redis;

    public async init() {
        await this.initSesion();
        await this.initDB('mysql');
    }


    public async indexAction() {

    }

    public async loginAction() {

    }

}