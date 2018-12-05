import { Component, OnInit,ViewEncapsulation,Input,Renderer,SimpleChange,AfterViewInit} from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, Grid } from 'ag-grid';
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';

import { GridSettings } from './../../../_models/common/GridSettings';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 

@Component({
  selector: 'az-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss'],
  encapsulation:ViewEncapsulation.None,
  providers: [CookieService,AGGridSettingsService]
})

export class AccountsListComponent implements OnInit,AfterViewInit {
  private agGridOptions: GridOptions;
  private rowLimit: number = 25;
  private rowOffset: number = 0;
  private totalRowCount: number = 0;
  private searchParameter: string = '';
  private accountId: number;
  private rowHeight = 30;
  private headerHeight = 35;
  private accountPage:boolean = true;
  private generalPermission = 'generalPermission';
  private viewType: string;
  private filterColumn : string;
  private filterText : string;
  private showInactive : boolean ;

  private gridName = 'accounts-list';
  private defaultGridSettings: GridSettings;
  private frameworkComponents;
  @Input('accountTypeId') accountTypeId : number;

  private notifyOptions = {
		position: ["top", "right"],
		timeOut: 3000,
		lastOnBottom: true
	};

  constructor(
    private acService: AccountsContactsService,
    private router:Router,
    private ngxPermissionsService: NgxPermissionsService,
    private renderer: Renderer,
    private _cookieService:CookieService,
    private agGridSettings: AGGridSettingsService,
    private poSoUtilities: PoSoUtilities

  ) {
    let _self = this;
    this.defaultGridSettings = new GridSettings();

    this.agGridOptions = {
      enableServerSideSorting: true,
      enableServerSideFilter: true,
      context : _self,
      enableColResize: true,
      rowDeselection: true,
      rowModelType: 'serverSide',
      pagination:true,
      cacheBlockSize: this.rowLimit,
      maxBlocksInCache:1,
      toolPanelSuppressSideButtons:true,
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      headerHeight: _self.headerHeight,
      suppressRowClickSelection: true,
      suppressContextMenu:true,
      suppressCellSelection: true,
      defaultColDef: {
        suppressMenu: false
      },
      enableFilter:true,
      columnDefs: _self.CreateParentColDefs(),
      onGridReady: e => {
        setTimeout( () => {
            _self.loadGridState();
        }, 0)
      }
    };
    this.frameworkComponents = { columnFilterComponent: ColumnFilterComponent };
  var selectedType = this._cookieService.get('viewByAccountOrContact');
  if (selectedType) {
    this.viewType = selectedType;
  }
 else{
    this.viewType = "0";
    this._cookieService.put('viewByAccountOrContact', this.viewType,{expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))});
  }

  }
 
  onCheckboxStateChange($event){
    this.showInactive = $event.target.checked ;
    this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParameter));
  }
  
  ngOnInit() {
    if (localStorage.getItem(this.generalPermission)){
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
        this.ngxPermissionsService.loadPermissions(permissionList);
    }
  }

  ngAfterViewInit(): void {
    jQuery(".accountsGridOuter .quotePartsButton").appendTo(".accountsGridOuter .ag-paging-panel");
    this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParameter));
  }

  closeModal(){
    jQuery("#mdlAccountGroup").toggle();
  }

  refreshGrid(){
    console.log("refresh account-list")
    this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParameter));
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let accountTypeIdProp = changes['accountTypeId'];
    this.accountTypeId = accountTypeIdProp.currentValue;
    if(this.accountTypeId){
      this.agGridOptions.datasource = this.populateGridDataSource(this.searchParameter);
    }
  }
  
  CreateParentColDefs() {
   const _self = this;
    return [
      {
        headerName: "Account Name",
        field: "accountName",
        headerClass: "grid-header",
        suppressFilter : true,
        suppressMenu: true,
        width: 220,
        cellRenderer:function(params){ return _self.createLink(params.data.accountName,_self.linkClicked(params.data.accountId)) },
      },
      {
        headerName: "Account Num",
        field: "accountNum",
        headerClass: "grid-header",
        suppressFilter : true,
        suppressMenu: true,
        width: 220,
        cellRenderer:function(params){ return _self.createLink(params.data.accountNum,_self.linkClicked(params.data.accountId)) },     
      },
      {
        headerName: "Country",
        field: "country",
        headerClass: "grid-header",
        width: 220,
        menuTabs: ["filterMenuTab"],
        filter: 'columnFilterComponent',
      },
      {
        headerName: "City",
        field: "city",
        headerClass: "grid-header",
        width: 220,
        menuTabs: ["filterMenuTab"],
        filter: 'columnFilterComponent',
      },
      {
        headerName: "Organization",
        field: "organization",
        headerClass: "grid-header",
        width: 220,
        menuTabs: ["filterMenuTab"],
        filter: 'columnFilterComponent',
      },
      {
        headerName: "Owner",
        field: "owner",
        headerClass: "grid-header",
        width: 220,
        menuTabs: ["filterMenuTab"],
        filter: 'columnFilterComponent',
      },
      {
        headerName: "Account Status",
        field: "accountStatus",
        headerClass: "grid-header",
        width: 220,
        menuTabs: ["filterMenuTab"],
        filter: 'columnFilterComponent',
      },
    ]
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

  exportGrid_Click($event){
    console.log("accoutn export set");

    let url = 'api/accounts/accountsExport?searchString=' + (this.searchParameter || '')
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
  


  resetGridColumns_Click() {
    this.agGridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.agGridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
    this.agGridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef);
    this.agGridOptions.api.sizeColumnsToFit();
  }

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.agGridOptions.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.agGridOptions.api.getSortModel();
   this.defaultGridSettings.FilterDef = this.agGridOptions.api.getFilterModel();
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }
 
  getHeight(count: number) {
    return (count * (this.rowHeight)) + this.headerHeight;
  }

  searchAccounts() {
    //Refresh the grid api after the search 
    if(this.viewType == "0") {
      this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParameter));
    }
    
  }

  changeViewType(e){
    this.viewType = e.target.value;
    this._cookieService.put('viewByAccountOrContact', this.viewType);
  }
  populateGridDataSource(searchParameter: string) {
    const _self = this;
    let dataSource = {
      getRows: function (params) {
      //Declare rowLimit/rowOffset for API

      if(params.request.filterModel && Object.keys(params.request.filterModel).length > 0){
        for(let col in params.request.filterModel){
          if(params.request.filterModel[col].value != ''){
            _self.filterColumn = col;
            _self.filterText = params.request.filterModel[col].value ;
          }
          else{
            _self.filterColumn = null;
            _self.filterText = null;
          }
        
        }
      }
      let rowLimit = params.request.endRow - params.request.startRow;
      let rowOffset = params.request.startRow;
      let isActive = true;
      let sortCol = '';
      let sortOrder = '';
      let descSort = false;
      //Sort detected
      if (params.request.sortModel[0]) {
        sortCol = params.request.sortModel[0].colId;
        sortOrder = params.request.sortModel[0].sort;
        switch (sortOrder) {
            case "asc":
                descSort = false;
                break;

            case "desc":
                descSort = true;
                break;
        }
      
      }
      if(_self.showInactive) {
        isActive = false;
      }
      else{
        isActive = true;
      }     
        _self.acService.getAccounts(_self.accountId, rowOffset, rowLimit, sortCol, descSort, searchParameter, _self.accountTypeId,  _self.filterColumn ,_self.filterText , isActive).subscribe(data => {
          let accounts = data.results;
          _self.totalRowCount = data.totalRowCount;

          let accountsDataService = [];
          accounts.forEach(element => {
            accountsDataService.push({
              accountId: element.accountId,
              accountName: element.accountName,
              accountNum: element.accountNum,
              accountType: element.accountType,
              country: element.countryName,
              city: element.city,
              organization: element.organization,
              owner: _self.poSoUtilities.RemoveTrailingCommaAndSpace(element.owner),
              accountStatus: element.accountStatus,
              contacts: +element.totalContactCount
            })
          });
          if(accountsDataService.length==0){
            accountsDataService.push({
              accountName:'',
              accountNum:''
            })
            _self.agGridOptions.api.showNoRowsOverlay();
          }
          params.successCallback(accountsDataService, data.totalRowCount);
        })
      }
    }
    return dataSource;
  }

  
  AccountSave($savedAccount){
    jQuery('#mdlCreateAccount').modal('toggle');
    this.router.navigate(['pages/accounts/account-details', { accountId: $savedAccount.accountId}]);
  }

  cancelClicked(){
    jQuery('#mdlCreateAccount').modal('toggle');
  }
  
  // onRowDoubleClicked(e){ 
  //   if(e.event.target !== undefined){
  //     e.context.router.navigate(['pages/accounts/account-details',{accountId: e.node.data.accountId}]);
  //   }

  // }

  onGroupModalClicked(){
    jQuery("#mdlAccountGroup").modal("toggle");
    jQuery('.modal-backdrop').css('z-index', '100');
    setTimeout(() => {
      this.acService.accountGroupModalOpen();
    }, 500);
    // let lineGridElement = document.querySelector('#accountGroupListGrid').querySelector('.ag-bl');
    // this.renderer.setElementStyle(lineGridElement, 'height', '500px');


  }

  createLink(text,clickEvent){
    var anchor = document.createElement('a');
    anchor.href="javascript:void(0)";
    anchor.text = text? text  : '';
    anchor.addEventListener("click",clickEvent);
    return anchor;
  }
 
  linkClicked(accountId){
    return ()=> this.router.navigate(['pages/accounts/account-details',{accountId: accountId}]);
  }


  

}

