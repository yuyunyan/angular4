import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'az-accounts-contacts-supplier',
  templateUrl: './accounts-contacts-supplier.component.html',
  styleUrls: ['./accounts-contacts-supplier.component.scss']
})
export class AccountsContactsSupplierComponent implements OnInit {
 public accountTypeId : number ;
  constructor() { 
    this.accountTypeId = 1;
  }

  ngOnInit() {
  }

}
