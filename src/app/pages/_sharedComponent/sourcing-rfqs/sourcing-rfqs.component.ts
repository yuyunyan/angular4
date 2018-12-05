import { Component, OnInit, Input, SimpleChange,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, RowNode } from 'ag-grid';
import { RfqLine } from './../../../_models/rfqs/RfqLine'
import { RfqsService} from './../../../_services/rfqs.service';
import { SharedService } from './../../../_services/shared.service';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'az-sourcing-rfqs',
  templateUrl: './sourcing-rfqs.component.html',
  styleUrls: ['./sourcing-rfqs.component.scss']
})
export class SourcingRfqsComponent{

  private rfqGrid:  GridOptions;  
  @Input('partNumber') partNumber:string;
  @Input('partNumberStrip') partNumberStrip:string;

  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet =[];
  public rowLimit: number = 25;
  private gridName = 'sourcing-rfqs';
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridSettingsVisible: boolean;
  private configStatusId = 0;

  constructor(private rfqsService: RfqsService,
    private router:Router, 
    private agGridSettings: AGGridSettingsService, 
    private sharedService: SharedService) {
  }

  ngOnInit() {
    const _self = this;
    this.rfqGrid = {
      enableColResize: true,
      pagination: true,
      toolPanelSuppressSideButtons:true,
      suppressDragLeaveHidesColumns: true,
      paginationPageSize:25,
      suppressContextMenu:true,
    };
  }
  ngAfterViewInit(): void {
    jQuery(".sourcingfRfqsGridOuter .quotePartsButton").appendTo(".sourcingfRfqsGridOuter .ag-paging-panel");
  }

  ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
    let partNumberProp = changes['partNumberStrip'];
    if(changes['partNumberStrip']){
      if(typeof changes['partNumberStrip'].currentValue === "undefined")
        this.partNumberStrip = changes['partNumberStrip'].previousValue;
      else
        this.partNumberStrip = changes['partNumberStrip'].currentValue;
    }
    if(this.partNumberStrip){
      this.createGrid();
      this.populateGrid();
    //  this.loadGridState();
    //  this.showColumnSettings();
    this.resetGridColumns_Click(); 

    }
    

  }
  
  showColumnSettings() {
    this.gridSettingsVisible = true;
  }

  setHeightOfGrid(count){ 
    let height = this.getHeight(count);
    document.getElementById('sourcing-rfq-grid').style.height = height+'px';
  }

  getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  populateGrid(){
    this.sharedService.getConfigValue('RFQLineWaitingStatus').takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
      this.configStatusId = data.configValue;

       this.rfqsService.getRfqLines(0, this.partNumberStrip, 0, 0, 25, '', false, this.configStatusId).takeUntil(this.ngUnsubscribe.asObservable())
       .subscribe(
         data => {
           let height = data.rfqLines.length > 0 ?
             (data.rfqLines.length < this.rfqGrid.paginationPageSize ? data.rfqLines.length + 1: this.rfqGrid.paginationPageSize)
             : 10;
           this.setHeightOfGrid(height);
           let rowData = new Array();
           if (data.rfqLines == []) {
             rowData = [];
           } else {
             for(let i=0; i< data.rfqLines.length; i++){
               rowData.push({
                vendorRFQId:data.rfqLines[i].vendorRFQId,
                 partNumber:data.rfqLines[i].partNumber,
                 mfr:data.rfqLines[i].manufacturer,
                 supplierName:data.rfqLines[i].supplierName,
                 contactName:data.rfqLines[i].contactName,
                 sentDate:data.rfqLines[i].sentDate,
                 age:data.rfqLines[i].age + ' Day(s)',
                 ownerName:data.rfqLines[i].ownerName,
                 qty:data.rfqLines[i].qty,
                 targetCost:data.rfqLines[i].targetCost ? data.rfqLines[i].targetCost.toFixed(2) : '0.00',
                 dateCode:data.rfqLines[i].dateCode,
                 packagingName:data.rfqLines[i].packagingName  ,
                 accountId : data.rfqLines[i].accountId ,
                 contactId :  data.rfqLines[i].contactId ,
                 itemId :  data.rfqLines[i].itemId          
               });
             }
           }
             this.rfqGrid.api.setRowData(rowData);
            // this.rfqGrid.api.sizeColumnsToFit();
         });
      });
      this.resetGridColumns_Click(); 
  }
  
  createGrid()
  {
    let _self = this;
    let columnDefs =  [
      {
        lockPinned: true,
        headerName:"RFQ Num",
        field:"vendorRFQId",
        pinned: "left",        
        headerClass:"grid-header",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.vendorRFQId;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.vendorRFQClicked(params.data.vendorRFQId)});
          return anchor;
      },
        width: 90,
        maxWidth: 90,
      },
      {
        headerName:"Supplier",
        field:"supplierName",
        headerClass:"grid-header",
        pinned: "left",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.supplierName;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.accountLinkClicked(params.data.accountId)});
          return anchor;
      },
        lockPinned: true,
        width: 100
      },
      {
        headerName:"Contact",
        field:"contactName",
        headerClass:"grid-header",
        pinned: "left",
        lockPinned: true,
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.contactName;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.contactLinkClicked(params.data.accountId, params.data.contactId)});
          return anchor;
      },
        width: 100
      },
      {
        headerName:"Part Number",
        field:"partNumber",
        headerClass:"grid-header",
        pinned: "left",
        lockPinned: true,
        cellRenderer: function (params) {
          if(!params.data.itemId){
            return params.data.partNumber;
          }else{
          var anchor = document.createElement('a');
          anchor.text = params.data.partNumber;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.itemLinkClicked(params.data.itemId)});
          return anchor;
          }
      },
        width: 150
      },
      {
        headerName:"Mfr",
        field:"mfr",
        headerClass:"grid-header",
        pinned: "left",
        lockPinned: true,
        width: 150
      },
      {
        headerName:"Sent Date",
        field:"sentDate",
        headerClass:"grid-header",
        width: 155
      },
      {
        headerName:"Age",
        field:"age",
        headerClass:"grid-header",
        width: 50
      },
      {
        headerName:"Buyer",
        field:"ownerName",
        headerClass:"grid-header",
        width: 125
      },
      {
        headerName:"Quantity",
        field:"qty",
        headerClass:"grid-header",
        width: 100
      },
      {
        headerName:"Target Cost",
        field:"targetCost",
        headerClass:"grid-header",
        width: 100
      },
      {
        headerName:"Date Code",
        field:"dateCode",
        headerClass:"grid-header",
        width: 100
      },
      {
        headerName:"Packaging",
        field:"packagingName",
        headerClass:"grid-header",
        width: 130
      }
    ]

    this.rfqGrid.api.setColumnDefs(columnDefs);
  }

  vendorRFQClicked(vendorRFQId){
    this.router.navigate(['pages/rfqs/rfq-details', { rfqId: vendorRFQId }]);
  }

  accountLinkClicked(accountId){
    this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }

  contactLinkClicked(accountId , contactId){
    this.router.navigate(['pages/accounts/contact-details', { contactId : contactId , accountId: accountId }]);
  }

  itemLinkClicked(itemId){
    this.router.navigate(['pages/items/items/item-details', { itemId : itemId }]);
  }

  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }

  resetGridColumns_Click() {
    if (this.rfqGrid.columnApi && this.rfqGrid.columnDefs){
      this.loadGridState();
      this.rfqGrid.columnApi.resetColumnState();
    }
    if (this.rfqGrid.api){
      this.rfqGrid.columnApi.resetColumnState();
      this.rfqGrid.api.sizeColumnsToFit();
    }
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.rfqGrid).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
          // Animation complete.
        });
      });
  }

  refreshGrid(rowData){
    console.log("refresh sourcing-rfqs");
    this.createGrid();
    this.populateGrid();
    this.loadGridState();
   this.rfqGrid.columnApi.resetColumnState();
    this.rfqGrid.api.setRowData(rowData);
  }

  loadGridState() {
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        console.log(data);
        if (data.ColumnDef != null)
          this.rfqGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.rfqGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.rfqGrid.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  exportGrid_Click(event) {
    let rfqId = 0;
    let url = 'api/rfqs/getRfqLinesExport?rfqId=' + rfqId + '&statusId=' + this.configStatusId + '&partNumberStrip=' + this.partNumberStrip;
    var senderEl = event.currentTarget;

    //Button disabled/text change
    jQuery(senderEl).attr('disabled','')
    jQuery(senderEl).find('span').text('Exporting...');

    this.agGridSettings.GetGridExport(url).subscribe(data => {
			if (data.success) {
				//Button enabled/text change
				jQuery(senderEl).removeAttr('disabled');
				jQuery(senderEl).find('span').text('Export');
				//Alert Animation
				var alertEl = jQuery(senderEl).parent('.ag-grid-sort').find('.grid-Download');
				jQuery(alertEl).fadeIn("slow");
				jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
					// Animation complete.
				});
			}
			else{
				console.log('Error : ', data.errorMsg);
			}
		});
 	}
}


