import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';
import { Component, OnInit, ViewEncapsulation,OnDestroy , Input, OnChanges , SimpleChange,AfterViewInit} from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from "ag-grid";
import { ContactsService } from './../../../_services/contacts.service';
import { Contacts, ListContact } from './../../../_models/contactsAccount/contacts';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import * as _ from 'lodash';
import { GridSettings } from './../../../_models/common/GridSettings';


@Component({
 selector: 'az-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class ContactListComponent implements OnInit,OnDestroy,AfterViewInit {
  private ACGridOptions: GridOptions;

  private contacts: ListContact[];
  private rowHeight: 40;
  private searchParameter: string ;
  public rowLimit: number = 25;
  public totalRowCount: number = 1000;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input('accountTypeId') accountTypeId : number;
  @Input('showInactive') showInactive : boolean;
  private gridName = 'contacts-grid';
  private filterColumn : string;
  private filterText : string;
  private defaultGridSettings: GridSettings;
 

  constructor(
    private contactsService: ContactsService,
    private router:Router, 
    private agGridSettings: AGGridSettingsService )  
    {

    let _self = this;
    this.defaultGridSettings = new GridSettings();

    this.ACGridOptions = {
      enableServerSideSorting: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      rowModelType: 'serverSide',
      paginationPageSize: this.rowLimit,
      pagination : true,
      suppressContextMenu:true,
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      toolPanelSuppressSideButtons:true,
      overlayNoRowsTemplate:'',
      maxConcurrentDatasourceRequests: 2,
      enableFilter:true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      enableServerSideFilter:true,
      defaultColDef: {
        suppressMenu: true
      },
    columnDefs : _self.createACGrid(),
    onGridReady: e => {
      setTimeout( () => {
          _self.loadGridState();
      }, 0)
    }
  };
    }

  ngOnInit() {

   
  }

  ngAfterViewInit(): void {
    jQuery(".contactGridOuter .quotePartsButton").appendTo(".contactGridOuter .ag-paging-panel");
    this.ACGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let accountTypeIdProp = changes['accountTypeId'];
    if(changes['accountTypeId']){
      if(typeof changes['accountTypeId'].currentValue != "undefined")
      this.accountTypeId = accountTypeIdProp.currentValue;
      else
      this.accountTypeId = accountTypeIdProp.previousValue;
    }
    let showInactiveProp = changes['showInactive'];
    if(changes['showInactive']){
      if(typeof changes['showInactive'].currentValue === "undefined")
      this.showInactive = showInactiveProp.previousValue;
      else{
        this.showInactive = showInactiveProp.currentValue;
        if (this.ACGridOptions){
          this.ACGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter)); 
        }
      }
    }        
  }
  // onRowDoubleClicked(e){
    
  //   if(e.event.target !== undefined){
  //     this.router.navigate(['pages/accounts/contact-details',{contactId: e.node.data.contactId, accountId: e.node.data.accountId}]);
  //   }
  // }
  contactLinkClicked(accountId , contactId){
    this.router.navigate(['pages/accounts/contact-details', { contactId : contactId , accountId: accountId }]);
  }


  SearchContacts() {
    this.ACGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
 }
  createACGrid() {
    const _self = this;
    return [
      {
        headerName: "First Name",
        field: "firstName",
        width: 200,
        headerClass: "grid-header",
        filterFramework: ColumnFilterComponent,
        cellRenderer: function (params) {
                    
          var anchor = document.createElement('a');
          //anchor.href = "pages/contacts/account-details?accountId="+params.data.accountId;
          anchor.text = params.data.firstName;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.contactLinkClicked(params.data.accountId,params.data.contactId)});
          return anchor;
      },
      },
      {
        headerName: "Last Name",
        field: "lastName",
        width: 200,
        headerClass: "grid-header",
        filterFramework: ColumnFilterComponent,
        cellRenderer: function (params) {
                    
          var anchor = document.createElement('a');
          //anchor.href = "pages/contacts/account-details?accountId="+params.data.accountId;
          anchor.text = params.data.lastName;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.contactLinkClicked(params.data.accountId,params.data.contactId)});
          return anchor;
      },
      },
      {
        headerName: "Account",
        field: "accountName",
        headerClass: "grid-header",
        width: 300,
        cellRenderer: function (params) {
                    
                    var anchor = document.createElement('a');
                    //anchor.href = "pages/contacts/account-details?accountId="+params.data.accountId;
                    anchor.text = params.data.accountName;
                    anchor.href = "javascript:void(0)";
                    anchor.addEventListener("click", function(){_self.accountLinkClicked(params.data.accountId)});
                    return anchor;
                },
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Phone",
        field: "phone",
        width: 150,
        headerClass: "grid-header",
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Email",
        field: "email",
        width: 280,
        headerClass: "grid-header",
        cellRenderer: function (params) {
          if (!params.data.email){
            var span = document.createElement('span');
            return ''
          }
          var anchor = document.createElement('a');
          anchor.href = "mailto:"+ params.data.email;
          anchor.text = params.data.email;
          return anchor;
        },
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Owners",
        field: "owners",
        headerClass: "grid-header",
        width: 350,
        tooltipField : "owners" ,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Account Status",
        field: "accountStatus",
        width: 175,
        headerClass: "grid-header",
        filterFramework: ColumnFilterComponent,
      }
    ];
   
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.ACGridOptions).subscribe(
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

      let url = 'api/accounts/contactsExport?searchString=' + (this.searchParameter || '')
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
    this.ACGridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.ACGridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
    this.ACGridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef);
    this.ACGridOptions.api.sizeColumnsToFit();
  }

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.ACGridOptions.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.ACGridOptions.api.getSortModel();
   this.defaultGridSettings.FilterDef = this.ACGridOptions.api.getFilterModel();
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.ACGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.ACGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.ACGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  accountLinkClicked(accountId)
  {
    this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }

  refreshGrid(){
    console.log("refresh contact-list")

    this.ACGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
  }

PopulateGridDataSource(searchString: string) {
let self = this;

  var dataSource = {
    getRows: function (params) {
      //Declare rowLimit/rowOffset for API
      if(params.filterModel && Object.keys(params.filterModel).length > 0){
        for(let col in params.filterModel){
          if(params.filterModel[col].value != ''){
            self.filterColumn = col;
            self.filterText = params.filterModel[col].value ;
          }
          else{
            self.filterColumn = null;
            self.filterText = null;
          }
        
        }
      }

      let rowLimit = params.request.endRow - params.request.startRow;
      let rowOffset = params.request.startRow;
      let isActive = true;
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

      if(self.showInactive) {
        isActive = false;
      }
      else{
        isActive = true;
      }
      self.contactsService.getContactList(searchString, rowOffset, rowLimit, sortCol, DescSort, self.accountTypeId, self.filterColumn ,self.filterText , isActive).subscribe(
        data => {
          let contacts = data.results;

          //Total Rows
          self.totalRowCount = data.totalRowCount;

          let dataSource = [];
          contacts.forEach(element => {
            dataSource.push({
              accountId:element.accountId,
              firstName: element.firstName,
              lastName: element.lastName,
              phone: element.phone,
              email: element.email,
              owners: element.owners,
              accountName: element.accountName,
              accountTypes: element.accountTypes.Select(x => x.accountTypeName).ToArray().join(" ,"),
              accountStatus: element.accountStatus,
              contactId:element.contactId
            })
            
            //Callback return total row count
            
          })
          if(dataSource.length==0){
            dataSource.push({
              accountName:'',
              email:''
            })
            self.ACGridOptions.api.showNoRowsOverlay();
          }
          params.successCallback(dataSource, data.totalRowCount);
          if(contacts.length == 0){
             params.successCallback(dataSource, data.totalRowCount);
          }
        }
      )}

  }
  
   return dataSource;
   
}


  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }
}

