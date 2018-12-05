import { Component, OnInit, SimpleChange, Input, Output, EventEmitter } from '@angular/core';
import { GridOptions, IDatasource } from "ag-grid";
import { FlaggedGridItem } from './../../../../_models/bom/FlaggedGridItem';
import { Subject } from 'rxjs/Subject';

@Component({
  templateUrl: './base-bom-search-component.component.html',
})
export class BaseBomSearchComponentComponent implements OnInit {
  @Input() childComValue;
  @Input() flagPartNumber;
  @Input() filterPartNumber;
  @Input() searchId;
  @Input() bomUploadId;
  @Input() bomListId;
  @Input() flaggedGridItems: Array<FlaggedGridItem>;
  @Output() partNumberFlagChanged = new EventEmitter();
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  protected gridOptions: GridOptions;
  
  constructor() { 
    this.gridOptions = {
      // pagination: true,
      enableServerSideSorting: true,
      // enableServerSideFilter: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      suppressContextMenu:true,
      rowModelType: 'serverSide',
      paginationPageSize: 25,
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      maxConcurrentDatasourceRequests: 2,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true
      },
      // suppressColumnVirtualisation:true,
      columnDefs : this.createColDefs()
    };
    this.flaggedGridItems = new Array<FlaggedGridItem>();
  }

   createColDefs(){return null}
  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let bomUploadIdProp = changes['bomUploadId'];
    let bomListIdProp = changes['bomListId'];
    
      if(bomUploadIdProp){
        this.bomUploadId= bomUploadIdProp.currentValue;
        this.gridOptions.columnDefs= this.createColDefs();
      }
      if(bomListIdProp){
        this.bomListId = bomListIdProp.currentValue;
        this.gridOptions.columnDefs = this.createColDefs();
      }
    
    if(!this.childComValue)
    {
      return;
    }

    let flaggedGridItemsProp = changes["flaggedGridItems"];
    if(flaggedGridItemsProp && !flaggedGridItemsProp.firstChange)
    {
      this.flaggedGridItems = flaggedGridItemsProp.currentValue;
      this.gridOptions.api.refreshView();
    }
    
    let searchIdtProp = changes['searchId'];
    let filterPartNoProp = changes['filterPartNumber'];
    let searchIdChanged = searchIdtProp && searchIdtProp.currentValue? true:false;
    let partNoChanged = filterPartNoProp && filterPartNoProp.currentValue? true:false;
    if(searchIdChanged || partNoChanged)
    {
      if(searchIdChanged)
      {
          this.searchId = searchIdtProp.currentValue;
      }

      if(partNoChanged)
      {
        this.filterPartNumber = filterPartNoProp.currentValue;
      }
      this.gridOptions.api.setServerSideDatasource(this.populateGridDataSource());
    }
  }

  flagIcon(_self, params){
    let partNumber = params.data.partNumber;
    let manufacturer = params.data.manufacturer;
    let itemId = params.data.itemId;
    let anchor = document.createElement('a');
    anchor.href = "javascript:void(0)";
    let i = document.createElement('i');
    i.className = 'fas fa-flag-o';
    anchor.appendChild(i);
    if (_self.flaggedGridItems.findIndex(x => x.partNumber == partNumber && x.manufacturer == manufacturer ) > -1) {
      jQuery(i).removeClass("fas fa-flag-o");
      jQuery(i).addClass("fas fa-flag");
      jQuery(i).addClass("redClass");
    } else {  
      jQuery(i).removeClass("redClass");
      jQuery(i).removeClass("fas fa-flag");
      jQuery(i).addClass("fas fa-flag-o");
    }

    anchor.addEventListener("click", function(){
      let flaggedItem :FlaggedGridItem = { partNumber:partNumber, manufacturer:manufacturer, itemId: itemId };
      _self.partNumberFlagChanged.emit(flaggedItem);
    })
    return anchor;
  }

  populateGridDataSource() {
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
          
        }
        
       self.getDataForGrid(self.searchId, self.filterPartNumber, rowOffset, rowLimit, sortCol, DescSort, params);
      }
    }
    
      return dataSource;
  }

  protected getDataForGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort, params)
  {
  }
  
  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }
}
