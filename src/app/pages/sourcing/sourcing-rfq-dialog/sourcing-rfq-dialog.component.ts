import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChange, OnChanges, EventEmitter, Output } from '@angular/core';
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { RfqsService } from './../../../_services/rfqs.service';
import { Contacts, ListContact } from './../../../_models/contactsAccount/contacts';
import { Commodity} from './../../../_models/shared/commodity';
import { PackagingType } from './../../../_models/shared/packagingType';
import { Supplier } from './../../../_models/shared/supplier';
import { Currency } from './../../../_models/shared/currency';
import { RfqDetails } from './../../../_models/rfqs/RfqDetails';
import { RfqLine } from './../../../_models/rfqs/RfqLine';
import { NotificationsService } from 'angular2-notifications';
import { AccountByObjectType } from './../../../_models/common/accountByObjectType';
import { SharedService } from './../../../_services/shared.service';

@Component({
  selector: 'az-sourcing-rfq-dialog',
  templateUrl: './sourcing-rfq-dialog.component.html',
  styleUrls: ['./sourcing-rfq-dialog.component.scss']
})
export class SourcingRfqDialogComponent implements OnInit {

  @Input() selectedRows; 
  @Input() rfqLines: RfqLine[];
  @Output() rfqAdded = new EventEmitter();
  private rfqDetails: RfqDetails[];
  private currencies: Currency[];
  private contacts: Contacts[];
  private commodities: Commodity[];
  private packagingTypes: PackagingType[];  
  private accountsByObjectType: AccountByObjectType[];
  private objectTypeIdForSource: number;
  @ViewChild('rfqCloseBtn') closeBtn: ElementRef;

  constructor(private quoteService: QuoteService, private sourcingService: SourcingService, private notificationService: NotificationsService,
     private rfqService: RfqsService,private sharedService:SharedService) { 
    this.rfqLines = new Array<RfqLine>();
    this.rfqDetails = new Array<RfqDetails>();
    let newDetail = new RfqDetails();
    this.rfqDetails.push(newDetail);
    this.accountsByObjectType = new Array<AccountByObjectType>();
  }

  ngOnInit() {
    this.populateDropdownData();
  }

  // ngOnChanges(changes: { [propKey: number]: SimpleChange }) {

  //    console.log('rfq dialog changes...');
  //    console.log(changes);
  //    console.log(this.rfqLines);
    // // if (typeof this.model !== "undefined") 
    // //   if(typeof changes['partNumber'].currentValue === "undefined")
    // //     this.model.partNumber = changes['partNumber'].previousValue;
    // //   else
    // //     this.model.partNumber = changes['partNumber'].currentValue;


    // this.rfqLines = new Array<RfqLine>();
    // if(typeof changes['selectedRows'].currentValue !== "undefined")
    //   for(let i = 0; i < changes['selectedRows'].currentValue.length; i++){
    //     console.log(changes['selectedRows'].currentValue[i]);
    //     let newLine = new RfqLine();
    //     newLine.partNumber = changes['selectedRows'].currentValue[i].data.partNumber;
    //     newLine.partNumberStrip = changes['selectedRows'].currentValue[i].data.partNumberStrip;
    //     newLine.manufacturer = changes['selectedRows'].currentValue[i].data.manufacturer;
    //     newLine.commodityId = changes['selectedRows'].currentValue[i].data.commodityId;
    //     newLine.commodityName = changes['selectedRows'].currentValue[i].data.commodityName;
    //     newLine.dateCode = changes['selectedRows'].currentValue[i].data.dateCode;
    //     newLine.packagingId = changes['selectedRows'].currentValue[i].data.packagingId;
    //     newLine.packagingName = changes['selectedRows'].currentValue[i].data.packagingName;
    //     //newLine.note = changes['selectedRows'].currentValue[i].data.note;
    //     this.rfqLines.push(newLine);
    //   }

  //}

  initModel(){
    this.rfqLines = new Array<RfqLine>();
    this.rfqDetails = new Array<RfqDetails>();
    this.incrementRfqDetailsArray();
  }

  populateDropdownData(){
    this.sourcingService.getAddSourceData().subscribe(
      data => {
        this.commodities = data[2];
        this.packagingTypes = data[3];
        this.currencies = data[4];
      }
    );
    this.sourcingService.getSourceObjectTypeId().subscribe(data=>{
       this.objectTypeIdForSource = data;
       this.sharedService.getAccountsByObjectType(this.objectTypeIdForSource).subscribe(data=>{
         this.accountsByObjectType = data;
       })
    })
  }

   getContactsByAccountId(accountId) {
    this.quoteService.getContactsByAccountId(accountId).subscribe(
      data => {
        this.contacts = data;
      }
    )
  }

  onSupplierChange(value){
    this.getContactsByAccountId(value);
  }

  incrementRfqDetailsArray(){
    let newDetail = new RfqDetails();
    this.rfqDetails.push(newDetail);
  }

  onSave(){
    this.rfqService.createNewRfqAndLines(this.rfqDetails, this.rfqLines).subscribe(data => {
      if(data.json() > 0){
        this.notificationService.success(
          'Good Job',
          'Successfully created the RFQ',
          {
            pauseOnHover: false,
            clickToClose: false
          }
        )
      }else{
        this.notificationService.error(
          'Error',
          'Unsuccessfully created the RFQ',
          {
            pauseOnHover: false,
            clickToClose: false
          }
        )
      }

      this.rfqAdded.emit({rfqAdded: data.json()});
      let res = data.json();
      this.initModel();
      });
    this.closeDialog();
  }

  closeDialog(){
    this.closeBtn.nativeElement.click();
    this.rfqDetails = new Array<RfqDetails>();
    this.incrementRfqDetailsArray();
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

}
