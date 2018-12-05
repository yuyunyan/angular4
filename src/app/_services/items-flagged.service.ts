import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { QuoteService } from './quotes.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { ContactsService } from './contacts.service';
import { QuotePart } from './../_models/quotes/quotePart';
import { ItemsFlagged} from './../_models/bom/itemsFlagged';
import { AccountDetails } from './../_models/contactsAccount/accountDetails';
import { ContactDetails } from './../_models/contactsAccount/contactDetails';

@Injectable()
export class ItemsFlaggedService {

  constructor(private httpService: HttpService, private quotesService: QuoteService, private purchaseOrdersService: PurchaseOrdersService, 
    private contactsService: ContactsService) {

  }

  newQuoteExistingCustomerSet(accountId: number, contactId: number, comment: string, itemsFlagged: ItemsFlagged[]){
    let url = 'api/quote/newQuoteExistingCustomerSet';

    let quoteParts = []
    itemsFlagged.forEach(itemFlagged => {
      let quotePart = this.mappingPart(itemFlagged);
      quoteParts.push(quotePart);
    });

    let payload = {accountId, contactId, comment, quoteParts};
    return this.httpService.Post(url, payload).map(data => data.json());
  }

  newQuoteNewCustomerSet(accountDetails: (AccountDetails | {}), organizationId: number, 
    contactDetails: (ContactDetails | {}), comment: string, itemsFlagged: ItemsFlagged[]){
    let url = 'api/quote/newQuoteNewCustomerSet';

    let quoteParts = [];
    itemsFlagged.forEach(itemFlagged => {
      let quotePart = this.mappingPart(itemFlagged);
      quoteParts.push(quotePart);
    });

    let payload = { organizationId, accountDetails, contactDetails, comment, quoteParts };
    return this.httpService.Post(url, payload).map(data => data.json());
  }

  newPurchaseOrderSet(purchaseOrderDetails, comment, itemsFlagged: ItemsFlagged[]) {
    let url = 'api/purchase-order/newPurchaseOrderFromFlaggedSet';

    let purchaseOrderLines = [];

    itemsFlagged.forEach(itemFlagged => {
      let poLine = {
        itemId: itemFlagged.itemId,
        qty: itemFlagged.qty,
        cost: itemFlagged.cost,
        price: itemFlagged.price
      };
      purchaseOrderLines.push(poLine);
    });

    let payload = {purchaseOrderDetails, comment, purchaseOrderLines};

    console.log(payload);
    return this.httpService.Post(url, payload).map(data => data.json());
  }

  newRfqSet(rfqDetails, comment, itemsFlagged: ItemsFlagged[]) {
    let url = 'api/rfqs/newRfqFromFlaggedSet';

    let rfqLines = [];

    itemsFlagged.forEach(itemFlagged => {
      let rfqLine = {
        partNumber: itemFlagged.partNumber,
        manufacturer: itemFlagged.manufacturer,
        qty: itemFlagged.qty,
        targetCost: itemFlagged.cost,
        commodityId: 1
      };
      rfqLines.push(rfqLine);
    });

    let payload = {rfqDetails, comment, rfqLines};

    return this.httpService.Post(url, payload).map(data => data.json());
  }

  mappingPart(itemFlagged){
    let part = {
      PartNumber: itemFlagged.partNumber,
      Qty: itemFlagged.qty,
      StatusID: 8,
      Cost: itemFlagged.cost,
      Price: itemFlagged.price,
      Manufacturer: itemFlagged.manufacturer,
      CommodityID: 1
    }
    return part;
  }
}
