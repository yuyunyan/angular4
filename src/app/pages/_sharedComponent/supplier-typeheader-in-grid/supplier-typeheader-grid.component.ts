import { Component, OnInit , AfterViewInit,ViewChild,ViewContainerRef, OnDestroy, ViewEncapsulation} from '@angular/core';
import { RemoteData, CompleterService, CompleterCmp } from "ng2-completer";
import { environment } from './../../../../environments/environment';
import { AgEditorComponent } from "ag-grid-angular";
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { InputComService } from './../../../_coms/input-com.service';

@Component({
  selector: 'az-grid-typeahead-supplier',
  template: `<ng2-completer #supplierCompleter 
    name="supplierCompleter" 
    [(ngModel)]="selectedValue"
    (selected)="onSupplierSelected($event)" 
    (focus)="onInputFocus()"
    (blur)="onInputFocusLost()"
    (keydown)="onInputKeydown($event)"
    (opened)="onDropdownOpened()"
    [datasource]="dataRemote" 
    [minSearchLength]="2"
    [fillHighlighted]=false>
    </ng2-completer>  
  `,
  styleUrls: ['./supplier-typeheader-grid.component.scss'],
  providers:[],
  encapsulation: ViewEncapsulation.None
})
export class SupplierTypeaheadGridComponent implements AgEditorComponent, AfterViewInit, OnDestroy {

  @ViewChild("supplierCompleter") private supplierCompleter: CompleterCmp;
  @ViewChild('supplierCompleter', {read: ViewContainerRef}) container;
	private params: any;
	private _params;
	private options: any[];
  private dataRemote:RemoteData;
  private itemSelectedBool: boolean;
  private selectedValue: string;

  constructor(completerService: CompleterService, private commodityComService:InputComService) {
    let requestOptions = new MyRequestOptions();
		this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
    );
    this.dataRemote.requestOptions(requestOptions);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=22' 
		});
		this.dataRemote.dataField("accounts");
   }

	 onSupplierSelected($event){
    
    if($event != null){
      
      this._params.node.data.supplierId =  $event.originalObject.accountId;
      this._params.node.data.supplierName = $event.originalObject.accountName;
      this._params.node.data.contactId = undefined;
      this._params.node.setDataValue('email', '');
      this._params.node.setDataValue('phone', '');
      // this._params.node.data.isIhs = $event.originalObject.isIHS;
      // this.commodityComService.comoditySelected($event.originalObject.com);
      this.commodityComService.changeContacts($event.originalObject.accountId);
      
    }

    let _self = this;
    this.createObservable().subscribe(x => {this.selectedValue = _self._params.node.data.supplierName});
  }

  createObservable(): Observable<boolean>{
		return Observable.of(true).delay(1);
  }

  ngDoCheck(){
    //TODO make it only execute only on component load using a boolean
    this.dropDownFixPosition(jQuery('#rfqGenerateSupplierGrid').find('.completer-dropdown-holder'), jQuery('#rfqGenerateSupplierGrid').find('.completer-dropdown'));
  }

  onInputFocus(){
    this.itemSelectedBool = false;
  }

  onInputFocusLost(){
    // if(!this.itemSelectedBool && this.hasUserTyped){
    //   this._params.node.data.itemId = null;
    // }
  }

  onInputKeydown(event) {
    
    //backspace = 8
    //delete = 46
    //any printable key length = 1
    if(event.key.length === 1 || event.keyCode === 8 || event.keyCode === 46){
      this._params.node.data.supplierId = 0;
      this._params.node.data.supplierName = '';
    }
   
  }

  onDropdownOpened(){
    this.dropDownFixPosition(jQuery('#rfqGenerateSupplierGrid').find('.completer-dropdown-holder'), jQuery('#rfqGenerateSupplierGrid').find('.completer-dropdown'));
  }

  dropDownFixPosition(button,dropdown){
    var numRows = this._params.api.getModel().getRowCount();
    var rowIndex = this._params.node.rowIndex;
    dropdown.css('position', 'fixed');
    dropdown.css('top', (580 + 30 * rowIndex) + "px");
  }

  ngOnInit() {
		window.addEventListener('scroll', this.scroll, true); //third parameter
	}

  scroll = (): void => {
    this.supplierCompleter.blur();
    if (window.document.getElementById("rfqGenerateSupplierGrid")){
      window.document.getElementById("rfqGenerateSupplierGrid").focus();
    }
  };

  ngAfterViewInit() {    
  }

  agInit(params:any):void {
    
    this._params = params;
    this.selectedValue = params.node.data.supplierName;
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
