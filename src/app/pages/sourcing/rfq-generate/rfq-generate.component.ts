import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChange, SimpleChanges, OnChanges, EventEmitter, Output,
	ViewEncapsulation, Renderer } from '@angular/core';
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { RfqsService } from './../../../_services/rfqs.service';
import { Contacts, ListContact } from './../../../_models/contactsAccount/contacts';
import { Commodity} from './../../../_models/shared/commodity';
import { PackagingType } from './../../../_models/shared/packagingType';
import { Supplier } from './../../../_models/shared/supplier';
import { Currency } from './../../../_models/shared/currency';
import { RfqDetails } from './../../../_models/rfqs/RfqDetails';
import { RfqLine } from './../../../_models/rfqs/RfqLine';
import { NotificationsService } from 'angular2-notifications';
import { AccountByObjectType } from './../../../_models/common/accountByObjectType';
import { SharedService } from './../../../_services/shared.service';
import { GridOptions } from "ag-grid";
import { default as swal } from 'sweetalert2';
import { SelectEditorComponent } from './../../_sharedComponent/select-editor/select-editor.component';
import { ItemTypeaheadGridComponent } from './../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { NumericInputComponent } from './../../_sharedComponent/numeric-input/numeric-input.component';
import { PartSourcesComponent } from './../../_sharedComponent/part-sources/part-sources.component';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { OwnershipTypes } from './../../../_models/shared/ownershipTypes';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { ErrorManagementService } from './../../../_services/errorManagement.service';
import * as _ from 'lodash';
import { InputComService } from './../../../_coms/input-com.service';
import { ComoditySelectComponent } from './../../_sharedComponent/comodity-select/comodity-select.component';
import { MfrInputComponent } from './../../_sharedComponent/mfr-input/mfr-input.component';
import { RemoteData, CompleterService, CompleterCmp } from "ng2-completer";
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import { environment } from './../../../../environments/environment';
import { Router } from '@angular/router';
import { SupplierTypeaheadGridComponent } from './../../_sharedComponent/supplier-typeheader-in-grid/supplier-typeheader-grid.component';
import { ContactEditorComponent } from './../../_sharedComponent/contact-input/contact-input.component';
import { ContactDetails } from '../../../_models/contactsAccount/contactDetails';
import { AccountsContactsService } from './../../../_services/accountsContacts.service';

@Component({
  selector: 'az-rfq-generate',
  templateUrl: './rfq-generate.component.html',
	styleUrls: ['./rfq-generate.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [InputComService, AccountsContactsService]
})
export class RfqGenerateComponent {

  @Input() rfqLines: RfqLine[];
  @Output() rfqAdded = new EventEmitter();
  private rfqDetails: RfqDetails[];
  private currencies: Currency[];
  private contacts: Contacts[];
  private commodities: Commodity[];
  // private packagingTypes: PackagingType[];
  private accountsByObjectType: AccountByObjectType[];
	private objectTypeIdForSource: number;
  
  private rowDataSet;
  private supplierRowDataSet;
  private rfqGeneratePartGrid: GridOptions;
  private rfqGenerateSupplierGrid: GridOptions;
  private selectedValue;
  private dataRemote:RemoteData;

  private dataRemoteSupplier: RemoteData;
  private selectedSupplier;
  private rowClassRules;
  private errorMesgSupplier: string = '';
  private errorMesgMPN: string = '';
  private comment: string = '';
  private accountGroupList: Array<any>;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

	@ViewChild('rfqCloseBtn') closeBtn: ElementRef;
	
	constructor(
		private renderer: Renderer,
		private quoteService: QuoteService,
		private sourcingService: SourcingService, 
		private _notificationService: NotificationsService,
		private rfqService: RfqsService,
    private sharedService:SharedService,
    private router: Router,
    private completerService: CompleterService,
    private inputComService: InputComService,
    private accountsService: AccountsContactsService) { 
		this.rfqLines = new Array<RfqLine>();
		this.rfqDetails = new Array<RfqDetails>();
		let newDetail = new RfqDetails();
		this.rfqDetails.push(newDetail);
		this.accountsByObjectType = new Array<AccountByObjectType>();
    this.accountGroupList = new Array<any>();
		let _self = this;
    this.rfqGeneratePartGrid = {
      animateRows:true,
      enableGroupEdit:true,
      enableColResize: true,
      suppressRowClickSelection: true,
      suppressDragLeaveHidesColumns: true,
      editType: 'fullRow',
      pagination: true,
      paginationPageSize:10,
      suppressContextMenu:true,
      rowHeight: 30,
      context: {
        parentComponent: this
      },
      headerHeight: 30,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true}
    };

    let requestOptions = new MyRequestOptions();
    this.dataRemote = completerService.remote(
      environment.apiEndPoint + "/api/items/getSuggestions?searchString=",
      null,
      "data");
    this.dataRemote.requestOptions(requestOptions);
    this.dataRemote.dataField("suggestions");

    this.rfqGenerateSupplierGrid = {
      animateRows:true,
      enableGroupEdit:true,
      // onRowEditingStopped: function(event){_self.saveRow(event,_self)},
      enableColResize: true,
      suppressRowClickSelection: true,
      suppressContextMenu:true,
      editType: 'fullRow',
      pagination: true,
			paginationPageSize:10,
			rowHeight: 30,
      headerHeight: 30,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true}
    };

    this.dataRemoteSupplier = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
    );
    this.dataRemoteSupplier.requestOptions(requestOptions);
		this.dataRemoteSupplier.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&accountType=1' 
		});
    this.dataRemoteSupplier.dataField("accounts");
    this.supplierRowDataSet = [];
    this.rowDataSet = [];

    this.sharedService.suppliersAccountGroupListGet()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
      this.accountGroupList = _.map(data.accountGroups, ag => ag);
    });
	}

	ngOnChanges(changes: SimpleChanges){
		let rfqLineChanges = changes['rfqLines'];
		if (rfqLineChanges && rfqLineChanges.currentValue){
			// if (this.rfqLines.length > 0) {
				// let lineGridElement = document.querySelector('#rfqGeneratePartGrid').querySelector('.ag-bl');
        // this.renderer.setElementStyle(lineGridElement, 'height', '300px');
        
        // let supplierGridElement = document.querySelector('#rfqGenerateSupplierGrid').querySelector('.ag-bl');
        // this.renderer.setElementStyle(supplierGridElement, 'height', '300px');
        setTimeout(() => {
          this.rfqGenerateSupplierGrid.api.sizeColumnsToFit();
        }, 500);
				this.populateGrid();
			// }
		}
  }

  triggerSave(){
    this.rfqGeneratePartGrid.api.stopEditing();
  }

	generatePartGrid(){
		let _self = this;
    let columnDefs = [
      {
        headerName:"Part Number",
        field:"partNumber",
        headerClass:"grid-header",
        cellRenderer: this.PartNumberCellRenderer.bind(_self),
        cellEditorFramework: ItemTypeaheadGridComponent,
        cellClassRules: {
          'invalid-part-input': function(params){
            return !params.data.partNumber;
          }
        },
        cellEditorParams: {
          values: {parentClassName : ".partsContainer"}
        },
        editable: true,
        minWidth: 210,
        width: 210
      },
       {
        headerName:"Manufacturer",
        field:"manufacturer",
        valueGetter: function(params){  
          return params.data.manufacturer;
        },
        cellClassRules: {
          'invalid-part-input': function(params){
            return !params.data.manufacturer;
          }
        },
        editable: true,
        headerClass:"grid-header",
        cellEditorFramework:MfrInputComponent,
        minWidth: 240,
        width: 240
      },
      {
        headerName:"Commodity",
        field: "commodity",
        valueGetter: function(params){  
          return params.data.commodity;
        },
        editable: true,
        headerClass:"grid-header",
        cellRenderer: this.SelectCellRenderer,
        cellEditorFramework: ComoditySelectComponent,
        minWidth: 210,
        width: 210,
        cellEditorParams: {
          values:this.commodities.map(x => {return {id:x.id, name:x.name}})
        },
        cellClassRules: {
          'invalid-part-input': function(params){
            return !params.data.commodity || !params.data.commodity.id;
          }
        }
      },
      {
        headerName:"Quantity",
        field:"qty",
        headerClass:"grid-header",
        minWidth: 110,
        editable: true,
        width: 110,
        cellEditorFramework: NumericInputComponent,
        cellRenderer: this.numericCellRenderer,
        cellStyle: {'text-align':'right'},
        newValueHandler:function(params){
          if(!isNaN(params.newValue) && params.newValue >= 0)
					{
            params.data["qty"] = params.newValue;
            return true;
					}
					else{
            _self._notificationService.alert("invalid input for quantity");
            return false;
					}
        },
        cellClassRules: {
          'invalid-part-input': function(params){
            return !params.data.qty || params.data.qty < 1;
          }
        }
      },
      {
        headerName:"Date Code",
        field:"dateCode",
        headerClass:"grid-header",
        editable: true,
        minWidth: 100,
        width: 100
      },
      {
        headerName:"Note",
        field:"note",
        headerClass:"grid-header",
        editable: true,
        minWidth: 150,
        width: 150
      },
      {
        headerName:"Remove",
        field: 'remove',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-ban' },
        cellRenderer: function(params){return _self.deleteCellRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        minWidth: 45,
        width: 45
      }
    ];
    this.rfqGeneratePartGrid.columnDefs = columnDefs;
    this.rowDataSet = [];
    if (this.rfqGeneratePartGrid.api){
      this.rfqGeneratePartGrid.api.setColumnDefs(columnDefs);
      this.rfqGeneratePartGrid.api.setRowData(this.rowDataSet);
    } 

  }
  
  generateSupplierGrid(){
    let _self = this;
    let columnDefs =  [
      {
        headerName:"Supplier",
        field:"supplierName",
        headerClass:"grid-header",
        cellRenderer: this.PartNumberCellRenderer,
        cellEditorFramework: SupplierTypeaheadGridComponent,
        editable: true,
        minWidth: 260,
        width: 260,
        cellClassRules: {
          'invalid-supplier-input': function(params){
            return !params.data.supplierId;
          }
        },
      },
       {
        headerName:"Contact",
        field:"contact",
        editable: true,
        headerClass:"grid-header",
        cellRenderer: this.ContactCellRenderer,
        cellEditorFramework: ContactEditorComponent,
        cellClassRules: {
          'invalid-supplier-input': "!x"
        },
        minWidth: 220,
        width: 220
      },
      {
        headerName:"Email",
        field: "email",
        headerClass:"grid-header",
        minWidth: 155,
        width: 155,
        cellStyle: {'text-align':'right'},
      },
      {
        headerName:"Phone",
        field:"phone",
        headerClass:"grid-header",
        minWidth: 160,
        width: 160,
        cellStyle: {'text-align':'right'},
      },
      {
        headerName:"Supplier Type",
        field:"foucsType",
        headerClass:"grid-header",
        minWidth: 130,
        width: 130
      },
      {
        headerName:"Rating",
        field:"rating",
        headerClass:"grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName:"Remove",
        field: 'remove',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-ban' },
        cellRenderer: function(params){return _self.deleteSupplierCellRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        minWidth: 40,
        width: 40
      }
    ];
    this.rfqGenerateSupplierGrid.columnDefs = columnDefs;
    this.supplierRowDataSet = [];
    if (this.rfqGenerateSupplierGrid.api){
      this.rfqGenerateSupplierGrid.api.setColumnDefs(columnDefs);
      this.rfqGenerateSupplierGrid.api.setRowData(this.supplierRowDataSet);
    } 
  }

	ngOnInit() {
		this.populateDropdownData();
	}
	
	populateDropdownData(){
    this.sourcingService.getAddSourceData().subscribe(
      data => {
        this.commodities = data[2];
        // this.packagingTypes = data[3];
				this.currencies = data[4];
        this.generatePartGrid();
        this.generateSupplierGrid();
    });
	}
	
	populateGrid(){
    let _self = this;
    let rowData = [];
    for(let i=0; i< _self.rfqLines.length; i++){
      let row = this.createRow(_self.rfqLines[i], _self);
      rowData.push(row);
    }
    this.rowDataSet = _.concat([], rowData);
    this.rfqGeneratePartGrid.api.setRowData(rowData);
    setTimeout(() => {
      this.rfqGeneratePartGrid.api.sizeColumnsToFit();
    }, 500);
    
    this.supplierRowDataSet = [];
    this.rfqGenerateSupplierGrid.api.setRowData(this.supplierRowDataSet);
	}
	
	createRow(rfqLine: RfqLine, _self){
		let commodity = _self.commodities.find(x => x.id == rfqLine.commodityId);
    var retValue = {
      partNumber:rfqLine.partNumber,
      manufacturer:rfqLine.manufacturer,
      qty:rfqLine.qty,
      dateCode:rfqLine.dateCode,
      commodity:commodity,
      note: "",
      itemId:rfqLine.itemId,
      isIhs: rfqLine.isIhs
    }
    return retValue;
	}
	
  onAddRow(newRfqLine: RfqLine) {
    this.rfqGeneratePartGrid.api.paginationGoToLastPage();
    var newItem = this.createRow(newRfqLine, this);
    
    this.rowDataSet = _.concat(this.rowDataSet, [newItem]);
    this.rfqGeneratePartGrid.api.setRowData(this.rowDataSet);
  }

  onSendRfq(){
    const validSuppliers = _.filter(this.supplierRowDataSet, (supplier) => {
      return supplier.supplierId && supplier.contact
    });
    const validParts = _.filter(this.rowDataSet, (rfqLine) => {
      return rfqLine.partNumber && rfqLine.commodity && rfqLine.manufacturer && rfqLine.qty
    });
    if (!this.rowDataSet || (validParts.length !== this.rowDataSet.length) || this.rowDataSet.length < 1 ){
      if (this.rowDataSet.length < 1){
        this.errorMesgMPN = 'Please select at least one part.';
        return;
      }
      this.errorMesgMPN = 'Please complete all required part fields.';
      if (validSuppliers.length < 1){
        this.errorMesgSupplier = 'Please add at least one valid supplier.';
      }
      return;
    }
    if (validSuppliers.length < 1){
      this.errorMesgSupplier = 'Please add at least one valid supplier.';
      return;
    }
    this.rfqService.sendRfqToSuppliers(validSuppliers, validParts, this.comment)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
      if (data){
        jQuery('#rfqGenerateModal').modal('toggle');
        this._notificationService.success(
          'Done',
          'RFQ(s) have been sent to the selected suppliers!'
        );
        this.errorMesgMPN = '';
        this.errorMesgSupplier = '';
      }
    });
  }
  
  onDeleteClicked(self, rowData){
    let indexToDelete = _.indexOf(self.rowDataSet, rowData.data);
    self.rowDataSet.splice(indexToDelete, 1);
    self.rfqGeneratePartGrid.api.setRowData(self.rowDataSet);
  }

	SelectCellRenderer(params) {
		if(typeof params.value !== 'undefined')
			return params.value.name;
	}
	PartNumberCellRenderer(params){
    const _self = this;
    if(!params.data.itemId){
      return params.data.partNumber;
    }else{
		let anchor = document.createElement('a');
    anchor.text = params.value;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", function(){
      jQuery('#rfqGenerateModal').modal('toggle');
      _self.router.navigate(['pages/items/items/item-details', { itemId : params.data.itemId }])
    });
    return anchor;
  }
	}
	numericCellRenderer(params){
		return parseInt(params.value).toLocaleString();
	}

	deleteCellRenderer(rowData, _self){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fas fa-ban';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this rfq part?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel'
			}).then(function() {
				_self.onDeleteClicked(_self, rowData);
			}, function(){
				
			});
		})
		div.appendChild(anchor);
		return div;
  }

  deleteSupplierCellRenderer(rowData, _self){
    let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fas fa-ban';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this supplier?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel'
			}).then(function() {
				_self.onDeleteSupplierClicked(_self, rowData);
			}, function(){
				
			});
		})
		div.appendChild(anchor);
		return div;
  }

  onDeleteSupplierClicked(self, rowData){
    let indexToDelete = _.indexOf(self.supplierRowDataSet, rowData.data);
    self.supplierRowDataSet.splice(indexToDelete, 1);
    self.rfqGenerateSupplierGrid.api.setRowData(self.supplierRowDataSet);
  }

  onAccountSelected($event){
    if($event != null){
      let selectedItem = $event.originalObject;
      let newRfqLine = new RfqLine();
      newRfqLine.partNumber = selectedItem.name;
      newRfqLine.manufacturer = selectedItem.mfr;
      newRfqLine.qty = 0;
      newRfqLine.itemId = selectedItem.id;
      newRfqLine.isIhs = selectedItem.isIHS;
      let com = _.find(this.commodities, c => c.name == selectedItem.com);
      if (com){
        newRfqLine.commodityId = com.id;
      }
      this.onAddRow(newRfqLine);
      this.errorMesgMPN = '';
      this.selectedValue = undefined;
    }
  }

  onSuppliertSelected($event){
    if($event != null){
      let existingSupplierIds = _.map(this.supplierRowDataSet, supplier => +supplier.supplierId);
      if (!_.includes(existingSupplierIds, +$event.originalObject.accountId)){
        this.getAccountContacts($event.originalObject)
      } else {
        this.selectedSupplier = '';
        this._notificationService.alert("Warning", "The supplier already exists in the grid.")
      }
    }
  }

  getAccountContacts(selectedSupplier) {
    this.quoteService.getContactsByAccountId(selectedSupplier.accountId)
      .takeUntil(this.ngUnsubscribe.asObservable())  
      .subscribe(data => {
        this.contacts = data;
        let rfqDetail = new RfqDetails();
        rfqDetail.supplierId = +selectedSupplier.accountId;
        rfqDetail.supplierName = selectedSupplier.accountName;
        rfqDetail.statusId = 43;
        if (selectedSupplier.contactId){
          rfqDetail.contact = new Contacts();
          rfqDetail.contact.contactId = +selectedSupplier.contactId;
          rfqDetail.contact.firstName = selectedSupplier.firstName;
          rfqDetail.contact.lastName = selectedSupplier.lastName;
          rfqDetail.contact.email = selectedSupplier.email;
          rfqDetail.email = selectedSupplier.email;
          rfqDetail.phone = selectedSupplier.phone;
        }
        this.supplierRowDataSet = _.concat([], this.supplierRowDataSet, [rfqDetail]);
        this.rfqGenerateSupplierGrid.api.setRowData(this.supplierRowDataSet);
        this.errorMesgSupplier = '';
        this.selectedSupplier = undefined;
		});
  }

  dropDownFixPosition(){
    jQuery('#add-mpn-wrapper').find('.completer-dropdown').css('position', 'fixed');
    jQuery('#add-mpn-wrapper').find('.completer-dropdown').css('top', "130px");
    jQuery('#add-mpn-wrapper').find('.completer-dropdown').css('left', "640px");
    jQuery('#add-mpn-wrapper').find('.completer-dropdown').css('width', "250px");
  }

  ngDoCheck(){
    this.dropDownFixPosition();
    this.supplierDropDownFixPosition();
    this.inputComService.enableInput(true);
  }

  onDropdownOpened(){
    this.dropDownFixPosition();
  }

  onDropdownSupplierOpened(){
    this.supplierDropDownFixPosition();
  }

  supplierDropDownFixPosition(){
    jQuery('#add-supplier-wrapper').find('.completer-dropdown').css('position', 'fixed');
    let topDistance = 520;
    if (this.errorMesgMPN){
      topDistance += 40;
    }
    jQuery('#add-supplier-wrapper').find('.completer-dropdown').css('top', topDistance + "px");
    jQuery('#add-supplier-wrapper').find('.completer-dropdown').css('left', "340px");
    jQuery('#add-supplier-wrapper').find('.completer-dropdown').css('width', "250px");
  }

  ContactCellRenderer(params) {
    if(typeof params.value !== 'undefined'){
      return params.value.firstName + ' ' + params.value.lastName;
    } else{
      return ''
    }
  }

  matchSpecialty(){
    let commodities = new Array<number>();
    let mfrs = new Array<any>();
    _.forEach(this.rowDataSet, rfqLine => {
      if (rfqLine.commodity && rfqLine.commodity.id){
        commodities.push(rfqLine.commodity.id);
      }
      if (rfqLine.manufacturer){
        mfrs.push({
          mfrName: rfqLine.manufacturer
        });
      }
    });
    this.sharedService.suppliersSpecialtyMatch(commodities, mfrs)
      .takeUntil(this.ngUnsubscribe.asObservable())  
      .subscribe(data => {
      let uniqSupplier = _.uniqWith(data.accounts, _.isEqual);
      let haveDupSupplier = false;
      let existingSupplierIds = _.map(this.supplierRowDataSet, supplier => supplier.supplierId);
      _.forEach(uniqSupplier, supplier => {
        if (!_.includes(existingSupplierIds, +supplier.accountId)){
          this.getAccountContacts(supplier);
        } else {
          haveDupSupplier = true;
        }
      });
      if (haveDupSupplier){
        this._notificationService.alert("Warning", "One or more suppliers have already been added.")
      }
    });

  }
  onCancelGenerateRfq(){
    this.errorMesgMPN = '';
    this.errorMesgSupplier = '';
  }

  addAccountGroup(accountGroupId){
    if (!accountGroupId || accountGroupId < 1){
      return;
    }
    this.sharedService.suppliersAccountGroupMatch(accountGroupId)
      .takeUntil(this.ngUnsubscribe.asObservable())  
      .subscribe(accountGroupDetail => {
      if (accountGroupDetail && accountGroupDetail.accountGroupId > 0) {
        let supplierList = new Array<any>();
        let haveDupSupplier = false;
        let existingSupplierIds = _.map(this.supplierRowDataSet, supplier => supplier.supplierId);
        _.forEach(accountGroupDetail.groupLines, accountLine => {
          let supplier = {
            accountId: accountLine.accountId,
            accountName: accountLine.accountName,
            contactId: accountLine.contactId ? accountLine.contactId: null,
            // contact: {
            //   contactId: accountLine.contactId ? accountLine.contactId: null,
            firstName: accountLine.contactId ? accountLine.firstName: '',
            lastName: accountLine.contactId ? accountLine.lastName: '',
            phone: accountLine.contactId ? accountLine.phone: '',
            email: accountLine.contactId ? accountLine.email: '',
            // }
          };
          if (!_.includes(existingSupplierIds, supplier.accountId)){
            this.getAccountContacts(supplier);
          } else {
            haveDupSupplier = true;
          }
        });
        if (haveDupSupplier){
          this._notificationService.alert("Warning", "One or more suppliers have already been added.")
        }
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
   }
  
}
