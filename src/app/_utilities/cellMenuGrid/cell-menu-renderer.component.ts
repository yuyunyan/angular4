import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular/main";
import { CustomCellMenu } from './custom-cell-menu';
import { ICellRendererParams } from 'ag-grid';
import { ICellMenuParams } from './icell-menu-params';

@Component({
    selector: 'az-cell-menu-renderer',
    template: `
        <div class="cell-menu-container">
            <a (click)="openMenu($event)" class="btn btn-xs" type="button">
                <i class="fa fa-ellipsis-v"></i>
            </a>
        </div>`,
    styleUrls: ['./cell-menu-renderer.scss']

})
export class CellMenuRendererComponent implements OnInit, ICellRendererAngularComp, OnDestroy {

    private menu: CustomCellMenu;
    private params: ICellMenuParams;

    constructor() {
        this.menu = new CustomCellMenu();
    }

    ngOnInit() {
    }

    agInit(params: ICellMenuParams): void {
        this.params = params;
    }

    refresh(params: ICellMenuParams): boolean {
        this.params= params;
        return false;
    }

    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39 ||  // left
            key == 38 ||  // up
            key == 40) {  // down
            event.stopPropagation();
        }
    }

    ngOnDestroy(): void {
    }

    openMenu(event: MouseEvent) {
        this.menu.createAndShow(this.params, event);
    }
}
