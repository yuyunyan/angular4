import { ICellRendererParams } from "ag-grid";
import { ICellMenuItem } from "./icell-menu-item";

export interface ICellMenuParams extends ICellRendererParams {
    _self: any;
    menuItemsCallback: (params,_self) => ICellMenuItem[];
}