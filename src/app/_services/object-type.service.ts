import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
@Injectable()
export class ObjectTypeService {

  constructor(private httpService: HttpService,) { }
  getAccountObjectTypeId(){
    let url = 'api/objectTypes/getAccountObjectTypeId';
    return this.httpService.Get(url).map(
        data => {
            let res = data.json();
            return res.objectTypeId;
        }
    )
	}

	getSOLinesObjectTypeId(){
		let url = 'api/objectTypes/getSoLinesObjectTypeId';
		return this.httpService.Get(url).map(
				data => {
						let res = data.json();
						return res.objectTypeId;
				}
		)
	}

	getPOLinesObjectTypeId(){
		let url = 'api/purchase-order/getPOLineObjectTypeId';
		return this.httpService.Get(url).map(
				data => {
						let res = data.json();
						return res.objectTypeId;
				}
		)
	}

	getInventoryObjectTypeId(){
		let url = 'api/common/getInventoryObjectTypeId';
		return this.httpService.Get(url).map(
				data => {
						let res = data.json();
						return res.objectTypeId;
				}
		)
	}

	getUserObjectTypeId(){
		let url = 'api/objectTypes/getUserObjectTypeId';
		return this.httpService.Get(url).map(
				data => {
						let res = data.json();
						return res.objectTypeId;
				}
		)
	}

}
