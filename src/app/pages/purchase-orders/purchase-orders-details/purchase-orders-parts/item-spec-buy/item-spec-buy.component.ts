import { Component, OnInit , Input , SimpleChanges , Output , EventEmitter } from '@angular/core';
import { Observable , Subject } from 'rxjs';
import { List } from 'linqts';
import { UserDetail } from './../../../../../_models/userdetail';
import { PurchaseOrderPart } from './../../../../../_models/purchase-orders/purchaseOrderPart';
import { PurchaseOrdersService } from './../../../../../_services/purchase-orders.service';
import { SalesOrdersService } from './../../../../../_services/sales-orders.service';
import { UsersService } from './../../../../../_services/users.service';
import { AccountsContactsService } from './../../../../../_services/accountsContacts.service';
import { SharedService } from './../../../../../_services/shared.service';
import { NotificationsService } from 'angular2-notifications';
import { AccountDetailsByType } from '../../../../../_models/common/accountsByType';

@Component({
  selector: 'az-item-spec-buy',
  templateUrl: './item-spec-buy.component.html',
  styleUrls: ['./item-spec-buy.component.scss'],
  providers: [AccountsContactsService, UsersService , SalesOrdersService]
})
export class ItemSpecBuyComponent implements OnInit {

  private accountsList: Array<AccountDetailsByType>;
  private usersList: Observable<UserDetail[]>;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private userId : number;
  private accountId : number;
  private specBuyReason : string;


  @Input() poId : number ;
  @Input() poVersionId : number ;
  @Input() poLineId: number;
  @Input() itemId : number ;
  @Input() partNumber: string;
  @Input() specBuyData : Object;
  @Input() poPartForUpdate : Object;
  @Output() onPOLineChange = new EventEmitter();

  constructor(private usersService: UsersService,
    private acService: AccountsContactsService,
    private purchaseOrdersService: PurchaseOrdersService,
    private notificationsService: NotificationsService,
    private sharedService : SharedService, private salesService :SalesOrdersService ) { 
  }

  ngOnInit() {
    var _self = this;
    var usersTemp = this.usersService.getAllUsers();
    this.usersList = usersTemp;
    
    //Get first value of usersList for default value
    usersTemp.subscribe(data =>{
      _self.userId = data[0].UserID;
    });
    
    this.salesService.getSalesOrderObjectTypeId().subscribe(dataSoId => {
        this.sharedService.getAccountsByObjectType(dataSoId)
        .subscribe(data =>{
          this.accountsList =  data;
          //Get first value of accountList for default value
          this.accountId = this.accountsList[0].accountId;
      });
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    let poIdProp = changes['poId'];
    let poVersionIdProp = changes['poVersionId'];
    let poLineIdProp = changes['poLineId'];
    let specBuyDataProp = changes['specBuyData'];
    let poPartForUpdate = changes['poPartForUpdate'];
    let partNumberProp = changes['partNumber'];
    if(specBuyDataProp && specBuyDataProp.currentValue != {} && specBuyDataProp.currentValue["userId"] > 0){
         this.userId = specBuyDataProp.currentValue["userId"];
      if(this.userId > 0){
          this.accountId = specBuyDataProp.currentValue["accountId"];
        }
      this.specBuyReason = specBuyDataProp.currentValue["specReason"];
    }
    let poPartForUpdateProp = changes["poPartForUpdate"];
    if(poPartForUpdateProp && poPartForUpdateProp.currentValue != {}){
     this.poPartForUpdate = poPartForUpdateProp.currentValue ;
    }
    if(partNumberProp && partNumberProp.currentValue != {}){
      this.partNumber = partNumberProp.currentValue;
    }
  }

  userSelectionChanged(selectedUserID){
    this.userId = selectedUserID ;    
  }

  accountSelectionChanged(selectedAccountID){
    this.accountId = selectedAccountID ;
  }

 

  saveSpecBuy(){
    let poPart:PurchaseOrderPart;
    const regex = /[^0-9]/g;
    poPart = {
      poLineId:this.poLineId,
      vendorLine:this.poPartForUpdate["vendorLine"],
      statusId: this.poPartForUpdate["statusId"],
      quantity:parseInt(String(this.poPartForUpdate["quantity"]).replace(regex, '')),
      cost:this.poPartForUpdate["cost"] ,
      dateCode:this.poPartForUpdate["dateCode"],
      packagingId: this.poPartForUpdate["packagingId"],              
      dueDate:this.poPartForUpdate["dueDate"],
      promisedDate:this.poPartForUpdate["promisedDate"],
      itemId: this.itemId,
      isSpecBuy : true,
      specBuyForUserId : this.userId,
      specBuyForAccountId : this.accountId,
      specBuyReason: this.specBuyReason,
      partNumber: ''
    };
    this.purchaseOrdersService.setPurchaseOrderPart(poPart ,this.poLineId, this.poId, this.poVersionId, false).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe( data => {
      this.notificationsService.success('Spec Buy details saved.');
      this.onPOLineChange.emit(poPart);
     });
  }
}
