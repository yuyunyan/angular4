export class CommonInput {
  partNumber: string ='';
  partNumbers:string[] =[];
  startDateFormat: string = '';
  endDateFormat: string = '';
  accountOptionValue: string = '';
  mfrOptionValue: string = '';
  searchTypeValue: string = 'P';
  bomListId: number = undefined;
}

export class SearchTermState extends CommonInput{
  startDate: Date;
  endDate: Date;
}
