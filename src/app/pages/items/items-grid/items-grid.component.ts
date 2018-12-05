import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, IServerSideDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params  } from '@angular/router';
import { ItemsService} from './../../../_services/items.service';
import { Item }from './../../../_models/items/item';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { GridSettings } from './../../../_models/common/GridSettings';


@Component({
  selector: 'az-items-grid',
  templateUrl: './items-grid.component.html',
  styleUrls: ['./items-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class ItemsGridComponent implements OnInit,AfterViewInit {
  private agGridOptions: GridOptions;
  private AcData = [];
  private columnDefs: any;
  private searchParamter: string = '';
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 1000;
  public sortBy: string = '';
  private glbDataSource :IServerSideDatasource;
  private gridName = 'items-grid';
  private defaultGridSettings: GridSettings;


  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private itemservice: ItemsService, 
    private agGridSettings: AGGridSettingsService) {
      this.defaultGridSettings = new GridSettings();
      let _self = this;
}

  ngOnInit() {
    this.CreateAGGrid();
    this.activatedRoute.params.subscribe((Params: Params) => {
    });
  }

  ngAfterViewInit(): void {
    jQuery(".itemsGrid .quotePartsButton").appendTo(".itemsGrid .ag-paging-panel");
    this.PopulateGridDataSource(this.searchParamter);
  }

  refreshGrid(){
    console.log("refresh items-grid")

    this.agGridOptions.api.setServerSideDatasource(this.glbDataSource);
  }

  onCellClicked(e){
    let colId = e.column.colId;
    let itemId = e.data.ItemID;
    
    console.log(colId + ' column clicked with ItemID: ' + itemId);
    if (colId == 'ManufacturerPartNumber')
      this.router.navigate(['pages/items/items/item-details',{itemId: itemId}]);
    // if(e.event.target !== undefined){
    //   this.router.navigate(['pages/contacts/contact-details',{contactId: e.node.data.contactId, accountId: e.node.data.accountId}]);
    // }
  }

  AddNewItem(){
    this.router.navigate(['pages/items/items/item-details']);
  }  

CreateAGGrid() {
  let _self = this;

this.agGridOptions = {
    // floatingFilter:true,
    debug: true,
    enableServerSideSorting: true,
    // enableServerSideFilter: true,
    enableColResize: true,
    pagination:true,
    rowSelection: 'single',
    rowDeselection: true,
    rowModelType: 'serverSide',
    suppressContextMenu:true,
    paginationPageSize: this.rowLimit,
    maxConcurrentDatasourceRequests: 2,
    toolPanelSuppressSideButtons:true,
    defaultColDef:{suppressMenu:true},
    onGridReady: e => {
      setTimeout( () => {
          _self.loadGridState();
      }, 0)
    }
  };
    this.agGridOptions.serverSideDatasource = this.glbDataSource;
    this.agGridOptions.columnDefs = [
      {
        headerName: "Manufacturer Part Number",
        field: "ManufacturerPartNumber",
        headerClass: "grid-header",
        width: 460
      },
      {
        headerName: "Manufacturer",
        field: "ManufacturerName",
        headerClass: "grid-header",
        width: 260
      },
      {
        headerName: "Commodity",
        field: "CommodityName",
        headerClass: "grid-header",
        width: 260
      },
      {
        headerName: "Status",
        field: "Status",
        headerClass: "grid-header",
        width: 250
      },
      {
        headerName: "Description",
        field: "Description",
        headerClass: "grid-header",
        width: 550
      }
    ]
}

SearchItems() {
  console.log('Items grid - item search: ' + this.searchParamter);  
  this.PopulateGridDataSource(this.searchParamter);
  this.agGridOptions.api.setServerSideDatasource(this.glbDataSource);
  //this.loadGridState();

}

//this should be the new way that supports Paginatation
PopulateGridDataSource(searchString: string) {
  let self = this;

  var dataSource = {
    getRows: function (params) {
      //Declare rowLimit/rowOffset for API
      let rowLimit = params.request.endRow - params.request.startRow;
      let rowOffset = params.request.startRow;
      
      let sortCol = '';
      let sortOrder = '';
      let DescSort = false;
      //Sort detected
      if (params.request.sortModel[0]) {
        sortCol = params.request.sortModel[0].colId;
        sortOrder = params.request.sortModel[0].sort;
        switch (sortOrder) {
            case "asc":
                DescSort = false;
                break;

            case "desc":
                DescSort = true;
                break;
        }
        if (sortCol == "Status" || sortCol == "Description") {
          console.log('Items Grid - sort column not supported: ' + sortCol)
        }

        else {
          console.log('Items Grid - sort by: ' + sortCol + ', ' + sortOrder);
        }
      }

      console.log('Items grid asking for rows  ' + params.request.startRow + ' to ' + params.request.endRow);
      self.itemservice.GetItemsListForGrid(searchString, rowOffset, rowLimit, sortCol, DescSort).subscribe(
        data => {
          let items = data.results;

          //Total Rows
          self.totalRowCount = data.totalRowCount;
           console.log('Item grid total rows: ' + self.totalRowCount);
          let itemDataService = [];
          items.ForEach(element => {
            itemDataService.push({
              ItemID: element.ItemID, 
              ManufacturerPartNumber: element.ManufacturerPartNumber,
              ManufacturerName: element.ManufacturerName,
              CommodityName: element.CommodityName,
              Status: element.Status,
              Description: element.Description
            })

          
          })
            //Callback return total row count
            params.successCallback(itemDataService, data.totalRowCount);
          if (items.Count() == 0) {
            params.successCallback(itemDataService, data.totalRowCount);
          }
        
        }
      )}

  }
   this.agGridOptions.api.setServerSideDatasource(dataSource);
   this.glbDataSource = dataSource;
}

resetGridColumns_Click() {
  this.agGridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
  this.agGridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
  this.agGridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef);
  this.agGridOptions.api.sizeColumnsToFit();
}

saveGridState_Click(event) {
  this.agGridSettings.saveGridState(this.gridName, this.agGridOptions).subscribe(
    data => {
      var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
      jQuery(alertEl).fadeIn("slow");
      jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
        // Animation complete.
      });
    });
}

loadGridState() {
  this.defaultGridSettings.ColumnDef = this.agGridOptions.columnApi.getColumnState();
  this.defaultGridSettings.SortDef = this.agGridOptions.api.getSortModel();
 this.defaultGridSettings.FilterDef = this.agGridOptions.api.getFilterModel();
  this.agGridSettings.loadGridState(this.gridName).subscribe(
    data => {
      console.log('Load Grid Settings: ')
      console.log(data);
      if (data.ColumnDef != null)
        this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

      if (data.SortDef != null)
        this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

      if (data.FilterDef != null)
        this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
  })
}


exportGrid_Click(event) {
  let url = 'api/items/getItemsExportList?searchString=' + this.searchParamter;
  var senderEl = event.currentTarget;

  //Button disabled/text change
  jQuery(senderEl).attr('disabled','')
  jQuery(senderEl).find('span').text('Exporting...');

  this.agGridSettings.GetGridExport(url).subscribe(
    data => {
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
    })
}
/*
//Old way that does not support native pagination (but works)
PopulateGrid(searchString: string, rowOffset: number, rowLimit: number, sortBy: string) {
  //Get new data
  this.itemservice.GetItemsList(searchString, rowOffset, rowLimit, sortBy).subscribe(
    data => {
      let items = data.results;
      let itemDataService = [];
      console.log(items);
      items.ForEach(element => {
        itemDataService.push({
          ItemID: element.ItemID,
          ManufacturerPartNumber: element.ManufacturerPartNumber,
          ManufacturerName: element.ManufacturerName,
          CommodityName: element.CommodityName,
          Status: element.Status,
          Description: element.Description
        })
        this.agGridOptions.api.setRowData(itemDataService);
        // if (items.Count() >= this.rowLimit)   //this is not going to work
        //   this.EnablePagination();
      })
    }
  )
}
*/
}
