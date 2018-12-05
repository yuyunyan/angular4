import { CellMenuRendererComponent } from "./cell-menu-renderer.component";
import { ICellMenuItem } from "./icell-menu-item";
import { ICellMenuParams } from "./icell-menu-params";

export const cellMenuColDefinition = (menuItemsCallback: (params: ICellMenuParams, _self: any) => ICellMenuItem[], _self: any) => {
    return {
        headerName: "Options",
        field: "options",
        headerClass: "grid-header",
        minWidth: 50,
        width:50,
        cellRendererFramework: CellMenuRendererComponent,
        cellRendererParams: {
            menuItemsCallback: menuItemsCallback,
            _self: _self
        },
        suppressSorting: true,
        suppressFilter: true,
        suppressMovable: true,
        lockPinned: true,
        pinned: "right",
        editable: false,
        cellStyle: { 'overflow': 'visible' },
    }
}