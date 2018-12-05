import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { ItemsService } from './items.service';
import { ItemEnums } from './../_models/common/itemEnums'
import { ContactsService } from './contacts.service'
import { Observable } from 'rxjs/Observable';
import { AccountDetailsByType } from './../_models/common/accountsByType';
import { CheckList } from './../_models/quality-control/buildCheckList/checkList';
import { CheckListType } from './../_models/quality-control/buildCheckList/checkListType';
import { Question } from './../_models/quality-control/buildCheckList/question';
import { CheckListAssociations } from './../_models/quality-control/buildCheckList/checkListAssociations';
import { AnswerType } from './../_models/quality-control/buildCheckList/answerType';
import { QcLinkType } from './../_models/quality-control/buildCheckList/linkType';
import { QcLinkTypeValue } from './../_models/quality-control/buildCheckList/linkTypeValue';
import { CheckListParent } from '../_models/quality-control/buildCheckList/checkListParent';

@Injectable()
export class BuildCheckListService {
    constructor(private httpService: HttpService, private itemService: ItemsService) {

    }

    // public getBuildCheckLists() 
    // {
    //     let checkLists = new Array<CheckList>();
    //     let url = "api/quality-control/getBuildCheckLists";
    //     return this.httpService.Get(url).map(data => {
    //         let list: CheckList;
    //         let res = data.json();
    //         res.checkLists.forEach(element => {
    //             list = {
    //                 id: element.checklistId,
    //                 name: element.checklistName,
    //                 type: element.checklistTypeName,
    //                 sortOrder:element.sortOrder,
    //                 effectiveStartDate:element.effectiveStartDate,
    //                 childCheckLists: element.childCheckList
    //             }
    //             checkLists.push(list);

    //         });
    //         console.log("bulid checklist service 101", checkLists);
    //         return checkLists;     
    //     })
    // }

    public getBuildCheckLists() {
        let url = "api/qc-checklist/getCheckList";
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let checkLists = res.checkLists.map(checkListRes => {
                let childCheckLists = checkListRes.childCheckList.map(childCheckListRes => {
                    let childCheckList: CheckList;
                    childCheckList = {
                        id: childCheckListRes.checklistId,
                        parentCheckListId: childCheckListRes.parentChecklistId,
                        name: childCheckListRes.checklistName,
                        type: childCheckListRes.checklistTypeName,
                        checklistTypeId: checkListRes.checklistTypeId,
                        sortOrder: childCheckListRes.sortOrder,
                        effectiveStartDate: childCheckListRes.effectiveStartDate,
                        childCheckLists: childCheckListRes.childCheckList,
                        description: childCheckListRes.checklistDescription,
                        isEnabled: childCheckListRes.isEnabled
                    }
                    return childCheckList;
                });
                let checkList: CheckList;
                checkList = {
                    id: checkListRes.checklistId,
                    parentCheckListId: checkListRes.parentChecklistId,
                    name: checkListRes.checklistName,
                    type: checkListRes.checklistTypeName,
                    checklistTypeId: checkListRes.checklistTypeId,
                    sortOrder: checkListRes.sortOrder,
                    effectiveStartDate: checkListRes.effectiveStartDate,
                    childCheckLists: childCheckLists,
                    description: checkListRes.checklistDescription,
                    isEnabled: checkListRes.isEnabled
                }
                return checkList;
            });
            return checkLists;

        },
            error => {
                console.log("getCheckList service call failed");
            }
        )
    }

    public getCheckListData(checkListId: number) {
        return Observable.forkJoin(
            this.getCheckListDetails(checkListId),
            this.getCheckListTypes(),
            this.getParentCheckListOptions()
        );
    }

    public getCheckListDetails(checkListId: number) {
        let url = "api/qc-checklist/getCheckListById?checkListId=" + checkListId;
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let checkList: CheckList;
            checkList = {
                name: res.checklistName,
                id: res.checklistId,
                parentCheckListId: res.parentChecklistId,
                type: res.checklistTypeName,
                checklistTypeId: res.checklistTypeId,
                sortOrder: res.sortOrder,
                effectiveStartDate: res.effectiveStartDate,
                childCheckLists: res.childCheckList,
                description: res.checklistDescription,
                isEnabled: res.isEnabled
            };
            return checkList;
        },
            error => {
                console.log("getCheckList service call failed");
            })
    }

    public getCheckListTypes() {
        let url = "api/qc-checklist/getCheckListType";
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let checkListTypes = res.checkListTypes.map(data => {
                let checkListType: CheckListType;
                checkListType = {
                    id: data.typeId,
                    name: data.typeName
                };
                return checkListType;
            })
            return checkListTypes;

        },
            error => {
                console.log("getCheckList service call failed");
            }
        )
    }

    public getParentCheckListOptions() {
        let url = "api/qc-checklist/getCheckListParentOptions";
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let parentCheckListOptions = res.parentOptions.map(data => {
                let parentCheckListOption: CheckListParent;
                parentCheckListOption = {
                    id: data.id,
                    name: data.name,
                    checklistTypeId: data.checklistTypeId                    
                };
                return parentCheckListOption;
            });
            return parentCheckListOptions;
        },
            error => {
                console.log("getCheckList service call failed");
            }
        )
    }

    public getChecklistAssociations(checklistId: number) {
        let associations = new Array<CheckListAssociations>();
        let url = "api/qc-checklist/getChecklistAssociations?checkListId=" + checklistId;
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            console.log(data);
            let list: CheckListAssociations;
            res.checklistAssociations.forEach(element => {
                list = {
                    linkType: element.linkType,
                    value: element.value,
                    objectTypeId: element.objectTypeID,
                    objectId: element.objectID
                }
                associations.push(list);
            });
            console.log(associations);
            return associations;
        },
            error => {
                console.log("getCheckListAssociations service call failed");
            }
        )
    }

    public getLinkTypes(){
        let url = 'api/qc-checklist/getLinkTypes';
        return this.httpService.Get(url).map(
            data => {
            let res = data.json();
            let linkTypes = new Array<QcLinkType>();
            res.checklistAssociationsLinkTypes.forEach(element => {
                let link = new QcLinkType();
                link.name = element.objectName;
                link.objectTypeId = element.objectTypeID;
                link.accountTypeId = element.accountTypeID;
                linkTypes.push(link);
            })
            //Add 0 value
            let defaultVal = new QcLinkType();
            defaultVal.name = 'Always';
            defaultVal.objectTypeId = 0;
            linkTypes.push(defaultVal);

            return { results: linkTypes, errorMessage: null};
            },error => {
                    console.log("Sourcing Statuses call failed");
        })      
  }

    public getItemLinkTypeValues(){
        return this.itemService.GetAllItems();
    }

    public getManufacturerLinkTypeValues(){
        return this.itemService.GetManufacturers();
    }

    public getCommodityLinkTypeValues(){
        return this.itemService.GetCommodities();
    }


    public getAccountLinkTypeValues(type){
        return this.getAccountsByType(type);
    }
    
    public getAccountsByType(type){
        let url ='api/common/getAccountsByType?type='+type;
        return this.httpService.Get(url).map(
            data=>{
                let res= data.json();
                let accounts = new Array<AccountDetailsByType>();
                res.accounts.forEach(element => {
                    accounts.push({
                        accountId:element.id,
                        name:element.name,
                        type:element.typeId
                    }
                    )
                });
               return accounts; 
               
            }
        )
    }

    public setAssociation(checklistId:number, objectId:number, objectTypeId:number){
        let url = "api/qc-checklist/setCheckListAssociation";
        let body = {
            checklistId: checklistId,
            objectID: objectId,
            objectTypeID: objectTypeId
        }
        console.log("setAssociation body");
        console.log(body);
        return this.httpService.Post(url,body);
    }

    public deleteAssociation(checklistId:number, objectId:number, objectTypeId:number){
        let url = "api/qc-checklist/deleteCheckListAssociation";
        let body = {
            checklistId: checklistId,
            objectID: objectId,
            objectTypeID: objectTypeId
        }
        return this.httpService.Post(url,body);
    }

    public setCheckList(checkList: CheckList){
        let url = "api/qc-checklist/setCheckList";
        let body = {
            checklistId: checkList.id,
            checklistName: checkList.name,
            parentChecklistId: checkList.parentCheckListId,
            checklistDescription: checkList.description,
            checklistTypeId: checkList.checklistTypeId,
            sortOrder: checkList.sortOrder,
            effectiveStartDate: checkList.effectiveStartDate,
            isEnabled: checkList.isEnabled
        }
        return this.httpService.Post(url, body);
    }

    public getQuestionsByCheckListId(checklistId: number) {
        let url = 'api/qc-checklist/getChecklistQuestions?checklistId=' + checklistId;
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let questions = res.questions.map(questionsRes => {
                let question: Question;
                question = {
                    questionId: questionsRes.questionId,
                    checkListId: questionsRes.checkListId,
                    versionId: questionsRes.versionId,
                    sort: questionsRes.sortOrder,
                    questionText: questionsRes.questionText,
                    questionSubText: questionsRes.questionSubText,
                    questionHelpText: questionsRes.questionHelpText,
                    answerTypeName: questionsRes.answerTypeName,
                    answerTypeId: questionsRes.answerTypeId,
                    comment: questionsRes.canComment,
                    inspection: questionsRes.printOnInspectReport,
                    signature: questionsRes.requireSignature,
                    picture: questionsRes.requiresPicture,
                    rejectReport: questionsRes.printOnRejectReport

                }
                return question;
            })
            return questions;
        }, error => {
            console.log("getQuestionsByCheckListId service call failed");
        })
    }
    public getQuestionDetailsData(questionId: number) {
        return Observable.forkJoin(
            this.getQuestionDeatilsByQuestionId(questionId),
            this.getAnswerTypes()
        );
    }

    public getQuestionDeatilsByQuestionId(questionId) {
        let url = "api/qc-checklist/GetQuestionDetail?questionId=" + questionId;
        return this.httpService.Get(url).map(data => {
            let source = data.json();
            let question: Question;
            question = {
                questionId: source.questionId,
                checkListId: source.checkListId,
                versionId: source.versionId,
                sort: source.sortOrder,
                questionText: source.questionText,
                questionSubText: source.questionSubText,
                answerTypeName: source.answerTypeName,
                answerTypeId: source.answerTypeId,
                questionHelpText: source.questionHelpText,
                comment: source.canComment,
                inspection: source.printOnInspectReport,
                signature: source.requireSignature,
                picture: source.requiresPicture,
                rejectReport: source.printOnRejectReport

            };
            return question;
        })
    }

    public setQuestion(checkListId: number, questionId: number,
        versionId: number, answerTypeId: number, questionText: string,
        subText: string, helpText: string, sortOrder: number, canComment: boolean,
        requiresPicture: boolean, requireSignature: boolean, printOnInspectReport: boolean, printOnRejectReport: boolean) {
        let url = "api/qc-checklist/SetQuestionDetail";
        let body = {
            checklistId: checkListId,
            questionId: questionId,
            versionId: versionId,
            answerTypeId: answerTypeId,
            questionText: questionText,
            questionSubText: subText,
            questionHelpText: helpText,
            sortOrder: sortOrder,
            canComment: canComment,
            requiresPicture: requiresPicture,
            requireSignature: requireSignature,
            printOnInspectReport: printOnInspectReport,
            printOnRejectReport: printOnRejectReport
        }
        return this.httpService.Post(url, body);
    }

    public deleteQuestion(questionId: number) {
        let url = "api/qc-checklist/DeleteQuestion";
        let body = {
            questionId: questionId
        }
        return this.httpService.Post(url, body);
    }
    public getAnswerTypes() {
        let url = "api/qc-checklist/GetAnswerTypes";
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let types = res.answerTypes.map(answerRes => {
                let type: AnswerType;
                type = {
                    id: answerRes.answerTypeId,
                    name: answerRes.typeName
                }
                return type;
            })
            return types;
        })
    }





}