import { Component, ElementRef, ViewChild, SimpleChange, EventEmitter} from '@angular/core';
import { OrderFulfillmentService } from '../../../../../_services/order-fulfillment.service';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-po-allocation-window',
  templateUrl: './po-allocation-window.component.html'
})

export class POAllocationWindowComponent{
  private errorMessage: string = '';
  private warningMessage: string = '';
  private invalidAllocation: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private PURCHASE_ORDER: string = 'Purchase Order';
  private poId: number;
  private poVersionId: number;
  private soId: number;
  private soVersionId: number;
  private partNumber: string;
  private poLineQty: number;
  private poLineId: number;
  private soLineId: number;
  private poLineNum: number;
  private soLineNum: number;
  private neededQty: number;
  private allocateQty: number = 0;

  @ViewChild('sourceCloseBtn') closeBtn: ElementRef;

  constructor(
    private orderFulfillmentService: OrderFulfillmentService,
    private notificationsService: NotificationsService){
    
    const _self = this;
    this.orderFulfillmentService.POAllocationStatusGet()
    .takeUntil(_self.ngUnsubscribe.asObservable())
    .subscribe(data => {
      _self.poId = data['poId'];
      _self.poVersionId = data['poVersionId'];
      _self.soId = data['soId'];
      _self.soVersionId = data['soVersionId'];
      _self.poLineNum = data['poLineNum'];
      _self.soLineNum = data['soLineNum'];
      _self.partNumber = data['partNumber'];
      _self.poLineQty = data['poLineQty'];
      _self.neededQty = data['neededQty'];
      _self.poLineId = data['poLineId'];
      _self.soLineId = data['soLineId'];
      _self.allocateQty = Math.min(_self.poLineQty, _self.neededQty);
      jQuery('#poAllocationWindow').modal('toggle');
    });
	}

  onSave(){
    const _self = this;
    if(this.invalidAllocation){
      return;
    }
    _self.orderFulfillmentService
      .setReservation(_self.PURCHASE_ORDER, _self.poLineId, _self.soLineId, _self.allocateQty, false)
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        _self.notificationsService.success('Allocation successful.');
        _self.orderFulfillmentService.onAllocationSet(_self.poLineId);
        jQuery('#poAllocationWindow').modal('toggle');
    });
  }

  onPoNumberClicked(){
    let url = `/pages/purchase-orders/purchase-order-details;purchaseOrderId=${this.poId};soVersionId=${this.poVersionId}`;
    var win = window.open(url, "_blank");
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
    if(this.allocateQty > 0 && this.allocateQty < this.poLineQty ){
      this.warningMessage = 'Partially allocating this PO line will split it in two';
    } else{
      this.warningMessage = '';
    }
    if(Number.isNaN(this.allocateQty) || this.allocateQty < 1){
      this.errorMessage = 'Please enter valid allocate qty.';
      this.warningMessage = '';
      this.invalidAllocation = true;
    } else if(this.allocateQty > this.neededQty || this.allocateQty > this.poLineQty){
      this.errorMessage = 'Allocate Qty can not exceed Qty on PO Line or Qty needed.';
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
