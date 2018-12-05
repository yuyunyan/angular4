import { Component, ViewEncapsulation } from '@angular/core';
import { ObjectTypeService } from './../../../_services/object-type.service';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { RequestToPurchaseService } from './../../../_services/request-to-purchase.service';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Component({
  selector: 'az-add-to-cart-master',
  templateUrl: './add-to-cart-master.component.html',
  styleUrls: ['./add-to-cart-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService , ObjectTypeService]
})

export class AddToCartMasterComponent {
    private accountId: number = 0;
    private accountName: string = '';
    private warehouseTo: number = 0;
    private vendorList = [];
    private contactId: number = 0;
    private paymentTermId: number = 0;
    private incoTermId: number = 0;
    private buyerName: string = "";
    private buyerId: number = 0;
    private vendorId : number;
    private vendorName : string;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private requestToPurchaseService: RequestToPurchaseService){
        const _self=this;
        this.requestToPurchaseService.GetRTPList()
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(rtpList => {        
          _self.vendorList = _self.groupBySelectedVendor(rtpList);
          if(_self.vendorList && _self.vendorList.length > 0){
          }
        });
    }

    groupBySelectedVendor(sources){
        let sourceArray = sources;
        let newSourceArray = sourceArray.filter(vendor => vendor.selectedSource.length > 0)
        let sourceList = _.flatten(_.map(newSourceArray, (item) => {return item.selectedSource;}));
        let result = []
        if(sourceList.length > 0){
        let groups = _.groupBy(sourceList, (group) => { 
            return group.vendorId; });
        result = (<any>Object).values(groups);
        }
        return result;
    }   
}