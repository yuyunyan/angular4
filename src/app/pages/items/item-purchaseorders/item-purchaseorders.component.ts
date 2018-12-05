import { Component, OnInit,Input, AfterViewInit} from '@angular/core';
import { GridOptions,ColumnApi, IDatasource  } from "ag-grid";
import { ItemsService } from '../../../_services/items.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import { NumericInputComponent } from './../../_sharedComponent/numeric-input/numeric-input.component';
import { Router } from '@angular/router';
import { SharedService } from './../../../_services/shared.service';
import { CommaThousandSeparator } from './../../../_utilities/CommaThousandSeparator/commaThousandSeparator'; 
import { DateFormatter } from '../../../_utilities/dateFormatter/dateFormatter';


@Component({
  selector: 'az-item-purchaseorders',
  templateUrl: './item-purchaseorders.component.html',
  styleUrls: ['./item-purchaseorders.component.scss'],
})

export class ItemPurchaseOrderComponent implements OnInit,AfterViewInit {
    @Input() itemId: number;
    private rowData = [];
    private agGridOptions: GridOptions;
    private dateFormatter = new DateFormatter();
    private commaThousandSeparator = new CommaThousandSeparator();
    private glbDataSource : IDatasource;
    public rowOffset: number = 0;
    public rowLimit: number = 25;
    public totalRowCount: number;
    public sortBy: string = '';
    constructor(

        private sharedService: SharedService,
        private itemservice: ItemsService,
        private sopoUtilities: PoSoUtilities,
        private router: Router, 
    ){
        let _self = this;
        this.agGridOptions = {
            enableServerSideSorting: true,
            enableServerSideFilter: true,
            context : _self,
            enableColResize: true,
            rowDeselection: true,
            rowModelType: 'serverSide',
            suppressContextMenu:true,
            pagination:true,
            cacheBlockSize: 25,
            maxBlocksInCache:1,
            toolPanelSuppressSideButtons:true,
            paginationPageSize: this.rowLimit,
            maxConcurrentDatasourceRequests: 2,
            headerHeight: 35,
            suppressRowClickSelection: true,
            suppressCellSelection: true,
            defaultColDef: {
              suppressMenu: true
            },
            columnDefs: _self.CreateAGGrid(),                   
        };
    }
  
    ngOnInit() {
    }

     ngAfterViewInit(): void{
        this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource());
    }

     PopulateGridDataSource() {
       let _self = this;
       let dataSource = {
         getRows: function (params) {
           let rowLimit = params.request.endRow - params.request.startRow;
           let rowOffset = params.request.startRow;  
           this.sortBy = '';
           let sortOrder = '';
           let DescSort = false;
           if (params.request.sortModel[0]) {
               
               this.sortBy = params.request.sortModel[0].colId;
               if(this.sortBy === "purchaseOrderId"){
                this.sortBy = "POExternalID";
               }
             sortOrder = params.request.sortModel[0].sort;
             switch (sortOrder) {
                 case "asc":
                     DescSort = false;
                     break;
     
                 case "desc":
                     DescSort = true;
                     break;
             }
           }
           _self.itemservice.GetItemPurchaseOrdersList(_self.itemId, rowOffset, rowLimit, this.sortBy, DescSort).subscribe(
             data => {
                 let items = data.results;
               _self.totalRowCount = data.totalRowCount;
                let rowData = [];
                items.map(element => {
                 rowData.push({
                    purchaseOrderId: element.purchaseOrderId,
                    displayId: _self.sopoUtilities.DisplayOrderId(element.poExternalId, element.purchaseOrderId),
                    versionId: element.versionId,
                    accountId: element.accountId,
                    accountName: element.accountName,
                    owners: element.owners,
                    orgName: element.orgName,
                    statusName: element.statusName,
                    orderDate:_self.dateFormatter.formatDate(element.orderDate),
                    qty: element.qty? element.qty: 0, 
                    cost: _self.commaThousandSeparator.commaThousand(element.cost),
                    dateCode: element.dateCode,
                    warehouseName : element.warehouseName,
                    packagingName: element.packagingName,
                    conditionName: element.conditionName,
                 })  
               })
               if(rowData.length==0){
                rowData.push({
                  displayId:'',
                  accountName:'',
                  owners:''
                })
               _self.agGridOptions.api.showNoRowsOverlay();
             }
               params.successCallback(rowData, data.totalRowCount);
            
             })
           }         
       }   
        return dataSource;     
    }

    numericCellRenderer(params){
        return parseInt(params.value).toLocaleString();
    }

    poLinkClicked(poId,versionId){
        return ()=> this.router.navigate(['pages/purchase-orders/purchase-order-details', { purchaseOrderId: poId, versionId: versionId }]);
    }

    accountLinkClicked(accountId)
    {
        return ()=> this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
    }

    createLink (text, clickEvent) {
        var anchor = document.createElement('a');
        anchor.text = text;
        anchor.href = "javascript:void(0)";
        anchor.addEventListener("click", clickEvent);
        return anchor;
    }
   
    CreateAGGrid() {
        let _self = this;   
        return  [
            {
                headerName: "PO #",
                field: "displayId",
                headerClass: "grid-header",
                width:100,
                cellRenderer:function(params){
                    return _self.createLink(params.data.displayId,_self.poLinkClicked(params.data.purchaseOrderId,params.data.versionId))
                }
            },
            {
                headerName: "Vendor",
                field: "accountName",
                headerClass: "grid-header",
                width: 175,
                cellRenderer:function(params){
                    return _self.createLink(params.data.accountName,_self.accountLinkClicked(params.data.accountId))
                }
            },
            {
                headerName: "Buyer",
                field: "owners",
                headerClass: "grid-header",
                width: 154
            },
            {
                headerName: "Company",
                field: "orgName",
                headerClass: "grid-header",
                width: 225
            },
            {
                headerName: "Location",
                field: "warehouseName",
                headerClass: "grid-header",
                width: 150
            },
            {
                headerName: "Order Date",
                field: "orderDate",
                headerClass: "grid-header",
                width: 100
            },
            {
                headerName: "Qty Ordered",
                field: "qty",
                headerClass: "grid-header",
                width: 100,
                cellRenderer: this.numericCellRenderer,
            },
            {
                headerName: "Cost",
                field: "cost",
                headerClass: "grid-header",
                width: 100, 
                cellEditorFramework: NumericInputComponent,
            },
            {
                headerName: "DateCode",
                field: "dateCode",
                headerClass: "grid-header",
                width: 100
            },
            {
                headerName: "Packaging Type",
                field: "packagingName",
                headerClass: "grid-header",
                width: 100
            },
            {
                headerName: "Package Condition",
                field: "conditionName",
                headerClass: "grid-header",
                width: 120
            },
            {
                headerName: "Status",
                field: "statusName",
                headerClass: "grid-header",
                width: 100
            },
            ]
        }
}