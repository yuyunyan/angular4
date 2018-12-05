import{Component} from '@angular/core';
import{ICellRendererAngularComp} from 'ag-grid-angular/main';
import{ClickableComponent} from './clickable.component';
@Component({
    selector:"clickable-cell",
    template:`
    <ag-clickable (onClicked)=clicked($event) [cell]="cell"></ag-clickable>
    `
})    
export class ClickableParentComponent implements ICellRendererAngularComp {    
    
    private params: any;
    private cell: any;
    
    refresh(params: any): boolean {
        return true;
      }

    agInit(params: any): void {
        this.params = params;
        this.cell = {value: params.value, col: params.colDef.headerName};
        
    }
    
    afterGuiAttached(params?: any): void {
        throw new Error('Method not implemented.');
    }

    public clicked(cell: any){
        console.log(this.cell.value);
    }
}