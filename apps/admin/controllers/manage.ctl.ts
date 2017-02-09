import {AdminController} from "./admin.ctl";
export class Manage extends AdminController {

    public async indexAction() {

        this.display('manage.form');
    }


}