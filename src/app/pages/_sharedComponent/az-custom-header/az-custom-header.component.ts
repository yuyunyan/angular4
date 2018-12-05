import { Component, ViewEncapsulation } from '@angular/core';
import { GridOptions } from "ag-grid";
import { IHeaderAngularComp } from "ag-grid-angular/main";
import { IHeaderParams } from "ag-grid/main";

@Component({
  templateUrl: './az-custom-header.component.html',
  styleUrls: ['./az-custom-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomHeaderComponent implements IHeaderAngularComp{
  public params: MyParams;

  agInit(params: MyParams): void {
    this.params = params;
  }
}  


export interface MyParams extends IHeaderParams {
  menuIcon: string;
}
