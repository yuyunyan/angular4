import { Component, OnInit,Input, Renderer,OnChanges,SimpleChanges, ViewEncapsulation} from '@angular/core';
import { GridOptions,ColumnApi } from "ag-grid";
import { RequestToPurchaseService } from './../../../_services/request-to-purchase.service';

@Component({
  selector: 'az-add-to-cart-item',
  templateUrl: './add-to-cart-item.component.html',
  styleUrls: ['./add-to-cart-item.component.scss'],
})

export class AddToCartItemComponent implements OnInit,OnChanges {
  @Input() vendor;
  private sourceLinesGrid: GridOptions;
  private price : number;
  private rowData: any;
  private vendorName : string;
  private totalCost:number;

  constructor(private requestToPurchaseService: RequestToPurchaseService){
    this.createGrid();
    }

    createGrid(){
        let _self = this;
        this.sourceLinesGrid = {  
            suppressContextMenu:true,   
            toolPanelSuppressSideButtons:true,
            columnDefs:  this.createLinesGrid(),
            onGridReady: (e) => {
                _self.sourceLinesGrid.api.sizeColumnsToFit();
            },
        }
    }

    ngOnInit(){
    }

    ngAfterViewInit(){
        this.sourceLinesGrid.api.setRowData(this.rowData);
    }

    ngOnChanges(changes: SimpleChanges){
        const _self = this;
        let vendorChanges = changes['vendor']
        if(vendorChanges.currentValue){
            this.vendor = vendorChanges.currentValue;
            var data = _self.onPartsSelectionChanges(this.vendor);
            if(!this.rowData){
                this.rowData=data;
            }
            else{
                this.sourceLinesGrid.api.setRowData(data);
            }
        }
    }

    createPO(){
        this.requestToPurchaseService.pushSourceSelection(this.vendor);
    }

    onPartsSelectionChanges(sourceList){
        //Declare rowLimit/rowOffset for API
          const _self = this;
          let partsSelections = [];
          sourceList.map(sourceLine => {
            partsSelections.push({
                partNumber : sourceLine.partNumber,
                qty : sourceLine.qty,
                totalCost : sourceLine.qty * sourceLine.cost
            });
            this.vendorName = sourceLine.vendorName;
            this.addTotalCost(partsSelections)
         });
           return partsSelections;
    }
    
    addTotalCost(partsSelections){
        var sum = null;   
        partsSelections.forEach((value)=>{
        sum += value.totalCost;
        this.totalCost = sum;
        });
    }

    createLinesGrid(){
        let columnDefs =  [
          {
            headerName:"Part Number",
            field:"partNumber",
            headerClass:"grid-header",
            width: 160,
          },
          {
            headerName:"Qty",
            field:"qty",
            headerClass:"grid-header",
            width: 65,
          },
          {
            headerName:"Total Cost",
            field:"totalCost",
            headerClass:"grid-header",
            width: 65,
          },
        ];
        return columnDefs;
    }
}