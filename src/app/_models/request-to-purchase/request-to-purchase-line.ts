import { PartSource } from './../sourcing/partSource';
export class RequestToPurchaseLine{
	soLineId: number;
	partNumber: string;
	mfr: string;
	orderNo: number;
	lineNum: number;
	customers: string;
	soVersionId: number;
	accountId: number;
	commodity: string;
	orderQty:number;
	price: number;
	packaging:string;
	dateCode: number;
	shipDate?:string;
	shipPerson: string;
	buyers: string;
	itemId:number;
	comments?: number;
	allocatedQty: number;
	gpm?: number;
	externalId?: string;
	selectedSource: SourceLine[] = new Array<SourceLine>();
	get isHighLighted(): boolean{
		return this.selectedSource.length > 0;
	}
};

export class SourceLine{
	sourceId: number;
	itemId: number;
	partNumber: string;
	manufacturer: string;
	qty: number;
	vendorId: number;
	vendorName: string;
	price:number;
	accountId:number;
	soLineId:number;
	cost:number;
};

export class SourceMatch extends PartSource{
	isSelected: boolean;
};
