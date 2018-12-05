import { Component, OnInit, Input, ElementRef, ViewChild, OnChanges, SimpleChange, EventEmitter, Output } from '@angular/core';
import { OrderFulfillmentService } from '../../../../_services/order-fulfillment.service';
import { NotificationsService } from 'angular2-notifications';


@Component({
  selector: 'az-qty-change-modal',
  templateUrl: './qty-change-modal.component.html',
  styleUrls: ['./qty-change-modal.component.scss']
})
export class QtyChangeModalComponent implements OnInit {

  private errorMessage:string;
  @ViewChild('sourceCloseBtn') closeBtn: ElementRef;
 
  @Input() availableToRsrv:number;
  @Input() quantityToSet:number;
  @Input() outOfQty:number;
  @Input() lineOrderQty: number;
  @Input() availLineId:number;
  @Input() availLineType: string;
  @Input() soLineIdToSet:number;
  @Input() orderNo:number;
  @Input() neededQty:number;
  @Input() originalOrderQty:number;

  @Output() qtyChanged= new EventEmitter();
  constructor(private orderFulfillmentService: OrderFulfillmentService,
    private notificationsService: NotificationsService, ) { 
  
  }

  ngOnInit() {}

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    const regex = /[^0-9]/g;
    if(changes["availableToRsrv"])
    {  
      this.availableToRsrv = parseInt(String(changes["availableToRsrv"].currentValue).replace(regex, ''));
    }
    if(changes["quantityToSet"])
    {  
      this.quantityToSet = parseInt(String(changes["quantityToSet"].currentValue).replace(regex, ''));
    }
    if(changes["outOfQty"])
    {  
      this.outOfQty = parseInt(String(changes["outOfQty"].currentValue).replace(regex, ''));
    }
    if(changes["availLineId"])
    {  
      this.availLineId = changes["availLineId"].currentValue;
    }
    if(changes["availLineType"])
    {  
      this.availLineType = changes["availLineType"].currentValue;
    }
    if(changes["soLineIdToSet"])
    {  
      this.soLineIdToSet = changes["soLineIdToSet"].currentValue;
    }
    if(changes["orderNo"])
    {  
      this.orderNo = changes["orderNo"].currentValue;
    }
    if(changes["originalOrderQty"])
    {  
      this.originalOrderQty = parseInt(String(changes["originalOrderQty"].currentValue).replace(regex, ''));
    }
    if(changes["neededQty"])
    {  
      this.neededQty = parseInt(String(changes["neededQty"].currentValue).replace(regex, ''));
    }

    if(changes["lineOrderQty"])
    {  
      this.lineOrderQty = changes["lineOrderQty"].currentValue;
      this.lineOrderQty = parseInt(String(this.lineOrderQty).replace(regex, ''))
    }
  }

  onSave()
  {
    if( this.quantityToSet >= 0){
      if ( this.quantityToSet <= this.neededQty || (this.quantityToSet <= this.lineOrderQty)){
        this.orderFulfillmentService.setReservation(this.availLineType, this.availLineId, this.soLineIdToSet, this.quantityToSet, false)
        .subscribe(
          data => {
            this.closeBtn.nativeElement.click();
            this.qtyChanged.emit(true);
          },
          error => {
            this.errorMessage = 'Oops! Something went wrong. Please report this issue.';
          });
      } 
    }
       
   
  }

}
