import { Component,OnInit, AfterViewInit,ViewChild,ViewContainerRef, OnDestroy, ViewEncapsulation} from '@angular/core';
import { RemoteData, CompleterService, CompleterCmp } from "ng2-completer";
import { environment } from './../../../../environments/environment';
import { AgEditorComponent } from "ag-grid-angular";
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {InputComService} from './../../../_coms/input-com.service';


@Component({
  selector: 'az-grid-typeahead',
  template: `<ng2-completer #quoteCompleter 
    name="itemCompleter" 
    [inputClass]="'form-control form-control-inline'"
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
  styleUrls: ['./item-typeahead-grid.component.scss'],
  providers:[],
  encapsulation: ViewEncapsulation.None
})
export class ItemTypeaheadGridComponent implements AgEditorComponent, AfterViewInit, OnDestroy {

  @ViewChild("quoteCompleter") private quoteCompleter: CompleterCmp;
  @ViewChild('quoteCompleter', {read: ViewContainerRef}) container;
 
  private ngUnsubscribe: Subject<void> = new Subject<void>();
	private params: any;
	private _params;
	private options: any[];
  private dataRemote:RemoteData;
  private itemSelectedBool: boolean;
  private selectedValue: string;
  private keepDisabled: boolean;
  private TOP_OFFSET = 30;
  private parentDivName: string;
 
  constructor(completerService: CompleterService, private commodityComService:InputComService) {
    let requestOptions = new MyRequestOptions();
    this.dataRemote = completerService.remote(
      environment.apiEndPoint + "/api/items/getSuggestions?searchString=",
      null,
      "data");
    this.dataRemote.requestOptions(requestOptions);
    this.dataRemote.dataField("suggestions");
    //this.dataRemote.descriptionField("suggestions");
  }

  onAccountSelected($event){
    if($event != null){
      
      this.itemSelectedBool = true;
      this._params.node.data.itemId =  $event.originalObject.id;
      this._params.node.data.partNumber = $event.originalObject.name;
      this._params.node.data.isIhs = $event.originalObject.isIHS;
      this._params.node.setDataValue('manufacturer', $event.originalObject.mfr);
      //this._params.node.setDataValue('commodity', {id :this._params.node.data.com, name:this._params.node.data.com}); 

      this.commodityComService.comoditySelected($event.originalObject.com);
      this.commodityComService.changeMfr($event.originalObject.mfr);
      this.commodityComService.enableInput(false);
      
    }

    let _self = this;
    this.createObservable().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(x => {this.selectedValue = _self._params.node.data.partNumber});
  }

  createObservable(): Observable<boolean>
  {
      return Observable.of(true).delay(1);
  }

  ngDoCheck(){

    this.dropDownFixPosition();
  }

  onInputFocus(){
    this.itemSelectedBool = false;

    //toggle focus here?
  }

  onInputFocusLost(){
    this.itemSelectedBool = false;
  }

  onInputKeydown(event) {
    if(event.key.length === 1 || event.keyCode === 8 || event.keyCode === 46){
      if(!this.keepDisabled){
        this.commodityComService.enableInput(true);
      }
      this._params.node.data.itemId = 0;
      this._params.node.data.partNumber = '';
      this._params.node.data.isIhs = false;
    } 
    if(event.keyCode === 13 && !this.itemSelectedBool){
      this._params.context.parentComponent.triggerSave();
    }  
    if(event.keyCode === 13 && this.itemSelectedBool){
      this.itemSelectedBool = false;
    }  
  }
   

  onDropdownOpened(){
    this.dropDownFixPosition();
  }

  dropDownFixPosition(){ 
    let className = this._params.values.parentClassName;
    let dropdown = jQuery(className + ' .completer-dropdown');
    let dropdownHolder = jQuery(className + ' .completer-dropdown-holder');
    if(dropdownHolder && dropdown.length == 0)
    {
      dropdownHolder.each(
        (i,ele) =>    
        jQuery(ele).prependTo(jQuery(className))); 
    }
    let containerOffset = jQuery(className).offset(); 
    let eleOffSet =  jQuery( "[name='itemCompleter']" ).offset();
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
    if(this.keepDisabled || (this._params.node.data.itemId && this._params.node.data.itemId > 0)){
      this.createObservable().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(x => {
        this.commodityComService.enableInput(false)
      });
    }else{
      this.createObservable().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(x => {
        this.commodityComService.enableInput(true);
      });
    }
  }

  scroll = (): void => {
    this.quoteCompleter.blur();
    if (window.document.getElementById("partsGrid")){
      window.document.getElementById("partsGrid").focus();
    }
  };

  ngAfterViewInit() {    
  }

  agInit(params:any):void {
    this._params = params;
    this.selectedValue = params.node.data.partNumber;
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

		if (key == 13)
		{
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  } 
}
