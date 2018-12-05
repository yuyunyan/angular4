import { Component, Input } from "@angular/core";
import { QuoteHeader } from "../../../_models/quotes/quoteHeader";
import { SalesOrderDetails } from "../../../_models/sales-orders/salesOrderDetails_REMOTE_27768";
import { PurchaseOrder } from "../../../_models/purchase-orders/purchaseOrder";

@Component({
    selector: 'az-kpi-details',
    templateUrl: './kpi-details.html',
    styles: ['.card-outline-default{height: inherit}.card{margin-top:5px}']
})
export class KPIDetailsComponent {

    @Input() quote: QuoteHeader;
    @Input() salesOrder: SalesOrderDetails;
    @Input() purchaseOrder: PurchaseOrder;

}