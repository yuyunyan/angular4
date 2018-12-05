import { Injectable } from '@angular/core';

@Injectable()
export class PoSoUtilities {
	public DisplayOrderId(externalId, orderId) {	
		return externalId || (orderId? orderId: '');
	}
	
	public RemoveTrailingCommaAndSpace(text) {
        	return text ? text.replace(/(^\s*,)|(,\s*$)/g, '') : '';
	}
	
	public ParseDateFromDateTime(date) {
        	return date ? date.split(' ')[0] : '';
	}
	
	public TrimFloat(float){
		return float ? parseFloat(float.toString()).toFixed(2) : '';
	}

}
