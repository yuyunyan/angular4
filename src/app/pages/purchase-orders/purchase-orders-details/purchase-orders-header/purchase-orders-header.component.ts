import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'az-purchase-orders-header',
  templateUrl: './purchase-orders-header.component.html',
  styleUrls: ['./purchase-orders-header.component.scss']
})
export class PurchaseOrdersHeaderComponent implements OnInit {

  private totalCost:number = 0.00;
  private currencyId:string = 'USD';
  @Input() poId:number = 0;
  constructor() { }

  ngOnInit() {
  }

}
