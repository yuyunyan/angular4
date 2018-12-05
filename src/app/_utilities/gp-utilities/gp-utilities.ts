import { Injectable } from '@angular/core';

@Injectable()
export class GPUtilities {
	public GrossProfit(quantity,cost,price) {	
		let val = (quantity * price) - (quantity * cost)
		return val.toFixed(2);
	}
}