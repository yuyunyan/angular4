import { Injectable } from '@angular/core';
import { HttpService } from './../../_services/httpService';
import { Subject }    from 'rxjs/Subject';
 
@Injectable()
export class SourceService {
 constructor(private httpService: HttpService){}
  // Observable string sources
  private changedSourceStatus = new Subject<string>();
 
  // Observable string streams
  sourcingStatus$ = this.changedSourceStatus.asObservable();
   
  // Service message commands
  sourcingStatusChanged(status: string) {
    this.changedSourceStatus.next(status);
  }

  convertSourceToPurchaseOrder(buyerId: number, accountId: number, contactId: number, warehouseTo: number,
    paymentTermId:number, incotermId: number, /* shipFrom: number,*/ lines){
    let url = 'api/sourcing/SourceToPurchaseOrder';
    let LinesToCopy = [];

    lines.linesToCopy.forEach(part => {
            LinesToCopy.push({
              ItemID: part.itemId,
              SourceID: part.sourceId,
              Quantity: part.quantity,
              PartNumber: part.partNumber,
              Manufacturer: part.manufacturer,
              IsIhs: part.isIhs
            });
    });

    let body = {
        AccountID: accountId,
        ContactID: contactId,
        BuyerID: buyerId,
        ShipTo: warehouseTo,
        // ShipFrom: shipFrom,
        PaymentTermID: paymentTermId,
        IncotermID: incotermId,
        LinesToCopy: LinesToCopy
    };
    return this.httpService.Post(url, body)
        .map(data => {
            console.log('source to purchase order', data.json());
            return  data.json();
        }, error => {
            return error.json();
        })
  }
 
}
