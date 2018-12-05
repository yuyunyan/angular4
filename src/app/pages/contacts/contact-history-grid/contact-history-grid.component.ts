import { Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {GridOptions} from 'ag-grid';
import { ContactsService } from './../../../_services/contacts.service';
import { PurchaseOrdersService} from '../../../_services/purchase-orders.service';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';
import * as _ from 'lodash';


@Component({
  selector: 'az-contact-history-grid',
  templateUrl: './contact-history-grid.component.html',
  styleUrls: ['./contact-history-grid.component.scss']
})
export class ContactHistoryGridComponent implements OnInit {
  @Input() accountId: number;
  @Input() contactId: number;
  @Input() isSupplier:boolean;
  @Input() isCustomer:boolean;
  private accountTypeSum:number;
  private isAccount:boolean;
  private isVendor:boolean;
  private rowDataSet = [];

  constructor(private contactsService: ContactsService,
    private purchaseOrdersService:PurchaseOrdersService,
    private gpUtilities: GPUtilities) { 
   
  }

  ngOnInit() {
   this.displayTabOnAccounTypes();
  }

 ngOnChanges(changes: SimpleChanges){
  if(this.accountId || this.contactId || this.isCustomer || this.isSupplier){
    this.displayTabOnAccounTypes();
  }
  console.log('history customer',this.isCustomer);
  console.log("history supplier ",this.isSupplier);
 }

 displayTabOnAccounTypes(){
  this.contactsService.getAccountTypesData(this.accountId).subscribe(data=>{
    // Get account types 
     let accountTypesIds= data.map(x=>x.accountTypeId);
     const add = (a, b) => a + b
     this.accountTypeSum= accountTypesIds.reduce(add);

     if(this.accountTypeSum==5 || (this.isCustomer==true && this.isSupplier==true)){
        this.isAccount= true;
        this.isVendor = true;
        jQuery("#nav-quotes-tab-1").addClass('active');
        jQuery("#nav-quotes").addClass('active');
        jQuery("#nav-quotes-tab-1").trigger("select");
     }else if(this.accountTypeSum==1 || this.isSupplier==true){
       this.isVendor= true;
       this.isAccount = false;
       jQuery("#nav-sources-tab-3").addClass('active');
       jQuery("#nav-sources").addClass('active');
       jQuery("#nav-sources-tab-3").trigger("select");
     }else if(this.accountTypeSum==4 || this.isCustomer==true){
       this.isAccount= true;
       this.isVendor= false;
       jQuery("#nav-quotes-tab-1").addClass('active');
       jQuery("#nav-quotes").addClass('active');
       jQuery("#nav-quotes-tab-1").trigger("select");
     }
     
  })
 }


  

}
