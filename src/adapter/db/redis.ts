import  redis = require("redis");
declare var Beacon: any;
export class Redis {

    public client = null;
    public static instance: Redis = null;
    public connected = false;
    private _options = null;

    public static getRedisInstance(): Redis {
        if (Redis.instance == null) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    public constructor(options = null) {
        this._options = options;
    }

    public async getClient() {
        if (this.client) {
            return this.client;
        }
        if (this._options == null) {
            this._options = Beacon.getConfig('redis:*');
        }
        let option = Object.assign({connect_timeout: 5}, this._options);
        option.connect_timeout = option.connect_timeout * 1000;
        let that = this;
        return this.client = await new Promise(function (resolve, reject) {
            let client = redis.createClient(option);
            if (option.password !== void 0) {
                client.auth(option.password, function (err) {
                    if (err) {
                        return reject(err);
                    }
                });
            }
            client.on('connect', function () {
                that.connected = true;
                resolve(client);
            });
            client.on('error', function (err) {
                that.connected = false;
                that.client = null;
                reject(err);
            });
            client.on('end', function (err) {
                //console.log('redis release....');
                that.connected = false;
                that.client = null;
                reject(err);
            });
        });
    }

    public async get(key: string) {
        let client = await this.getClient();
        return await new Promise(function (resolve, reject) {
            client.get(key, function (err, reply) {
                if (err) {
                    return reject(err);
                }
                resolve(JSON.parse(reply));
            });
        });
    }

    public async set(key: string, value: any, timeout?: number) {
        let client = await this.getClient();
        let setP = [new Promise(function (resolve, reject) {
            client.set(key, JSON.stringify(value), function (err, reply) {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        })];
        if (timeout !== void 0) {
            setP.push(new Promise(function (resolve, reject) {
                client.expire(key, timeout, function (err, reply) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(reply);
                });
            }));
        }
        return await Promise.all(setP);
    }

    public async delete(key: string) {
        let client = await this.getClient();
        return await new Promise(function (resolve, reject) {
            client.del(key, function (err, reply) {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    public async expire(key: string, timeout: number) {
        let client = await this.getClient();
        return await new Promise(function (resolve, reject) {
            client.expire(key, timeout, function (err, reply) {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    public async ttl(key: string) {
        let client = await this.getClient();
        return await new Promise(function (resolve, reject) {
            client.ttl(key, function (err, reply) {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    public async wrap(command, name, ...data) {
        let client = await this.getClient();
        return await new Promise(function (resolve, reject) {
            client.wrap(command, name, ...data, function (err, reply) {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    public async quit() {
        if (this.client) {
            this.client.quit();
            this.client = null;
        }
    }

    public async end(flush) {
        if (this.client) {
            this.client.end(flush);
            this.client = null;
        }
    }
}