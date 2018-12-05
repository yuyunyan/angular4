import { Component, OnInit, Input, OnChanges, SimpleChange, ElementRef, ViewChild, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { BuildCheckListService } from './../../../../_services/build-checklist.service';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { SharedService } from './../../../../_services/shared.service';
import { QcLinkType } from './../../../../_models/quality-control/buildCheckList/linkType';
import { QcLinkTypeValue } from './../../../../_models/quality-control/buildCheckList/linkTypeValue';
import { AccountByObjectType } from './../../../../_models/common/accountByObjectType';
import { ItemEnums } from './../../../../_models/common/itemEnums'
import { NotificationsService } from 'angular2-notifications';
import { Ng2CompleterModule, RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';
import { MyRequestOptions } from './../../../../_helpers/myRequestOptions';
import { ItemCommodity } from './../../../../_models/Items/itemCommodity';
import { ItemsService} from './../../../../_services/items.service';
import { ItemTypeaheadGridComponent } from './../../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';


@Component({
  selector: 'az-associations',
  templateUrl: './associations.component.html',
  styleUrls: ['./associations.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssociationsComponent implements OnInit, OnChanges,AfterViewInit {
  @Input() checkListId;
  private agGridOptions: GridOptions;
  private gridName = 'az-associations';
  private AcData = [];
  private columnDefs: any;
  private searchParamter: string = '';
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 1000;
  private rowHeight = 30;
  private headerHeight = 30;
  private linkTypeCompany = 110;
  private linkTypeCommodity = 101;
  private linkTypeItems = 103;
  private linkTypeManufacturer = 102;

  public sortBy: string = '';
  private commodityList: ItemCommodity[];
  private companyTypes : any;
  private glbDataSource: IDatasource;
  private rowDataSet = [];
  public linkTypes: QcLinkType[];
  public linkType: number;
  public linkTypeValueId: number;
  public linkTypeValues: AccountByObjectType[];
  private poObjectTypeId: number;
  private soObjectTypeId: number;
  private commondityId : number;
  private companyTypeId : number;
  @ViewChild('assCloseBtn') closeBtn: ElementRef;
  private dataRemote: RemoteData;
  private dataRemote2: RemoteData;
  private dataRemote3: RemoteData;
  private dataRemote4: RemoteData;

  private isSupplier: boolean = false;
  private isCustomer: boolean = false;
  private isManufacturer: boolean = false;
  private isCommodity: boolean = false;
  private isItems: boolean = false;
  private isCompanyType: boolean = false;

  constructor(
    completerService: CompleterService, 
    private itemsService: ItemsService,
    private checkListService: BuildCheckListService, 
    private purchaseOrderService: PurchaseOrdersService,
    private salesOrderService: SalesOrdersService,
    private sharedService:SharedService,
    private notificationService: NotificationsService) {
    this.agGridOptions = {
      // floatingFilter:true,
      enableServerSideSorting: true,
      // enableServerSideFilter: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      toolPanelSuppressSideButtons:true,
      pagination: true,
      suppressContextMenu:true,
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2
    };

    this.dataRemote = completerService.remote(
      environment.apiEndPoint + "/api/accounts/getAccountsByNameNum?accountType=1&searchString=",
      "accountNameAndNum",
      "accountNameAndNum"
    );
    this.dataRemote.dataField("accounts");
    this.dataRemote2 = completerService.remote(
       environment.apiEndPoint + "/api/accounts/getAccountsByNameNum?accountType=4&searchString=",
      "accountNameAndNum",
      "accountNameAndNum"
    );
    this.dataRemote2.dataField("accounts");

   // manufacturers
    this.dataRemote3 = completerService.remote(
			null,
			"mfrName",
			"mfrName"
    );
    let requestOptions = new MyRequestOptions();
    this.dataRemote3.requestOptions(requestOptions);
		this.dataRemote3.urlFormater(term => {
      return environment.apiEndPoint + '/api/items/getManufacturersList?SearchText=' + encodeURIComponent(term); 
		});
    this.dataRemote3.dataField("manufacturers");
    this.commodityList = new Array<ItemCommodity>();
    this.itemsService.GetCommodities().subscribe(data => {
      this.commodityList = data.results;
    });

    this.dataRemote4 = completerService.remote(
      environment.apiEndPoint + "/api/items/getSuggestions?searchString=",
      null,
      "data"
    );
    this.dataRemote4.requestOptions(requestOptions);
    this.dataRemote4.dataField("suggestions");

    this.sharedService.getCompanyTypes().subscribe(data=>{
      this.companyTypes = data;
    })
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let checkListIdProp = changes['checkListId'];
    this.checkListId = checkListIdProp.currentValue;
    ;
    this.checkListService.getChecklistAssociations(this.checkListId).subscribe(
      data => {
        ;
        this.PopulateGridDataSource(data);
      }
    );
    this.GetLinkTypes();
  }

  ngOnInit() {
    this.CreateAGGrid();
  }

  refreshGrid(){
  this.checkListService.getChecklistAssociations(this.checkListId).subscribe(
    data => {
      this.PopulateGridDataSource(data);
        this.CreateAGGrid();
    })
  }

  ngAfterViewInit(): void {
    jQuery(".associationsGridOuter .quotePartsButton").appendTo(".associationsGridOuter .ag-paging-panel");
  }

  onAccountSelected($event){
    if($event != null){
      if(this.isSupplier || this.isCustomer){
      this.linkTypeValueId = $event.originalObject.accountId;
      }else if(this.isManufacturer){
        this.linkTypeValueId = $event.originalObject.mfrId;
      }else if(this.isCommodity){
        this.linkTypeValueId = this.commondityId;
      }else if(this.isItems){
        this.linkTypeValueId = $event.originalObject.id;
      }else if(this.isCompanyType){
        this.linkTypeValueId = this.companyTypeId;
      }
  }
}

  GetLinkTypes() {
    this.checkListService.getLinkTypes().subscribe(
      data => {
        this.linkTypes = data.results;
      }
    )
  }

  LinkTypeChanged(e) {
    if (this.linkType == 1) {
       this.isManufacturer = false;
       this.GetAccountValues(this.linkTypes[e.target.selectedIndex].accountTypeId);
      
    }else if (this.linkType == 0){
      this.isCustomer = false;
      this.isSupplier = false;
      this.isManufacturer = false;
      this.isCommodity = false;
      this.isItems = false;

      jQuery('#selLinkValue').attr('disabled', '')
      jQuery('#selLinkValue').val(0)

    }else if(this.linkType == this.linkTypeManufacturer){
      this.isCustomer = false;
      this.isSupplier = false;
      this.isManufacturer = true;
      this.isCommodity = false;
      this.isItems = false;
      this.isCompanyType = false;
    
    }else if(this.linkType == this.linkTypeCompany){
      this.isCustomer = false;
      this.isSupplier = false;
      this.isManufacturer = false;
      this.isCommodity = false;
      this.isItems = false;
      this.isCompanyType = true;

    }else if(this.linkType == this.linkTypeCommodity){
      this.isCustomer = false;
      this.isSupplier = false;
      this.isManufacturer = false;
      this.isItems = false;
      this.isCommodity = true;
      this.isCompanyType = false;

    }else if(this.linkType == this.linkTypeItems){
      this.isCustomer = false;
      this.isSupplier = false;
      this.isManufacturer = false;
      this.isItems = true;
      this.isCommodity = false;  
      this.isCompanyType = false;

    }else{
      this.isCustomer = false;
      this.isSupplier = false;
      this.isManufacturer = false;
      this.isCommodity = false;
      this.isItems = false;
      this.isCompanyType = false;

      this.GetNonAccountValues(this.linkTypes[e.target.selectedIndex].objectTypeId);
      jQuery('#selLinkValue').removeAttr('disabled')
    }
  }

  GetAccountValues(type) {
    if (type == 1) {
      this.isItems = false;
      this.isManufacturer = false;
      this.isCustomer = false;
      this.isCommodity = false;
      this.isCompanyType = false;
      this.isSupplier = true;
       this.purchaseOrderService.getPurchaseOrderObjectTypeId().subscribe(data => {
        this.poObjectTypeId = data;
        this.sharedService.getAccountsByObjectType(this.poObjectTypeId).subscribe(data=>{
          this.linkTypeValues = data;
        })
      })
    }
    else if (type == 4) {
      this.isSupplier = false;
      this.isItems = false;
      this.isManufacturer = false;
      this.isCommodity = false;
      this.isCustomer = true;
      this.salesOrderService.getSalesOrderObjectTypeId().subscribe(data=>{
        this.soObjectTypeId = data;
        this.sharedService.getAccountsByObjectType(this.soObjectTypeId).subscribe(data=>{
          this.linkTypeValues = data;
        })
      })
    }
  }

  GetNonAccountValues(type) {
    if (type == ItemEnums.Commodity)
      this.MapCommodityLinks();
    if (type == ItemEnums.Item)
      this.MapItemLinks();
    if (type == ItemEnums.Manufacturer)
      this.MapMfgLinks();
  }

  MapCommodityLinks() {
    this.checkListService.getCommodityLinkTypeValues().subscribe(
      data => {

        let linkValues = new Array<AccountByObjectType>();
        data.results.forEach(element => {
          let link = new AccountByObjectType();
          link.accountId = element.CommodityID;
          link.accountName = element.CommodityName;
          linkValues.push(link);
        });
        this.linkTypeValues = linkValues;
      }
    )
  }

  MapItemLinks() {
    this.checkListService.getItemLinkTypeValues().subscribe(
      data => {
        let linkValues = new Array<AccountByObjectType>();
        data.forEach(element => {
          let link = new AccountByObjectType();
          link.accountId = element.ItemID;
          link.accountName = element.ManufacturerPartNumber;
          linkValues.push(link);
        });
        this.linkTypeValues = linkValues;
      }
    )
  }

  MapMfgLinks() {
    this.checkListService.getManufacturerLinkTypeValues().subscribe(
      data => {

        let linkValues = new Array<AccountByObjectType>();
        data.manufacturers.forEach(element => {
          let link = new AccountByObjectType();
          link.accountId = element.MfrID;
          link.accountName = element.MfrName;
          linkValues.push(link);
        });
        this.linkTypeValues = linkValues;
      }
    )
  }

  loadDeleteBtn(params, _self) {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    anchor.innerHTML+='&nbsp;'
    i.className = 'fas fa-times';
    i.setAttribute('aria-hidden', 'true');
    anchor.appendChild(i);
    anchor.href = "javascript:void(0)";

    anchor.addEventListener("click", function () {

      _self.checkListService.deleteAssociation(_self.checkListId, params.node.data.objectId, params.node.data.objectTypeId).subscribe(data => {
        _self.notificationService.success(
          'Good Job',
          'Successfully deleted an association',
          {
            pauseOnHover: false,
            clickToClose: false
          }
        )
        let res = data.json();
        console.log("deleted an association", res);
        _self.resetAfterSave();
      });

    });
    return anchor;
  }

  onCellClicked(e) {

  }

  CreateAGGrid() {
    let _self = this;
    let columnDefs = [
      {
        headerName: "Link Type",
        field: "linkType",
        headerClass: "grid-header",
        width: 539
      },
      {
        headerName: "Value", 
        field: "value",
        headerClass: "grid-header",
        width: 539
      },
      {
        headerName: "",
        headerClass: "grid-header",
        cellRenderer: function (params) { return _self.loadDeleteBtn(params, _self) },
        width: 50,
        maxWidth: 50,
        lockPinned: true,
        pinned: "right"
      }
    ]
        this.agGridOptions.columnDefs = columnDefs;
        this.agGridOptions.rowHeight = this.rowHeight;
        this.agGridOptions.headerHeight = this.headerHeight;
  }

  closeModal(){
    jQuery('#mdlAddLink').modal('hide');
    this.isItems = false;
    this.isCommodity = false;
    this.isCustomer = false;
    this.isManufacturer = false;
    this.isSupplier = false;
  }

  createLink() {
    this.checkListService.setAssociation(this.checkListId, this.linkTypeValueId, this.linkType).subscribe(data => {
      this.notificationService.success(
        'Good Job',
        'Successfully added a new association!',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      )
      let res = data.json();
      console.log("added a new association", res);
      this.resetAfterSave();
      jQuery('#mdlAddLink').modal('hide');
      this.isItems = false;
      this.isCommodity = false;
      this.isCustomer = false;
      this.isManufacturer = false;
      this.isSupplier = false;
    });
  }

  resetAfterSave() {
    //this.closeBtn.nativeElement.click();
    this.linkType = null;
    this.linkTypeValueId = null;
    this.linkTypeValues = new Array<AccountByObjectType>();
    this.isCustomer = false;
    this.isSupplier = false;

    this.checkListService.getChecklistAssociations(this.checkListId).subscribe(
      data => {
        this.PopulateGridDataSource(data);
        this.CreateAGGrid();
      }
    );

  }

  PopulateGridDataSource(data) {
    let self = this;
    let associations = [];
    let associationData = data;


    associationData.forEach(element => {
      associations.push({
        linkType: element.linkType,
        value: element.value,
        objectTypeId: element.objectTypeId,
        objectId: element.objectId
      })
    })

    this.rowDataSet = associations;
    this.agGridOptions.api.setRowData(associations);
    this.agGridOptions.api.sizeColumnsToFit();
  }
}
