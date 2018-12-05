import { Component, OnInit, Input, OnChanges, SimpleChange, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';


@Component({
  selector: 'az-sales-orders-line-info',
  templateUrl: './sales-orders-line-info.component.html',
  styleUrls: ['./sales-orders-line-info.component.scss']
})

export class SalesOrderLineInfoComponent{
    @Input() deliveryStatus: string;
    @Input() invoiceStatus: string;
    @Input() infoSoLineId: number;
    @Input() itemPartNumber: string;
    private soLineId : number;
    private partNumber : string;
    private soDeliverystatus: string;
    private soInvoiceStatus: string;

	constructor() {
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }){
           if(changes['infoSoLineId']){
            this.soLineId = changes['infoSoLineId'].currentValue;
           }
            if(this.soLineId){
                if(changes['itemPartNumber']){
                    this.partNumber = changes['itemPartNumber'].currentValue;
                }
                if(changes['deliveryStatus']){
                    this.soDeliverystatus = changes['deliveryStatus'].currentValue;
                }
                if(changes['invoiceStatus']){
                    this.soInvoiceStatus = changes['invoiceStatus'].currentValue;
                }
        }
    }
}

