import {Beacon} from "../../../src/core/beacon";
import {Redis} from "../../../src/adapter/db/redis";
import crypto=require('crypto');

export class Index extends Beacon.Controller {

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