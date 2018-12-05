import {Image} from './../../common/image';

export class CheckList
{
    id:number;
    name:string;
    addedByUser?:boolean;
    questions?: Question[];
    completedCount?: number;
}

export class Question
{
    id:number;
    answerId:number;
    number: number;
    text: string;
    subText: string;
    answerTypeId: number;
    qtyFailed: number;
    showQtyFailed: number;
    comments: string;
    inspected: boolean;
    answer:string;
    imageCount: number;
    canComment: boolean;
    completedDate: string;
    requiresPicture: boolean;
}

