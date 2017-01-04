/**
 * Created by Administrator on 2017/1/5.
 */
export interface SessionBase {
    init(cookie: string);
    get(name?: string);
    set(name: string, value: any, timeout?: number);
    delete(name?: string);
    save();
}