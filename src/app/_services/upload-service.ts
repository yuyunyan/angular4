import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { XLSDataMap, XLSDataMapObject } from './../_models/upload/xlsDataMap';
import * as _ from 'lodash';

@Injectable()
export class UploadService {

	constructor(private httpService: HttpService) {

	}

	getXLSDataMaps(itemListTypeID: number){
		let url = 'api/uploads/xlsDataMapGet?xlsType=ItemListLines&itemListTypeID=' + itemListTypeID;
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			let options = new Array<XLSDataMap>();

			options.push({
				id: 0,
				name: "None",
				isRequired: false
			});

			res.xlsDataMaps.forEach(element => {
				let option = new XLSDataMap();
				option.id = element.xlsDataMapId;
				option.name = element.fieldLabel;
				option.isRequired = element.isRequired == 1;

				options.push(option);
			});

			return options;
		});
	}

	getAccountXLSMaps(accountId: number){
		let url = 'api/uploads/accountDataMapsGet?xlsType=ItemListLines&accountId=' + accountId;
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			let accountXLSMaps = new Array<XLSDataMapObject>();

			res.xlsAccounts.forEach((xlsDataObject:XLSDataMapObject) => {
				accountXLSMaps.push(_.assign({}, xlsDataObject));
			});

			return accountXLSMaps;
		});
	}

	mappingAccountDataMaps(defaultDataMaps: Array<number>, accountXLSMaps: Array<XLSDataMapObject>){
		let dataMapArray = new Array<number>();
		if (defaultDataMaps.length < accountXLSMaps.length){
			return defaultDataMaps;
		}
		return _.map(defaultDataMaps, (dataMap: number, idx: number) => {
			let result: XLSDataMapObject = _.find(accountXLSMaps, (accountMap: XLSDataMapObject) => accountMap.columnIndex == idx);
			return result ? result.xlsDataMapId : 0;
		});
	}
}
