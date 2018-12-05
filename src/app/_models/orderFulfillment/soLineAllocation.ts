export class SOLineAllocation{
	soId: number;
	soVersionId: number;
	soLineId: number;
	partNumber: string;
	qty: number;
	neededQty: number;
	allocatedQty: number;
	sellers: string;
	mfr: string;
	statusName: string;
	accountName: string;
	price: number;
	shipDate: Date;
	dateCode: string;
	lineNum: number;
	externalId?: string;
};
