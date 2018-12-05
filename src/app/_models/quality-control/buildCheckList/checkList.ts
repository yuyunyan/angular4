export class CheckList{
    id:number;
    parentCheckListId:number;
    name:string;
    type:string;
    checklistTypeId:number;
    description:string;
    sortOrder:number;
    effectiveStartDate:string;
    childCheckLists:CheckList[];
    isEnabled: boolean = true;
}
