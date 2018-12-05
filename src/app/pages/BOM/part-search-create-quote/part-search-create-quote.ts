import { Component, OnInit,Input, Renderer,OnChanges,SimpleChanges,AfterViewInit, ViewEncapsulation} from '@angular/core';
import { GridOptions,ColumnApi } from "ag-grid";
import { RequestToPurchaseService } from './../../../_services/request-to-purchase.service';
import { QuoteService } from './../../../_services/quotes.service'
import { Subject } from 'rxjs/Subject';
import { Currency } from './../../../_models/shared/currency';
import { SharedService } from './../../../_services/shared.service';
import { Ng2CompleterModule, RemoteData, CompleterService } from "ng2-completer";
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import { environment } from './../../../../environments/environment';
import { QuoteDetails } from './../../../_models/quotes/quoteDetails';
import { ContactsService } from './../../../_services/contacts.service';
import { Contacts, ListContact } from './../../../_models/contactsAccount/contacts';
import { NotificationsService } from 'angular2-notifications';
import { QuotePart} from './../../../_models/quotes/quotePart';
import { ItemsService} from './../../../_services/items.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Status } from './../../../_models/shared/status';

@Component({
  selector: 'az-part-search-create-quote',
  templateUrl: './part-search-create-quote.html',
  styleUrls: ['./part-search-create-quote.scss'],
})

export class PartSearchCreateQuote implements OnInit,OnChanges,AfterViewInit {
  @Input() selectedParts;
  private createQuoteGrid: GridOptions;
  private rowData: any;
  private paymentTermId: number = 0;
  private paymentTermList;
  private currencyList: Currency[];
  private statuses: Status[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private currencies:  Array<Currency>;
  private currencyId: number = 0;
  private dataRemote2: RemoteData;
  private accountSelected: any;
  private quoteDetails: QuoteDetails;
  private accountString: string;
  private organizationList: Array<any>;
  private objectTypeIdForQuote: number = 19;
  private contactsByAccount: Contacts[];
  private organizationId : number = 0;
  private contact: Contacts;
  private formIsNotValid : boolean = false;
  private quoteId:number = 0;
  private quoteVersionId:number =0;
  private quoteSuccess: boolean;
 // private quoteParts: QuotePart[];

  constructor(
    private _itemsService: ItemsService,
    private quoteService: QuoteService,
    private _notificationsService: NotificationsService,
    private sharedService: SharedService,
    private router:Router, 
    private completerService: CompleterService,
    private contactsService : ContactsService){
    this.quoteDetails = new QuoteDetails();
    this.contact = new Contacts();
    this.quoteDetails.organizationId = 0;
    let requestOptions = new MyRequestOptions();

        this.dataRemote2 = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
    );
    this.dataRemote2.requestOptions(requestOptions);
    this.dataRemote2.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&accountType=4' 
		})
    this.dataRemote2.dataField("accounts");
        this.createGrid();
        this.getPaymentTermList();
        this.PopulateDataForNewQuote();
    }

    createGrid(){
        let _self = this;
        this.createQuoteGrid = {  
            suppressContextMenu:true,   
            toolPanelSuppressSideButtons:true,
            columnDefs:  this.createLinesGrid(),
            onGridReady: e => {
                setTimeout( () => {
                    _self.createQuoteGrid.api.sizeColumnsToFit();
            }, 0)
              },
        }
    }

    onInputFocusLost(){
        setTimeout(() => {
            if(!(this.accountSelected.accountNameAndNum === this.accountString)){
                this.accountString = this.accountSelected.accountNameAndNum;
            }
        }, 500);
    }

    onOptionSelected(){
        this.runValidation(this.quoteDetails);
    }

    closeModal(){
        this.quoteDetails.contactId = undefined;
        this.quoteDetails.organizationId = 0;
        this.quoteDetails.paymentTermId = undefined;
        this.quoteDetails.currencyId = undefined;
        this.accountString = '';
        this.formIsNotValid = false;
        this.quoteSuccess = false;
        jQuery("#mdlCreateQuote").toggle();
    }

    onInputKeydown($event){
    }

    createQuote(){
       this.runValidation(this.quoteDetails);
       if(!this.formIsNotValid){
           this.saveQuote();
       }
    }

    saveQuote(){
        let payload;
        payload = {
          QuoteId: null, 
          VersionId: null, 
          ShipLocationId:  null,
          AccountId: this.accountSelected.accountId,
          StatusId: null, 
          ValidForDays:  null, 
          ContactId: this.quoteDetails.contactId,
          IncotermId:null,
          PaymentTermId:  this.quoteDetails.paymentTermId,
          CurrencyId: this.quoteDetails.currencyId,
          OrganizationId:  this.quoteDetails.organizationId,
          ShippingMethodId:  null,
          QuoteTypeId:  null,
          IncotermLocation: null
        };

        this.quoteService.setQuoteDetails(payload)
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          let res = data.json();
          if (res) {
            this._notificationsService.success(
              'Good Job',
              'Successfully saved the quote details',
              {
                pauseOnHover: false,
                clickToClose: false
              }           
            )
            this.quoteId = res.QuoteId;
            this.quoteVersionId = res.versionId;
            this.saveQuoteParts(res.QuoteId);
          }
      });
    }

    statusIdDefault(){
        let indexOfDefault = this.statuses.findIndex(x => x.isDefault);
        let defaultStatusId = indexOfDefault > -1 ? this.statuses.find(x => x.isDefault).id : this.statuses[0].id;
        return defaultStatusId;
    }

    saveQuoteParts(quoteId){
        let quotePart:QuotePart;
        this.selectedParts.forEach(part => {
        this._itemsService.GetItemDetails(part.itemId).subscribe(data=>{
            quotePart={
                quoteLineId:null,
                lineNo:null,
                customerLineNo:null,
                partNumber:part.manPartNo,
                partNumberStrip: data.results.MPN,
                manufacturer:part.manufacturer,
                leadTimeDays: null,
                commodityId: data.results.CommodityID,
                customerPN:null,
                quantity:0,
                price:0,
                cost:0,
                gpm:null,
                packagingId:null,
                alternates:null,
                isAlternate:null,
                dateCode:null,
                ItemId:part.itemId,
                statusId:this.statusIdDefault(),
                routedTo: null,
                isIhs: null,
                IsPrinted: true //doesnt go anywhere, we use a seperate onClick method to save IsPrinted
            }
            this.quoteService.setQuoteParts(quotePart, null,this.quoteId, this.quoteVersionId).subscribe(
                data => {
                    if(data){
                        this.quoteSuccess = true;
                        setTimeout(() => {
                            this.router.navigate(['pages/quotes/quote-details', { quoteId: this.quoteId, quoteVersionId: this.quoteVersionId }]);
                        }, 1000);
                    }
                })
        });  
        })
    }

    runValidation(quote){
        if(!this.accountSelected || this.accountString == '' || quote.contactId == undefined || quote.currencyId == undefined || quote.paymentTermId == undefined || quote.organizationId == 0){
            this.formIsNotValid = true;
        }else{
            this.formIsNotValid = false;
        }
    }

    onAccountSelected($event){
          if($event != null){
          this.accountSelected = $event.originalObject;
          this.runValidation(this.quoteDetails);
          this.getContactsByAccountId(this.accountSelected.accountId);
            
          this.contactsService.getAccountDetails(this.accountSelected.accountId).takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(data => {
              let accountDetails = [];
              accountDetails.push(data);
              this.quoteDetails.currencyId = accountDetails[0].currencyId;
              this.quoteDetails.paymentTermId = accountDetails[0].paymentTermId;
              this.quoteDetails.organizationId = accountDetails[0].organizationId;
              let organizationExixts = this.organizationList.includes((x)=>x.organizationId = this.organizationId)
              if(organizationExixts){
                this.quoteDetails.organizationId = accountDetails[0].organizationId;
              }else{
                this.quoteDetails.organizationId = 0;
              }
          })
        }
    }

    getContactsByAccountId(accountId) {
        this.quoteService.getContactsByAccountId(accountId).takeUntil(this.ngUnsubscribe.asObservable())
          .subscribe(
          data => {
            this.contactsByAccount = data;
            this.quoteDetails.contactId = this.contactsByAccount[0].contactId;
          }
        )
    }

    onContactsChange(value) {
        this.contact = this.contactsByAccount.find(x => +value == x.contactId);
    }
      
    ngOnInit(){
    }

    PopulateDataForNewQuote() {
        this.objectTypeIdForQuote = 19;
        this.quoteService.getDetailsForNewQuote(this.objectTypeIdForQuote).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(
          data => {      
             this.currencyList = data[0];
             this.organizationList = data[2];
             this.paymentTermList = data[3];
             this.statuses = data[4].status;
          }
        )
    }

    ngAfterViewInit(){
        this.createQuoteGrid.api.setRowData(this.rowData);
    }

    ngOnChanges(changes: SimpleChanges){
         const _self = this;
         let partChanges = changes['selectedParts']
        if(partChanges.currentValue){
            this.selectedParts = partChanges.currentValue;
            var data = _self.onPartsSelectionChanges(this.selectedParts);
            if(!this.rowData){
                this.rowData=data;
            }else{
                this.createQuoteGrid.api.setRowData(data);
            }
        }
    }

    onPartsSelectionChanges(partsList){
        //Declare rowLimit/rowOffset for API
          const _self = this;
          let partsSearchSelection = [];
          partsList.forEach( part => {
            partsSearchSelection.push({
                partNumber : part.manPartNo,
                manufacturer : part.manufacturer,
            });
         });
           return partsSearchSelection;
    }
    
    getPaymentTermList(){
        this.quoteService.getPaymentTerms()
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.paymentTermList = data;
        });
      }

    createLinesGrid(){
        const _self = this;
        let columnDefs =  [
          {
            headerName:"Part Number",
            field:"partNumber",
            headerClass:"grid-header",
            width: 170,
            lockPinned:true,
            pinned:"left"
          },
          {
            headerName:"Manufacturer",
            field:"manufacturer",
            headerClass:"grid-header",
            width: 170,
            lockPinned:true,
            pinned:"left"
          },
          {
            headerName:"Qty",
            field:"qty",
            headerClass:"grid-header",
            width: 86,
            lockPinned:true,
            pinned:"left"
          },
        ];
        return columnDefs;
    }
}