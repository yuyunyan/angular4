import { Component, OnInit,Input, AfterViewInit} from '@angular/core';
import { GridOptions, IDatasource  } from "ag-grid";
import { ItemsService } from '../../../_services/items.service';

@Component({
  selector: 'az-items-technical-details',
  templateUrl: './items-technical-details.component.html',
  styleUrls: ['./items-technical-details.component.scss'],
})

export class ItemTechnicalDetailsComponent implements OnInit,AfterViewInit {
    @Input() itemId: number;
    private rowData = [];
    private technicalDetailsGrid: GridOptions;
    public rowOffset: number = 0;
    public rowLimit: number = 25;
    public totalRowCount: number = 1000;
    public sortBy: string = '';
    constructor(
      private itemservice: ItemsService,
    ){
        let _self = this;
        this.technicalDetailsGrid = {
            enableColResize: true,
            rowDeselection: true,
            suppressContextMenu:true,
            pagination:true,
            toolPanelSuppressSideButtons:true,
            paginationPageSize: this.rowLimit,
            headerHeight: 30,
            suppressRowClickSelection: true,
            suppressCellSelection: true,
            defaultColDef: {
              suppressMenu: true
            },
            columnDefs: _self.CreateAGGrid(),     
            onGridReady: e => {
                this.PopulateData();
                setTimeout( () => {
                    _self.technicalDetailsGrid.api.sizeColumnsToFit();
                },0)
              },             
        };
    }
  
    ngOnInit() {
    }

    ngAfterViewInit(){
    }
   
    PopulateData(){
       let _self = this; 
       let rowData=[];  
        _self.itemservice.GetItemTechnicalDetails(_self.itemId).subscribe(
            data => {
             data.results.map((x)=>{
                let row = this.createRow(x);
                rowData.push(row);
             })
             _self.technicalDetailsGrid.api.setRowData(rowData);  
            }) 
    }    

    createRow(technical){
        var detail = {
          key:technical.key,
          value:technical.value,
        }
        return detail;
    }
   
    CreateAGGrid() {
        let _self = this;   
        return  [
            {
                headerName: "Attribute",
                field: "key",
                headerClass: "grid-header",
                width: 600
            },
            {
                headerName: "Value",
                field: "value",
                headerClass: "grid-header",
                width: 600
            },
            ]
    }
}