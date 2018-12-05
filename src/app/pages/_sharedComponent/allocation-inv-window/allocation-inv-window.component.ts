import { Component, ElementRef, ViewChild, SimpleChange, EventEmitter, Input} from '@angular/core';
import { OrderFulfillmentService } from '../../../_services/order-fulfillment.service';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { Loading } from './../../_sharedComponent/loading/loading';
import { AvailabilityComponent } from './../availability/availability.component';

@Component({
  selector: 'az-allocation-inv-window',
  templateUrl: './allocation-inv-window.component.html'
})

export class AllocationInvWindowComponent{
  private errorMessage: string = '';
  private warningMessage: string = '';
  private invalidAllocation: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private INVENTORY: string = 'Inventory';
  private soId: number;
  private soVersionId: number;
  private partNumber: string;
  private inventoryQty: number;
  private inventoryId: number;
  private soLineId: number;
  private soLineNum: number;
  private neededQty: number;
  private allocateQty: number = 0;
  private loading: Loading;
  private busyConfig: any;
  @Input() availabilityGridParent;


  @ViewChild('invCloseBtn') closeBtn: ElementRef;

  constructor(
    private availabilityComponent: AvailabilityComponent,
    private orderFulfillmentService: OrderFulfillmentService,
    private notificationsService: NotificationsService){
    const _self = this;

    this.orderFulfillmentService.InvAllocationStatusGet()
    .takeUntil(_self.ngUnsubscribe.asObservable())
    .subscribe(data => {
      _self.soId = data['soId'];
      _self.soVersionId = data['soVersionId'];
      _self.soLineNum = data['soLineNum'];
      _self.partNumber = data['partNumber'];
      _self.inventoryQty = data['inventoryQty'];
      _self.neededQty = data['neededQty'];
      _self.inventoryId = data['inventoryId'];
      _self.soLineId = data['soLineId'];
      _self.allocateQty = Math.min(_self.inventoryQty, _self.neededQty);
      jQuery('#invAllocationWindow').modal('toggle');
    });

    this.loading = new Loading(true);
    this.busyConfig = this.loading.busyConfig;
	}

  onSave(){
    const _self = this;
    if(this.invalidAllocation){
      return;
    }
    _self.busyConfig.busy = _self.orderFulfillmentService
      .setReservation(_self.INVENTORY, _self.inventoryId, _self.soLineId, _self.allocateQty, false)
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        let dataJson = data.json();
        if(dataJson.errorMessage && dataJson.errorMessage.length > 0){
          _self.notificationsService.error(dataJson.errorMessage);
          jQuery('#invAllocationWindow').modal('toggle');
        }
        else{  
          _self.notificationsService.success('Allocation successful.');
          if(_self.availabilityGridParent){
            _self.availabilityGridParent.neededQty = _self.neededQty - _self.allocateQty;
          }
          let newQty = _self.neededQty - _self.allocateQty;
          _self.neededQty = newQty;
          _self.orderFulfillmentService.onAllocationSet(_self.inventoryId);
          jQuery('#invAllocationWindow').modal('toggle');
        }
    });
  }


  onSoNumberClicked(){
    let url = `/pages/sales-orders/sales-order-details;soId=${this.soId};soVersionId=${this.soVersionId}`;
    var win = window.open(url, "_blank");
  }

  validateIntegerInput(evt){
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    var regex = /[0-9]/;
    if(!regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  }

  AllocationQtyCheck(){
    this.invalidAllocation = false;
    if(this.allocateQty > 0 && this.allocateQty < this.inventoryQty ){
      this.warningMessage = 'Partially allocating this inventory line will split it in two';
    } else{
      this.warningMessage = '';
    }
    if(Number.isNaN(this.allocateQty) || this.allocateQty < 1){
      this.errorMessage = 'Please enter valid allocate qty.';
      this.warningMessage = '';
      this.invalidAllocation = true;
    } else if(this.allocateQty > this.neededQty || this.allocateQty > this.inventoryQty){
      this.errorMessage = 'Allocate Qty can not exceed Qty on inventory Line or Qty needed.';
      this.warningMessage = '';
      this.invalidAllocation = true;
    } else{
      this.errorMessage = '';
    }
    return this.errorMessage.length > 0;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
