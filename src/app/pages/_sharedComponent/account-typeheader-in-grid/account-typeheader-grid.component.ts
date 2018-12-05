import { Component, OnInit , AfterViewInit,ViewChild,ViewContainerRef, OnDestroy, ViewEncapsulation} from '@angular/core';
import { RemoteData, CompleterService, CompleterCmp } from "ng2-completer";
import { environment } from './../../../../environments/environment';
import { AgEditorComponent } from "ag-grid-angular";
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { InputComService } from './../../../_coms/input-com.service';

@Component({
  selector: 'az-grid-typeahead-account',
  template: `<ng2-completer #accountCompleter 
    [inputClass]="'Account-Typeheader form-control form-control-inline'"  
    name="accountCompleter" 
    [(ngModel)]="selectedValue"
    (selected)="onAccountSelected($event)" 
    (focus)="onInputFocus()"
    (blur)="onInputFocusLost()"
    (keydown)="onInputKeydown($event)"
    (opened)="onDropdownOpened()"
    [datasource]="dataRemote" 
    [minSearchLength]="2"
    [fillHighlighted]=false>
    </ng2-completer>  
  `,
  styleUrls: ['./account-typeheader-grid.component.scss'],
  providers:[],
  encapsulation: ViewEncapsulation.None
})
export class AccountTypeaheadGridComponent implements AgEditorComponent, AfterViewInit, OnDestroy {

  @ViewChild("accountCompleter") private accountCompleter: CompleterCmp;
  @ViewChild('accountCompleter', {read: ViewContainerRef}) container;
	private params: any;
	private _params;
	private options: any[];
  private dataRemote: RemoteData;
  private itemSelectedBool: boolean;
  private selectedValue: string;
  private TOP_OFFSET = 30;


  constructor(
		completerService: CompleterService, 
		private commodityComService: InputComService) {
    let requestOptions = new MyRequestOptions();
		this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
    );
    this.dataRemote.requestOptions(requestOptions);
		this.dataRemote.urlFormater(term => {
      return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?SearchString=' + encodeURIComponent(term) +
        '&RowOffset=0&RowLimit=10&DescSort=false&SortBy='; 
		});
		this.dataRemote.dataField("accounts");
   }

	 onAccountSelected($event){
    if($event != null){
      console.log('account typeheader', $event.originalObject)
      this._params.node.data.accountId =  $event.originalObject.accountId;
      this._params.node.data.accountName = $event.originalObject.accountName;
      this._params.node.data.contact = {contactId: null, contactName: ''};
      this._params.node.setDataValue('accountTypes', $event.originalObject.accountType) ;
      // this._params.node.data.isIhs = $event.originalObject.isIHS;
      // this.commodityComService.comoditySelected($event.originalObject.com);
      this.commodityComService.changeContacts($event.originalObject.accountId); 
    }
    let _self = this;
    this.createObservable().subscribe(x => {this.selectedValue = _self._params.node.data.accountName});
  }

  createObservable(): Observable<boolean>{
		return Observable.of(true).delay(1);
  }

  ngDoCheck(){
    //TODO make it only execute only on component load using a boolean
    jQuery(".Account-Typeheader").attr('data-field-name', 'Account Typeheader') //used to toggle data-field-name on on ng2-completer and allow edit (since we cannot add a datafield to that component directly)
    //this.dropDownFixPosition(jQuery('#accountGroupLinesGrid').find('.completer-dropdown-holder'), jQuery('#accountGroupLinesGrid').find('.completer-dropdown'));
  this.dropDownFixPosition();
  }

  onInputFocus(){
    this.itemSelectedBool = false;
  }

  onInputFocusLost(){
  }

  onInputKeydown(event) {
    if(event.key.length === 1 || event.keyCode === 8 || event.keyCode === 46){
      this._params.node.data.accountId = 0;
      this._params.node.data.accountName = '';
    }
   
  }



  onDropdownOpened(){
    this.dropDownFixPosition();
  }

  // dropDownFixPosition(){ 
  //   let className = this._params.values.parentClassName;
  //   let dropdown = jQuery(className + ' .completer-dropdown');
  //   let dropdownHolder = jQuery(className + ' .completer-dropdown-holder');
  // }

  dropDownFixPosition(){
    let className = this._params.values.parentClassName;
    let dropdown = jQuery(className + ' .completer-dropdown');
    let dropdownHolder = jQuery(className + ' .completer-dropdown-holder');
    var numRows = this._params.api.getModel().getRowCount();
    var rowIndex = this._params.node.rowIndex % 10;
   // dropdown.css('position', 'fixed');
   // dropdown.css('top', (260 + 30 * rowIndex) + "px");
    if(dropdownHolder && dropdown.length == 0)
    {
      dropdownHolder.each(
        (i,ele) =>    
        jQuery(ele).prependTo(jQuery(className))); 
    }
    let containerOffset = jQuery(className).offset(); 
    let eleOffSet =  jQuery( "[name='accountCompleter']" ).offset();
    let verticalHeight = eleOffSet.top - containerOffset.top ;
    verticalHeight = verticalHeight + this.TOP_OFFSET;
    let horzlength =  eleOffSet.left - containerOffset.left;
    if(dropdown){
      dropdown.css('top', verticalHeight+'px');
      dropdown.css('left', horzlength+'px');
      dropdown.show();
    }
  }

  ngOnInit() {
    if(this._params && this._params.topOffset){
      this.TOP_OFFSET = this._params.topOffset
    }
    window.addEventListener('scroll', this.scroll, true); //third parameter
	}

  scroll = (): void => {
    this.accountCompleter.blur();
    if (window.document.getElementById("accountGroupLinesGrid")){
      window.document.getElementById("accountGroupLinesGrid").focus();
    }
  };

  ngAfterViewInit() {    
  }

  agInit(params:any):void {
    
    this._params = params;
    this.selectedValue = params.node.data.accountName;
  }

	getValue():any {
    return this.selectedValue;
	}

	isPopup():boolean {
		return false;
	}

	focusIn()
	{
    if (this.container.element.nativeElement.children[0].children[0]){
	  	this.container.element.nativeElement.children[0].children[0].focus();
    }
	}

	onKeyDown(event):void {
		let key = event.which || event.keyCode;

		if (key == 13) {
			event.stopPropagation();
		}

		if (key == 37 ||  // left
			key == 39) {  // right
			event.stopPropagation();
		}
	}

  ngOnDestroy(): void {
    this.container.element.nativeElement.remove();
    window.removeEventListener('scroll', this.scroll, true);
  }
}
