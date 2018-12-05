import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Subject } from 'rxjs/Subject';
import { RequestToPurchaseLine, SourceLine, SourceMatch } from './../_models/request-to-purchase/request-to-purchase-line';
import * as _ from 'lodash';

@Injectable()
export class RequestToPurchaseService {
	private rtpLoadedSubject = new Subject<RequestToPurchaseLine[]>();
	private sourceLoadedSubject = new Subject<SourceMatch[]>();
	private vendorSelectedSubject = new Subject<Vendor>();
	private onModalClickedSubject = new Subject<any>();
	private getAccountIdSubject = new Subject<number>();
	
	private _vendorId: number = 0;
	private _vendorName: string = '';
	private _buyerId: number = 0;
	private _buyerName: string = '';

	private reqToPMap: { [soLineId: string]: RequestToPurchaseLine};
	private requestToPurchaseList: RequestToPurchaseLine[];
	private sourceList: SourceMatch[];

	private preHighlightSOLineId: number;
	private preHighlightSource: SourceLine;

	constructor(private httpService: HttpService) {
		this.reqToPMap = {};
	}

	public get buyerId(): number{
		return this._buyerId;
	}

	public get vendorId(): number{
		return this._vendorId;
	}

	public get vendorName(): string{
		return this._vendorName;
	}

	public get buyerName(): string{
		return this._buyerName;
	}

	rtploaded(){
		
		this.rtpLoadedSubject.next(this.requestToPurchaseList);
	}

	GetRTPList(){
		return this.rtpLoadedSubject.asObservable();
	}

	sourceloaded(){
		this.sourceLoadedSubject.next(this.sourceList);
	}

	GetSourceList(){
		return this.sourceLoadedSubject.asObservable();
	}
	
	private VendorSelected(vendor: Vendor){
    this.vendorSelectedSubject.next(vendor);
	}

	ClearVendorFilter(){
		this._vendorId = 0;
		this._vendorName = '';
		this.VendorSelected({
			vendorId: 0,
			vendorName: ''
		});
	}

	// Method get called when Plus Btn Clicked
  	SelectSource(soLineId: number, source: SourceLine,vendor){
		const _self = this;		
		if(!vendor.vendorId){
				// Saved the current selected soLineId because the vendor filter update will reload the rtpList
				_self.preHighlightSOLineId = soLineId; 
				_self.preHighlightSource = source;
				_self.populateVendor(vendor);
				return;
			}
			let rtpLine = _self.reqToPMap[soLineId];
			if(rtpLine){
				// Created new source from the selected source
				let sourceLine =  _self.createSourceLineDomain(source, rtpLine.accountId, rtpLine.price);
				rtpLine.selectedSource.push(sourceLine);
				_self.populateSourceSelection(soLineId);
				_self.sourceloaded();
				_self.rtploaded();
			}
	}
	
	// Method get called when Checkmark Btn Clicked
	DeselectSource(soLineId: number, source: SourceLine, vendor: Vendor){
		const _self = this;
		let rtpLine = _self.reqToPMap[soLineId];
		if(rtpLine){
			let toRemove = rtpLine.selectedSource.find((s: SourceLine) => s.sourceId == source.sourceId);
			let toDeselect = _self.sourceList.find((s: SourceMatch) => s.sourceId == source.sourceId);
			if(toRemove && toDeselect){
				toDeselect.isSelected = false;
				rtpLine.selectedSource = _.without(rtpLine.selectedSource, toRemove);
				_self.rtploaded();
				_self.sourceloaded();
				_self.checkSelection();
			}
		}
	}

	// Method to Check any source has selected in rtpList
	// If not, will call populateVendor method to remove vendor filter
	private checkSelection(){
		if(this.HasSourceSelected()){
			return;
		}
		this.populateVendor({
			vendorId: 0,
			vendorName: ''
		});
	}

	HasSourceSelected(): boolean{
		return _.some(this.requestToPurchaseList, (rtpLine: RequestToPurchaseLine) => rtpLine.isHighLighted);
	}

	populateVendor(vendor: Vendor){
			this._vendorId = vendor.vendorId;
			this._vendorName = vendor.vendorName;
		this.VendorSelected(vendor);
	}

	GetVendorSelectionStatus(){
		return this.vendorSelectedSubject.asObservable();
	}

	private createSourceLineDomain(source, accountId, price):SourceLine{
		let sourceLine = new SourceLine();
		sourceLine.sourceId = source.sourceId;
		sourceLine.partNumber = source.partNumber;
		sourceLine.manufacturer = source.manufacturer;
		sourceLine.itemId = source.itemId;
		sourceLine.vendorId = source.vendorId;
		sourceLine.vendorName = source.vendorName;
		sourceLine.qty = source.qty;
		sourceLine.price = price;
		sourceLine.accountId = accountId;
		sourceLine.soLineId = source.soLineId;
		sourceLine.cost = source.cost;
		return sourceLine;
	}

	rtpHistoryExists()
	{
		let oldBuyerid = JSON.parse(localStorage.getItem('BuyerId'));
		return this.requestToPurchaseList && this.reqToPMap && oldBuyerid === this.buyerId;
	}

	getRequestToPurchaseList(underallocatedOnly: boolean){
		 const _self = this;
		
		const ROW_LIMIT = 500;
		this._vendorId = 0;
		//_self._vendorId = 0;
		let url='api/orderFulfillment/getRequestToPurchaseList?underallocatedOnly='+underallocatedOnly + 
		'&buyerId='+ _self.buyerId + '&accountId='+ (this._vendorId || '') + '&rowLimit=' + ROW_LIMIT+'&sortBy=&rowOffset=0';
		 return this.httpService.Get(url).map(data => {
			_self.reqToPMap = {};
			let res= data.json();
			let resList = res.oFList;
			let requestToPurchaseList = new Array<RequestToPurchaseLine>();
			resList.forEach(e => {
				let requestToPurchase = _self.mapRTPToDomain(e);
				requestToPurchaseList.push(requestToPurchase);
				_self.reqToPMap[e.soLineId.toString()] = requestToPurchase;
			});
			if(_self.preHighlightSOLineId && _self.reqToPMap[_self.preHighlightSOLineId]){
				let rtpLine = _self.reqToPMap[_self.preHighlightSOLineId];
				// Created new source from the selected source
				let sourceLine = _self.createSourceLineDomain(_self.preHighlightSource, rtpLine.accountId, rtpLine.price);
				// Added source to rtpLine.selectedSource
				_self.reqToPMap[_self.preHighlightSOLineId].selectedSource.push(sourceLine);
				_self.populateSourceSelection(_self.preHighlightSOLineId);
				// Clear the state 
				_self.preHighlightSOLineId = 0;
				_self.preHighlightSource = null;
				_self.sourceloaded();
			}
			_self.requestToPurchaseList = requestToPurchaseList;
			_self.rtploaded();
		});
	}
	

	// Update SourceList by matching rtpList.selectedSource
	private populateSourceSelection(soLineId: number){
		const _self = this;
		let rtpLine = _self.reqToPMap[soLineId];
		if(rtpLine && rtpLine.isHighLighted){
			const sourceList = rtpLine.selectedSource;
			_.forEach(sourceList, (selectedSource: SourceLine) => {
				let t = _self.sourceList.find((source) => source.sourceId == selectedSource.sourceId);
				if(t){
					t.isSelected = true;
				}
			});
		}
	}

	getSourceList(itemId: number, partNumber: string, objectId: number, objectTypeId: number, showInventory:boolean){
    const _self = this;
    if(typeof itemId==="undefined")
        itemId = 0;
    let url = 'api/sourcing/getSourceList?itemId=' + itemId + '&partNumber=' + (partNumber? encodeURIComponent(partNumber): '')
      + '&objectId=' + objectId + '&objectTypeId=' + objectTypeId +'&showAll=false&showInventory='+showInventory;

    return this.httpService.Get(url).map(data => {
			let res = data.json();
			let sources = new Array<SourceMatch>();
			_.forEach(res.sourceResponse, resObject => {
				if(resObject.typeName != 'Inventory'){
					sources.push(_self.mapSourceToDomain(resObject));
				}
			});
			_self.sourceList = sources;
			_self.populateSourceSelection(objectId);
			_self.sourceloaded();
		});
	}
	
	private mapSourceToDomain(resObject){
		let source = new SourceMatch();
		source.typeName = resObject.typeName;
		source.partNumber = resObject.partNumber;
		source.manufacturer = resObject.manufacturer;
		source.commodityName = resObject.commodityName;
		source.supplier = resObject.supplier;
		source.qty =  resObject.qty;
		source.cost = resObject.cost;
		source.dateCode = resObject.dateCode;
		source.packagingName = resObject.packagingName;
		source.packagingConditionId = resObject.packagingConditionId;
		source.leadTimeDays = resObject.leadTimeDays;
		source.moq = resObject.moq;
		source.isMatched = (resObject.isMatched == null)? null : resObject.isMatched;
		source.isJoined = resObject.isJoined;
		source.showCheckmark = resObject.showCheckmark;
		source.sourceId = resObject.sourceId;
		source.comments = resObject.comments;
		source.ageInDays= resObject.ageInDays;
		source.created = resObject.created;
		source.createdBy = resObject.createdBy;
		source.accountId = resObject.accountId;
		source.itemId = resObject.itemId;
		source.buyerId = resObject.buyerId;
		source.rating = resObject.rating;
		source.rtpQty = resObject.rtpQty;
    	return source;
	}

	private mapRTPToDomain(e){
		let requestToPurchase = new RequestToPurchaseLine();
		requestToPurchase.orderNo = e.orderNo;
		requestToPurchase.lineNum = e.lineNum;
		requestToPurchase.accountId = e.accountId;
		requestToPurchase.soVersionId = e.soVersionId;
		requestToPurchase.buyers = null;
		requestToPurchase.customers = e.customer;
		requestToPurchase.partNumber = e.partNo;
		requestToPurchase.mfr = e.mfr;
		requestToPurchase.commodity = e.commodityName;
		requestToPurchase.orderQty = e.orderQty;
		requestToPurchase.packaging = e.packagingName;
		requestToPurchase.dateCode = e.dateCode;
		requestToPurchase.price = e.price;
		requestToPurchase.shipDate = e.shipDate;
		requestToPurchase.shipPerson = e.salesPerson;
		requestToPurchase.soLineId = e.soLineId;
		requestToPurchase.itemId = e.itemId;
		requestToPurchase.comments = e.comments;
		requestToPurchase.allocatedQty = e.allocatedQty;
		requestToPurchase.externalId = e.externalId
		return requestToPurchase;
	}

	ClearCache(){
	}

	CreatePOBtnClicked(){
		const _self = this;
	}


	CreateSelectedList(){
		const _self = this;
		return _.flatten(_.map(_self.requestToPurchaseList, (rtpLine: RequestToPurchaseLine) => rtpLine.selectedSource));
	}

	GetAccountId(){
		return this.getAccountIdSubject.asObservable();
	}

	pushSourceSelection(vendorSourceList){
		const _self = this;
		this.onModalClickedSubject.next(vendorSourceList);
	}

	GetSourceSelection(){
		return this.onModalClickedSubject.asObservable();
	}
	
	removeSourcesFromCart(sources){
		
		sources.forEach(source => {
			let item = this.reqToPMap[source.soLineId];
			if(item.selectedSource){
				let index=item.selectedSource.findIndex(ele => ele.sourceId ==source.sourceId);
				item.selectedSource.splice(index, 1);
			}
		});
	}

	UpdatedBuyer(buyerId: number, buyerName: string){
		this._buyerId = buyerId;
		this._buyerName = buyerName;
	}
}

interface Vendor{
	vendorId: number;
	vendorName: string;
}
