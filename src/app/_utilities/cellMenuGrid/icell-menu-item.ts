export interface ICellMenuItem {
    icon: string;
    name: string;
    action: (_self: any, data: any, refresh?: (item: ICellMenuItem) => void) => void;
}
