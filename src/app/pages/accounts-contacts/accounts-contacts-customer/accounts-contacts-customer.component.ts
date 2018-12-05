import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'az-accounts-contacts-customer',
  templateUrl: './accounts-contacts-customer.component.html',
  styleUrls: ['./accounts-contacts-customer.component.scss']
})
export class AccountsContactsCustomerComponent implements OnInit {

  public accountTypeId : number;
  constructor() { 
    this.accountTypeId = 4;
  }

  ngOnInit() {
  }

}
