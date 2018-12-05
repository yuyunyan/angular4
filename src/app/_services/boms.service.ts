import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Customers, ContactsList } from './../_models/quotes/quoteOptions';
import { Manufacturer } from './../_models/Items/manufacturer';
import { ContactsService } from './../_services/contacts.service';
import { UsersService } from './../_services/users.service';
import { BuildCheckListService } from './../_services/build-checklist.service';
import { ItemList } from './../_models/bom/itemList';
import { BomListDetails } from './../_models/bom/listDetailsGrid';
import { SalesOrder } from './../_models/bom/salesOrder';
import { Inventory } from './../_models/bom/inventory';
import { OutsideOffer } from './../_models/bom/outsideOffer';
import { ResultSummary } from './../_models/bom/resultSummary';
import { CustomerRfq } from './../_models/bom/customerRfq';
import { EMS } from './../_models/bom/ems';
import { List } from 'linqts';
import { CommonInput } from './../_models/bom/commonInput';
import {  MatchOption } from './../_models/bom/checkShow';
import * as _ from 'lodash';
import { element } from 'protractor';

@Injectable()
export class BOMsService {
	private dataMapSubject = new Subject<any>();
	private commonInput:CommonInput;
	private matchOption:MatchOption;

	constructor(private httpService: HttpService,
		private contactsService: ContactsService,
		private usersService: UsersService,
		private checkListService: BuildCheckListService) { }

	getUploadCustomerList() {
		let url = 'api/quote/getAccountsStatusList';

		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				let customers = new Array<Customers>();

				res.customers.forEach(element => {
					customers.push({
						id: element.accountId,
						name: element.accountName
					})
				});
				return customers;
			}
		)
	}
	GetPOObjectTypeID() {
		let url = 'api/objectTypes/getPoObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )		
	}
	getContactsByAccountId(accountId: number) {
		return this.contactsService.getAccountContacts(accountId);
	}

	getSalesRepsList() {
		return this.usersService.getAllUsers();
	}
	GetManufacturers() {
		let url = 'api/common/getManufacturersList?searchText='
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				var manufacturers = res.manufacturers.map(
					mfr => {
						let manufacturer: Manufacturer;
						manufacturer = {
							MfrID: mfr.mfrId,
							MfrName: mfr.mfrName,
							Code: mfr.code,
							MfrURL: mfr.mfrUrl
						}
						return manufacturer;
					}
				)
				return manufacturers;
			},
			error => {
				console.log('Manufacturers service call failed');
			}
		)
	}
	getVendorAndCustomer(type) {
		//vendor:2 and customer:4, so type=6
		return this.checkListService.getAccountsByType(type);
	}


	testUpload(files: File[], dataMap, payload: ItemList) {
		let url = 'api/boms/uploadBOM';
		let formData: FormData = new FormData();
		files.forEach(file => {
			formData.append(file.name, file, file.name);
		});
		formData.append('xlsDataMap', JSON.stringify({ dataMap }));
		formData.append('bomBody', JSON.stringify(payload));
		return this.httpService.PostImage(url, formData).map(
			data => {
				let res = data.json();
				return res.itemListId;
			}
		);
	}

	setDataMapIdList(dataMap) {
		this.dataMapSubject.next(dataMap);
	}

	getDataMapIdList(): Observable<any> {
		return this.dataMapSubject.asObservable();
	}

	getBOMList(searchString:string, rowOffset: number, rowLimit: number, sortCol: string, descSort: boolean){
        return this.httpService.Get('api/boms/getBOMList?searchString=' + searchString + '&rowOffset='+ rowOffset + '&rowLimit=' +rowLimit+'&sortCol='+sortCol + '&descSort=' + descSort).map(
            data => {
                var res = data.json();
                var boms = new List<BomListDetails>();
                res.bomList.forEach(element => {
					let bom = new BomListDetails();   
					bom.itemListId = element.itemListId;
					bom.listName = element.listName;
					bom.accountId = element.accountID;
					bom.accountName = element.accountName;
                    bom.contactId = element.contactID;
					bom.contactName = element.contactName;
					bom.itemCount = element.itemCount;
					bom.fileName = element.fileName;
                    bom.statusId = element.statusID;
					bom.statusName = element.statusName;
					bom.userName = element.userName;
					bom.loadDate = element.loadDate;
					bom.organizationName = element.organizationName;
					bom.comments = element.comments;
                    boms.Add(bom);
                });
                return { bomList:boms, rowCount:res.rowCount }

            }
        )
	}

  getResultSummaryGrid(searchId:number,rowOffset:number,rowLimit:number,sort:string,descSort:boolean){
	let url = 'api/boms/getResultSummary?searchId='+searchId+'&rowOffset='+rowOffset+'&rowLimit='+rowLimit+'&sortCol='+sort+'&descSort='+descSort;
	return this.httpService.Get(url).map(
		data => {
			let res = data.json();
			var bomResults = res.resultSummaries.map(
				resultRep => {
					let bomResult: ResultSummary;
					bomResult = {
						itemId: resultRep.itemId,
						partNumber: resultRep.partNumber,
						mfr: resultRep.manufacturer,
						salesOrder: resultRep.salersOrders,
						inventory: resultRep.inventory,
						purchaseOrders: resultRep.purchaseOrders,
						vendorQuotes: resultRep.vendorQuotes,
						customerQuotes: resultRep.customerQuotes,
						customerRfqs: resultRep.customerRfq,
						outsideOffer: resultRep.outsideOffers,
						bomEms: resultRep.bom
					}
					return bomResult;
				}
			)
			return { results:bomResults, totalRowCount:res.totalRowCount };
		}
	)

  }
	
	getInventoryGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort) {
		let url = this.generateUrlWithQueryString('api/boms/getInventory', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				var inventoryLines = res.invLines.map(
					inv => {
						let inventory: Inventory;
						inventory = {
							warehouseId: inv.warehouse,
							mfgPartNumber: inv.mfgPartNumber,
							mfg: inv.mfg,
							inventoryQty: inv.invQty,
							cost: inv.cost,
							reservedQty: inv.resQty,
							availableQty: inv.availQty,
							purchaseOrder: inv.poLineId,
							dateCode: inv.dateCode,
							priceDelta: inv.priceDelta,
							potential:inv.potential,
							bomPartNumber: inv.bomPartNumber,
							bomIntPartNumber: inv.bomIntPartNumber,
							bomMfg: inv.bomMfg,
							bomQty: inv.bomQty,
							bomPrice: inv.bomPrice,
							itemId:	inv.itemId,

						}
						return inventory;
					}
				)
				return {results:inventoryLines, totalRowCount:res.totalRowCount};
			}, error => {
				console.log('bom-result Inventory service call failed');
			}
		)
	}

	getOutsideOffersGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort) {
		let url = this.generateUrlWithQueryString('api/boms/getOutsideOffers', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				var outsideOfferLines = res.ooLines.map(
					oo => {
						let outsideOffer: OutsideOffer;
						outsideOffer = {
							id: oo.sourceId,
							offerDate: oo.offerDate,
							vendorName: oo.vendor,
							partNumber: oo.mfgPartNumber,
							mfg: oo.mfg,
							qty: oo.qty,
							cost: oo.cost,
							buyer: oo.buyer,
							dateCode: oo.dateCode,
							leadTimeDays: oo.leadTimeDays,
							priceDelta: oo.priceDelta,
							potential: oo.potential,
							bomPartNumber: oo.bomPartNumber,
							bomIntPartNumber: oo.bomIntPartNumber,
							bomMfg: oo.bomMfg,
							bomQty: oo.bomQty,
							bomPrice: oo.bomPrice,
							itemId: oo.itemId
						}
						return outsideOffer;
					}
				)
				return {results:outsideOfferLines, totalRowCount:res.totalRowCount};
			}, error => {
				console.log('bom-result Outside Offers service call failed');
			}
		)
	}

	getSalesOrderGrid(searchId:number,partNo:string,rowOffset:number,rowLimit:number,sort:string,descSort:boolean) {
		let url = 'api/boms/getSalesOrder?searchId='+searchId+'&partNumber='+(partNo?partNo:'')+'&rowOffset='+rowOffset+'&rowLimit='+rowLimit+'&sortCol='+sort+'&descSort='+descSort;
		
			//let url = this.generateUrlWithQueryString('api/boms/getSalesOrder?', searchId, partNo, rowOffset, rowLimit, sort, descSort);
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				
				var salesOrders = res.salesOrderLine.map(
					so => {
						let salesOrder: SalesOrder;
						salesOrder = {
							soId: so.salesOrderId,
							recordId: so.recordId,
							soDate: so.soDate,
							customer: so.customer,
							partNumber: so.partNumber,
							mfr: so.mfg,
							qtySold: so.qtySold,
							soldPrice: so.soldPrice,
							dateCode: so.dateCode,
							unitCost: so.unitCost,
							gp: so.grossProfitTotal,
							dueDate: so.dueDate,
							shipQty: so.shippedQty,
							orderStatus: so.orderStatus,
							salesPerson: so.salesPerson,
							itemId: so.itemId,
							bomQty:so.bomQty,
							priceDelta:so.priceDelta,
							potential:so.potential,
							bomPrice:so.bomPrice,
							bomPartNumber:so.bomPartNumber,
							bomIntPartNumber:so.bomIntPartNumber,
							bomMfg:so.bomMfg
						}
						return salesOrder;
					}
				)
				return  {results:salesOrders, totalRowCount:res.totalRowCount};
			}, error => {
				console.log('Sales Order service call failed');
			}
		)
	}

	processMatch(commonInput,matchOption) {
		let url = "api/boms/bomProcessMatch";
		let body = {
			ItemListId:commonInput.bomListId,
			PartNumbers: commonInput.partNumbers,
			Manufacturer: commonInput.mfrOptionValue,
			Account: commonInput.accountOptionValue,
			SearchType: commonInput.searchTypeValue,
			DateStart: commonInput.startDateFormat,
			DateEnd: commonInput.endDateFormat,
			MatchQuote: matchOption.vendorQuotes,
			MatchSo: matchOption.salesOrder,
			MatchPo: matchOption.purchaseOrder,
			MatchOffers: matchOption.outsideOffer,
			MatchInventory: matchOption.inventory,
			MatchRfq: matchOption.customerRfqs,
			MatchBom: matchOption.bomEmsLists,
			MatchCustomerQuote: matchOption.customerQuotes
		}
		return this.httpService.Post(url, body).map(data=>{
			let res = data.json();
			return res.SearchId;
		});
	}

	getBomResultPO(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort) {
		
		let url = this.generateUrlWithQueryString('api/boms/getPurchaseOrders', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			var purchaseOrders = res.poLines.map(po => {
				let order = {
					poDate:	po.poDate,
					vendor: po.vendor,
					mfgPartNumber: po.mfgPartNumber,
					mfg: po.mfg,
					qtyOrdered: po.qtyOrdered,
					poCost: po.poCost,
					buyer: po.buyer,
					receivedDate: po.receivedDate,
					receivedQty: po.receivedQty,
					orderStatus: po.orderStatus,
					purchaseOrderID: po.purchaseOrderId,
					poLineID: po.poLineId,
					dateCode: po.dateCode,
					itemId: po.itemId,
					bomQty:po.bomQty,
					priceDelta:po.priceDelta,
					potential:po.potential,
					bomPrice:po.bomPrice,
					bomPartNumber:po.bomPartNumber,
					bomIntPartNumber:po.bomIntPartNumber,
					bomMfg:po.bomMfg
				};
				return order;
			});
			return { results:purchaseOrders, totalRowCount:res.totalRowCount };
		}, (error) => {
			console.log('bom-result PO service call failed');
		});
	}

	generateUrlWithQueryString(url, searchId, partNumber, rowOffset, rowLimit, sortCol, descSort)
	{
		return url+'?searchId='+searchId+'&partNumber='+ (partNumber? partNumber:'') +'&rowOffset='+ rowOffset+ 
		'&rowLimit='+rowLimit+'&sortCol='+sortCol+'&descSort='+descSort;
	}

	getBomResultCustomerRfqs(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort) {
		let url = this.generateUrlWithQueryString('api/boms/getCustomerRfqs', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(data => {
				let res = data.json();
				var customerRfqs = res.rfqLines.map(this.mapCustomerRfqQuotes);
				return { results: customerRfqs, totalRowCount: res.TotalRows};
			}, error => {
				console.log('bom-result Customer Rfq service call failed');
			}
		)
	}

	getBomResultCustomerQuotes(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort) {
		let url = this.generateUrlWithQueryString('api/boms/getCustomerQuotes', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(data => {
				let res = data.json();
				var customerQuotes = res.quoteLines.map(this.mapCustomerRfqQuotes)
				return { results: customerQuotes, totalRowCount: res.TotalRows};
			}, error => {
				console.log('bom-result Customer Quotes service call failed');
			}
		)
	}

	mapCustomerRfqQuotes(rfq):CustomerRfq {
		return {
			quoteId: rfq.quoteId,
			quoteDate: rfq.quoteDate,
			customer: rfq.customer,
			contact: rfq.contact,
			itemId: rfq.itemId,
			owners: rfq.owners,
			dateCode: rfq.dateCode,
			partNumber: rfq.partNumber,
			customerPartNum: rfq.customerPartNum,
			manufacturer: rfq.manufacturer,
			qty: rfq.qty,
			targetPrice: rfq.targetPrice,
			bomQty:rfq.bomQty,
			priceDelta:rfq.priceDelta,
			bomPrice:rfq.bomPrice,
			bomIntPartNumber:rfq.bomIntPartNumber,
			bomPartNumber:rfq.bomPartNumber,
			bomMfg:rfq.bomMfg,
			potential:rfq.potential
		};
	}

	getBomResultEMS(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort) {
		let url = this.generateUrlWithQueryString('api/boms/getEMSs', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(data => {
				let res = data.json();
				var emses = res.emsLines.map(
					ems => {
						let element: EMS;
						element = {
							itemListId: ems.itemListId,
							created: ems.bomDate,
							customerName: ems.customer,
							partNumber: ems.partNumber,
							manufacturer: ems.manufacturer,
							qty: ems.qty,
							targetPrice: ems.targetPrice,
							createdBy: ems.createdBy,
							customerPartNum: ems.customerPartNum,
							itemId: ems.itemId,
							bomQty:ems.bomQty,
							bomPrice:ems.bomPrice,
							bomPartNumber:ems.bomPartNumber,
							bomIntPartNumber:ems.bomIntPartNumber,
							bomMfg:ems.bomMfg,
							potential:ems.potential,
							priceDelta:ems.priceDelta
						}
						return element;
					}
				)
				return { results: emses, totalRowCount: res.TotalRows};
			}, error => {
				console.log('bom-result EMS service call failed');
			}
		)
	}

	getBOMObjectTypeId(){
		let url = 'api/boms/getBOMObjectTypeId';
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				return res.objectTypeId;
			}
		)
	}

	getBOMCommentTypeId(){
		let url = 'api/boms/getBOMCommentTypeIds';
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				const commentTypeMap = _.map(res.commentTypeIds, (element) => {
					return _.assign({}, {
							id: element.commentTypeId,
							name: element.typeName
					});
				});
				return commentTypeMap;
			}
		)
	}

	getBomResultVendorQuotes(searchId, partNumber, rowOffset, rowLimit, sortCol, descSort){
		let url = this.generateUrlWithQueryString('api/boms/getVendorQuotes', searchId, partNumber, rowOffset, rowLimit, sortCol, descSort);
		return this.httpService.Get(url).map(
			data => {
				let res = data.json();
				var vendorQuoteLines = res.vqLines.map(
					vqLine => {
						let outsideOffer = {
							id: vqLine.sourceId,
							offerDate: vqLine.offerDate,
							vendorName: vqLine.vendor,
							partNumber: vqLine.mfgPartNumber,
							mfg: vqLine.mfg,
							qty: vqLine.qty,
							cost: vqLine.cost,
							buyer: vqLine.buyer,
							dateCode: vqLine.dateCode,
							leadTimeDays: vqLine.leadTimeDays,
							itemId:	vqLine.itemId,
							note:vqLine.note,
							sqp:vqLine.sqp,
							moq:vqLine.moq,
							bomQty:vqLine.bomQty,
							bomPrice:vqLine.bomPrice,
							bomPartNumber:vqLine.bomPartNumber,
							bomIntPartNumber:vqLine.bomIntPartNumber,
							bomMfg:vqLine.bomMfg,
							potential:vqLine.potential,
							priceDelta:vqLine.priceDelta
						}
						return outsideOffer;
					}
				)
				return {results: vendorQuoteLines, totalRowCount: res.totalRowCount};
			}, error => {
				console.log('bom-result Vendor Quotes service call failed');
			}
		)
	}

	getPartSearchResult(searchString,searchType){
		let url= 'api/boms/getPartSearchResult?searchString='+searchString+'&searchType='+searchType;
		return this.httpService.Get(url).map(data=>{
			let res = data.json();
			const results= _.map(res.resultList,(element)=>{
				return _.assign({},{
					itemId:element.itemID,
					partNumber:element.partNumber,
					partNumberStrip:element.partNumberStrip,
					mfrID:element.mfrID,
					mfrName:element.mfrName,
					commodityID:element.commodityID,
					commodityName:element.commodityName,
					onOrder:element.onOrder,
					onHand:element.onHand,
					available:element.available,
					reserved:element.reserved
				})				
			});
			return results;
		}, error =>{
			console.log("getPartSearchResult service call failed");
		})
	}

	getAvailability(itemId){
		let url='api/boms/getAvailabilityPart?itemId='+itemId;
		console.log( url);
		return this.httpService.Get(url).map(data=>{
			let res= data.json();
			const results= _.map(res.availabiltyList,(element)=>{
				const allocatedData= _.map(element.allocated,(childElement)=>{
					return _.assign({},{
						salesOrderID:childElement.salesOrderID
					})
				})
				return _.assign({},{
					itemId:element.itemID,
					type:element.type,
					location:element.location,
					supplier:element.supplier,
					qty:element.qty,
					allocated:element.allocated,
					dateCode:element.dateCode,
					cost:element.cost,
					packaging:element.packaging,
					packagingCondition:element.packagingCondition,
					buyer:element.buyer
				})
			});
			return results;

		})
	}




}
