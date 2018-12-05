import { Component, ViewEncapsulation, Input, OnChanges, SimpleChanges,ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { ItemsService} from './../../../_services/items.service';
import { ItemDetails } from './../../../_models/Items/itemdetails';
import { Manufacturer} from './../../../_models/Items/manufacturer';
import { NewManufacturer} from './../../../_models/Items/newmanufacturer';
import { ItemStatus} from './../../../_models/Items/itemstatus';
import { ItemCommodity } from './../../../_models/Items/itemCommodity';
import { NgForm} from '@angular/forms';
import { Location as RouterLocation } from '@angular/common';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import {Loading} from './../../_sharedComponent/loading/loading';
import { default as swal } from 'sweetalert2';
import _ from 'lodash';
import {SapSyncNotifier} from './../../../_utilities/sap-sync/sap-sync-notifier';
import { RemoteData, CompleterService, CompleterCmp } from "ng2-completer";
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import { environment } from './../../../../environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';


@Component({
  selector: 'az-items-detail',
  templateUrl: './items-detail.component.html',
  styleUrls: ['./items-detail.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ItemsDetailComponent implements OnChanges,OnInit{
  @Input() itemId;
  @Input() itemPermissions;
  private showSync: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private loading: Loading;
  private busyConfig: any;
  private selectedName: any;
  private newMfrId : number;
  private selected : boolean;
  private selectedValue:any;
  private details: ItemDetails;
  private newMfr: NewManufacturer;
  private mfrs: Manufacturer[];
  private commodityList: ItemCommodity[];
  private statusList: ItemStatus[];
  private sapSyncNotifier:SapSyncNotifier;
  private dataRemote: RemoteData;
  private formSubmitted:boolean;

  @ViewChild('soItemForm') soFormRef: NgForm;
  @ViewChild('newMfrForm') soMfrRef: NgForm; 
	@ViewChild("mfrCompleter") private mfrCompleter: CompleterCmp;

  public notifyOptions = {
    position: ['top', 'right'],
    timeOut: 3000,
    lastOnBottom: true
  };
  private onReadonly:boolean = true;
  private _params;
  private itemObjectTypeId: number = 103;
  private itemSelectedBool: boolean = false;
  private generalPermission = 'generalPermission';
  public canCreateManufacturer : boolean = false;
  private mfrNameValid : boolean = false;
  private webNameValid :boolean = false;
 



  constructor(
    private completerService: CompleterService,
    private itemsService: ItemsService,
    private activatedRoute: ActivatedRoute,
    private routeLocation: RouterLocation,
    private router: Router,
    private _notificationsService: NotificationsService,
    private ngxPermissionsService: NgxPermissionsService,
   ) {
    let requestOptions = new MyRequestOptions();
		this.dataRemote = completerService.remote(
			null,
			"mfrName",
			"mfrName"
    );
    this.dataRemote.requestOptions(requestOptions);
		this.dataRemote.urlFormater(term => {
      return environment.apiEndPoint + '/api/items/getManufacturersList?SearchText=' + encodeURIComponent(term); 
		});
		this.dataRemote.dataField("manufacturers");
    
    //Initialize values
    this.mfrs = new Array<Manufacturer>();
    this.commodityList = new Array<ItemCommodity>();
    this.statusList = new Array<ItemStatus>();
    this.details = new ItemDetails();
    this.newMfr = new NewManufacturer();
    this.details.ManufacturerID = 0;
    this.details.StatusID;
    this.details.GroupID = 0;
    this.details.CommodityID = 0;
    this.loading = new Loading(true);
    this.busyConfig = this.loading.busyConfig;
    this.sapSyncNotifier = new SapSyncNotifier(_notificationsService);

    this.itemsService.GetManufacturers().subscribe(data => {
      this.mfrs = data.manufacturers;
    });
    
    this.itemsService.GetCommodities().subscribe(data => {
      this.commodityList = data.results;
    });
    this.itemsService.GetItemStatusList().subscribe(data => {
      this.statusList = data.results;
    });
  }

ngOnInit(){
  if (this.itemId) {
    this.itemsService.GetItemDetails(this.itemId).subscribe(data => {
      this.details = data.results;
      this.selectedValue = this.details.ManufacturerID;
      this.selectedName = this.details.ManufacturerName;
    });
  }
  this.enableOrDisableMfrCreateButton();

}


  ngOnChanges(changes: SimpleChanges) {
    let itemIdProp = changes['itemId'];
    
    if(itemIdProp && itemIdProp.currentValue){
      this.itemId = itemIdProp.currentValue;
      this.RetrieveItemDetails();
      setTimeout(() => {
        jQuery(".Mfr-Typeheader").attr('data-field-name', 'Manufacturer');
      }, 1000);
      this.showSync = true;
    } else if(itemIdProp && !itemIdProp.currentValue){
      this.onReadonly = false;
      setTimeout(() => {
        jQuery(".Mfr-Typeheader").attr('data-field-name', 'Manufacturer');
      }, 1000);
    }
  }

  RetrieveItemDetails(){
    if(this.newMfr.MfrName = undefined){
      this.details.ManufacturerName = this.newMfr.MfrName;
      this.details.ManufacturerID = this.newMfrId;
    }else{
      this.itemsService.GetItemDetails(this.itemId).subscribe(data => {
        this.details = data.results;
        this.selectedValue = this.details.ManufacturerID;
      });
    }
  }

  onDropdownOpened(){
    this.dropDownFixPosition(jQuery('#supplierGrid').find('.completer-dropdown-holder'), jQuery('#supplierGrid').find('.completer-dropdown'));
  }
  
  dropDownFixPosition(button,dropdown){
		dropdown.css('overflow-y', 'scroll');
		dropdown.css('max-height', "200px");
		button.css('margin-top', "5px");
  }

  onItemDetailSave(){
    if(this.newMfrId > 0){
      this.details.ManufacturerName = this.newMfr.MfrName;
      this.details.ManufacturerID = this.newMfrId;
    }else{
      this.details.ManufacturerName = this.selectedName;
      this.details.ManufacturerID = this.selectedValue;
    }
    this.runValidationAndSaveItem()
  }

  runValidationAndSaveItem(){

    this.formSubmitted = true;
    if(!this.soFormRef.valid)
   {

      this._notificationsService.error(
        'Missing Field in Item Details!',
        'Please fill out the form',
        {
          timeOut: 3000,
          pauseOnHover: false,
          clickToClose: false
        }
      )
      this.onReadonly = false;
      return;
    }
    this.itemsService.SaveItemDetails(this.details).subscribe(data => {
      var itemRes = data.json().itemId;
      if(!this.itemId){
        this.router.navigate(['pages/items/items/item-details',{itemId: itemRes}]);
      }
      this._notificationsService.success(
        'Saved!',
        'Item saved!',
        {
          pauseOnHover: false,
          clickToClose: false
        }
      );
    });
  }

  onDeleteClick(){
      swal({
        title: 'Are you sure?',
        text: "Are you sure you want to delete this contact?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      })
  }



  onOwnershipClick(event){
    jQuery('#ownershipModal').modal('toggle');
  }

  AddManufacturer(){
		this.soMfrRef.reset();
    jQuery('#hu').hide();
    jQuery('#MfrModal').modal('toggle');
  }

  mfrTypeFunction(){
    this.mfrNameValid = false;
  }

  webTypeFunction(){
    this.webNameValid = false;
  }

  CreateManufacturer(){
    const body = this.newMfr;
      this.itemsService.CreateManufacturer(this.newMfr).subscribe(data => {
        var resp = data.json();
        if(resp > 0){
          this.selectedName = body.MfrName;
          this.details.ManufacturerID = resp;
          this.newMfrId = this.details.ManufacturerID;
          this.mfrNameValid = false;
          this.webNameValid = false;

        this._notificationsService.success(
          'Manufacturer successfully created.',
          '',
          {
            pauseOnHover: false,
            clickToClose: false
          }
        );
        jQuery('#MfrModal').modal('toggle');
      }else{
        jQuery('#hu').show();
        this.details.ManufacturerName = this.newMfr.MfrName;
      }
    })
  }

  ClearFields(){
    jQuery('#hu').hide();
  }

  CloseNoteModal(){
    jQuery('#MfrExist').hide();
    this.selectedValue = this.details.ManufacturerID;
    this.selectedName = this.details.ManufacturerName;
  }

  handleCancel(){
    if(this.newMfr.MfrName){
      this.details.ManufacturerName = this.newMfr.MfrName;
    }else{
    const _self = this;
    _self.soFormRef.reset();
    }
  }


  onFormStatusChange(event: string) {
    if (event == 'edit') {
      this.selectedValue = this.details.ManufacturerID;
      this.selectedName = this.details.ManufacturerName;
      this.onReadonly = false;
    } else if (event == 'cancel' && this.itemId) {
      this.onReadonly = true;
      this.RetrieveItemDetails();
    } else if(event== 'cancel' && !this.itemId){
      this.onReadonly = false;
      this.handleCancel();
    } else if (event == 'save') {
      this.onReadonly = true;
      this.onItemDetailSave();
    } else if (event == 'sync') {
      this.onReadonly = true;
      this.syncItem();
    }
  }
  
  syncItem(){
    this.busyConfig.busy = this.itemsService.syncItem(this.itemId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        this.sapSyncNotifier.showNotification(data);
      }
    );
  }

  enableOrDisableMfrCreateButton() {
    var array = JSON.parse(localStorage.getItem(this.generalPermission))
    if(array.includes("CanCreate103")){
        this.canCreateManufacturer= true;
    }
  }

  onMfrtSelected(value){
		if (value){
			this.selectedName = value.originalObject.mfrName;
			this.selectedValue = value.originalObject.mfrId
    }
  }

}
