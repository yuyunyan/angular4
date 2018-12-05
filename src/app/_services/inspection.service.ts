import { Injectable} from '@angular/core';
import { HttpService } from './httpService';
import { CheckList, Question } from './../_models/quality-control/inspection/checkList';
import { InspectionDetails } from './../_models/quality-control/inspection/inspectionDetails';
import { Image } from './../_models/common/image';
import { environment } from './../../environments/environment';
import { Conclusion } from './../_models/quality-control/inspection/conclusion'; 
import { InspectionGridItem,InspectionCustomers,InspectionSalesOrder} from './../_models/quality-control/inspection/inspectionGridItem'; 
import { ItemBreakdown, BreakdownLine } from './../_models/quality-control/inspection/itemBreakdown';
import { List } from 'linqts';
import { QCResult} from './../_models/quality-control/inspection/qcResult';
import { Http, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SharedService } from './../_services/shared.service';


@Injectable()
export class InspectionService
{
    private apiUrl:string;

    constructor(private httpService: HttpService, private http: Http,private sharedService: SharedService){
         this.apiUrl = environment.apiEndPoint; 
    }

    GetInspectionDetails(inspectionId: number) {
        let url = 'api/qc-inspection/getInspectionDetails?inspectionId=' + inspectionId;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let insDetails = new InspectionDetails();
                insDetails = {
                    InspectionID: res.inspectionId,    
                    InventoryID: res.inventoryId,
                    UserID: res.userId,
                    ItemID: res.itemId,
                    QtyFailed: res.qtyFailed,
                    CompletedBy: res.completedBy,
                    CompletedByUser: res.completedByUser,
                    CompletedDate: res.completedDate,
                    CreatedBy: res.createdBy,
                    CreatedDate: res.createdDate,
                    POLineID: res.PoLineId,
                    Qty: res.qty,
                    DateCode: res.dateCode,
                    PackagingID: res.packagingId,
                    CommodityID: res.commodityId,
                    ItemStatusID: res.itemstatusID,
                    PartNumber: res.partNumber,
                    PartNumberStrip: res.partNumberStrip,
                    MfrName: res.mfrName,
		            PartDescription: res.partDescription,
		            WarehouseName: res.warehouseName,
		            CustomerAccount: res.customerAccount,
		            VendorAccount: res.vendorAccount,
                    LotNumber: res.lotNumber,
                    QCNotes : res.qcNotes,
                    CustomerAccountID: res.customerAccountId,
                    VendorAccountID: res.vendorAccountId,
                    ItemQty: res.itemQty,
                    SalesOrderID:res.salesOrderID,
                    SOVersionID:res.soVersionID,
                    PurchaseOrderID:res.purchaseOrderID,
                    POVersionID:res.poVersionID,
                    ResultID:res.resultID,
                    ExternalID: res.externalID,
                    poExternalID: res.poExternalID,
                    soExternalID: res.soExternalID,
                    inspectionTypeName: res.inspectionTypeName,
                    vendorType: res.vendorType,
                    answerPhotoCount: res.answerPhotoCount,
                    additionalPhotoCount: res.additionalPhotoCount
                }
                return insDetails;
            }
        )
    }

GetInspectionConclusion(inspectionId: number) {
        let url = 'api/qc-inspection/getInspectionConclusion?inspectionId=' + inspectionId;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let con = new Conclusion();
                con = {
                    InventoryId: res.inventoryId,
                    LotTotal: res.lotTotal,
                    QtyPassed: res.qtyPassed,
                    QtyFailedTotal: res.qtyFailedTotal,
                    Introduction: res.introduction,
                    TestResults: res.testResults,
                    Conclusion: res.conclusion,
                    InspectionQty:res.inspectionQty
                }
                return con;
            }
        )
    }

SetInspectionConclusion(inspectionID: number,conclusion: string, stockDetails:any) {
    let url = 'api/qc-inspection/setInspectionConclusion';
    let body = {
        InspectionID: inspectionID,
        Conclusion: conclusion,
        StockDetailsList: stockDetails
    }
    return this.httpService.Post(url, body);
}

    getCheckLists(inspectionId:number) {
        
        let url = 'api/inspection/getCheckLists?inspectionId=' + inspectionId;
        return this.httpService.Get(url).map(
            data => {
                
                let res = data.json();
                    
                let checkLists = res.checkLists.map(checkListRes =>
                {
                    let questions = checkListRes.questions.map(questionRes =>{
                        
                        let question: Question;
                        question= {
                            id:questionRes.id,
                            answerId:questionRes.answerId,
                            number: questionRes.number,
                            text:questionRes.text,
                            subText:questionRes.subText,
                            answerTypeId:questionRes.answerTypeId,
                            answer:questionRes.answer,
                            qtyFailed:questionRes.qtyFailed,
                            showQtyFailed: questionRes.showQtyFailed,
                            imageCount:questionRes.imageCount,
                            comments:questionRes.comments,
                            inspected:questionRes.inspected,
                            canComment: questionRes.canComment,
                            completedDate: questionRes.completedDate,
                            requiresPicture: questionRes.requiresPicture
                        }
                        return question;
                    });
                    
                    let checkList:CheckList;
                    checkList = {
                        id : checkListRes.id,
                        name:checkListRes.name,
                        questions:questions,
                        addedByUser:checkListRes.addedByUser,
                        completedCount: this.checklistCompletedTotal(questions),//checkListRes.filter(question=>{return question.completedDate != null;}).length
                    }
                    return checkList;
                });
                
                return checkLists;
            }, 
            error => {
                console.log("CheckLists service call failed");
            }
        )
    }

    getAvailableCheckLists(inspectionId:number){
       let url='api/inspection/getAvailableCheckLists?inspectionId='+inspectionId;
       return this.httpService.Get(url).map(
           data=>{
               let res= data.json();
               let aCheckLists = new Array<CheckList>();
               res.checkLists.forEach(element => {
                   aCheckLists.push({
                       id:element.id,
                       name:element.name
                   })
               });
               return aCheckLists;
           }
       )
    }
    
    
    checklistCompletedTotal(questions) {
        let count = 0;
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].completedDate != null && questions[i].completedDate != '')
                count++
        }
        console.log('checklist count',count);
        return count;
  }
  
    getAdditionalImages(inspectionId: number)
    {
        
        let url = 'api/images/getAdditionalImages?inspectionId=' + inspectionId;
        return this.httpService.Get(url).map(
            data => {
                
                let res = data.json();
                
                let images = res.files.map(imageRes => {
                            let image:Image;
                            url = this.apiUrl + "/" + imageRes.url;
                            image={
                                id : imageRes.id,
                                url : url
                            }
                            return image;
                        });
                    return images;
            }, 
            error => {
                console.log("Additional Photos service call failed");
            }
        )
    }

    getImagesForAnswer(answerId: number, inspectionId)
    {
        
        let url = 'api/images/getAnswerImages?inspectionId=' + inspectionId + '&answerId=' + answerId;
        return this.httpService.Get(url).map(
            data => {
                
                let res = data.json();
                
                let images = res.files.map(imageRes => {
                            let image:Image;
                            url = this.apiUrl + "/" + imageRes.url;
                            image={
                                id : imageRes.id,
                                url : url
                            }
                            return image;
                        });
                    return images;
            }, 
            error => {
                console.log("Answer Images service call failed");
            }
        )
    }

    saveAdditionalImages(inspectionId, files:File[])
    {
        let url = 'api/images/saveInspectionImage?inspectionId=' + inspectionId;
        let formData: FormData = new FormData();
        files.forEach(file => {
            formData.append(file.name, file, file.name);
        });
        
        return this.httpService.PostImage(url, formData)
    }


    saveImageAnswer(answerId, inspectionId, files:File[])
    {
        let url = 'api/images/saveAnswerImage?answerId='+answerId+'&inspectionId='+ inspectionId;
        let formData: FormData = new FormData();
        files.forEach(file => {
            formData.append(file.name, file, file.name);
        });
        
        return this.httpService.PostImage(url, formData)
    }

     deleteImage(imageId)
    {
        let url = 'api/images/deleteImage?imageId='+imageId;
        return this.httpService.Post(url, {});
    }

    saveAnswer(answerId, answer, qtyFailed, comments,inspected){
        let url = 'api/inspection/saveAnswer';
        let body = {
            answerId : answerId, 
            answer : answer, 
            qtyFailed : qtyFailed, 
            comments : comments,
            inspected: inspected
        }
        return this.httpService.Post(url, body);
    }

    getInspectionList(searchString: string, rowOffset: number, rowLimit: number, sortCol: string, descSort: boolean)
    {
        let sortColumnName: string;

        switch(sortCol){
            case 'inventoryId':
                sortColumnName = 'InventoryId';
                break;
            case 'itemId':
                sortColumnName = 'ItemId';
                break;
            case 'supplier':
                sortColumnName = 'Supplier';
                break;
            case 'poNumber':
                sortColumnName = 'PoNumber';
                break;
            case 'customers':
                sortColumnName = 'Customers';
                break;
            case 'status':
                sortColumnName = 'Status';
                break;
            case 'receivedDate':
                sortColumnName = 'ReceivedDate';
                break;
            case 'shipDate':
                sortColumnName = 'ShipDate';
                break;
            case 'inspectionType':
                sortColumnName = 'InspectionType';
            break;
            case 'warehouse':
                sortColumnName = 'warehouseName'
            default:
                sortColumnName = '';
        };

        let url = 'api/inspection/getInspectionList?searchString=' + (searchString? encodeURIComponent(searchString): '') + '&rowOffset=' + rowOffset + '&rowLimit=' + rowLimit + '&sortCol=' + sortColumnName + '&descSort=' + descSort;

        return this.httpService.Get(url).map(
            data => {
                ``
                let res = data.json();   
                let inspectionList = res.inspectionList.map(inspectionRes =>
                {
                    let customers= inspectionRes.customers.map(customerRes=>{
                         let accountNames:InspectionCustomers;
                         accountNames={
                             accountName:customerRes.accountName
                         }
                         return accountNames;
                    })

                    let salesOrders= inspectionRes.salesOrders.map(soRes=>{
                        let so:InspectionSalesOrder;
                        so={
                            salesOrderID:soRes.salesOrderID,
                            externalID:soRes.externalID
                        }
                        return so;
                    })
                                   
                    let inspectionGridItem: InspectionGridItem;
                    inspectionGridItem= {
                        inspectionId: inspectionRes.inspectionId,
                        itemId: inspectionRes.iItemId,
                        supplier: inspectionRes.supplier,
                        poNumber: inspectionRes.poNumber,
                        customers:inspectionRes.customers,
                        salesOrders:salesOrders,
                        statusName: inspectionRes.statusName,
                        inspectionTypeId: inspectionRes.inspectionTypeId,
                        inspectionTypeName: inspectionRes.inspectionTypeName,
                        inventoryId: inspectionRes.inventoryId,
                        stockExternalId :inspectionRes.stockExternalId,
                        receivedDate: inspectionRes.receivedDate,
                        shipDate: inspectionRes.shipDate,
                        warehouse: inspectionRes.warehouseName,
                        poVersionID:inspectionRes.poVersionID,
                        accountId:inspectionRes.accountId,
                        poExternalId:inspectionRes.poExternalId
                        
                    }
                    return inspectionGridItem;
                });

                return { inspectionList: inspectionList, rowCount:res.rowCount };
            }, 
            error => {
                console.log("Inspection list service call failed");
            }
        )
        
    }

 saveChecklistForInspection(inspectionId:number,checklistId:number){
     let url ="api/inspection/saveChecklistForInpection";
     let body ={
        InspectionID:inspectionId,
        CheckListID:checklistId
     }
     return this.httpService.Post(url,body).map(data=>{
         let res = data.json();
         return res;
     });
 }

 deleteChecklistForInspection(inspectionId:number,checklistId:number){
     let url = "api/inspection/deleteChecklistForInpection";
     let body = {
         InspectionID: inspectionId,
         CheckListID: checklistId
     }
     return this.httpService.Post(url, body).map(data => {
         let res = data.json();
         return res;
     });
 }

 getQuantityScore(){
     let url ="api/inspection/getQCResults";
     return this.httpService.Get(url).map(
         data=>{
           let res= data.json();
           let quantityScoreList = new Array<QCResult>();
           res.results.forEach(element => {
            quantityScoreList.push({
                id:element.id,
                name:element.name
            })
           });
           return quantityScoreList;
     })
 }
 updateQuantityScore(inspectionId:number,resultID:number){
     let url="api/inspection/updateQCResult";
     let body={
        InspectionID:inspectionId,
        resultID:resultID
     }
     return this.httpService.Post(url,body).map(data=>{
         let res= data.json();
         return res;
     })
    }
    
    getStockWithBreakdownsList(inspectionId: number) {
        let url ='api/inspection/getStockWithBreakdownsList?inspectionId=' + inspectionId;
        return this.httpService.Get(url).map(
            data=>{
                let res= data.json();
                let stockBreakdowns = new Array<ItemBreakdown>();
                let indexCount = 0;
                res.itemStockList.forEach(element => {
                    //append breakdown lines to array
                    let breakdownLines = new Array<BreakdownLine>();
                    element.ItemStockBreakdownList.forEach(line => {
                        breakdownLines.push({
                            breakdownId: line.breakdownId,
                            stockId: line.stockId,
                            isDiscrepant: line.isDiscrepant,
                            packQty: line.packQty,
                            numPacks: line.numPacks,
                            dateCode: line.dateCode,
                            packagingId: line.packagingId,
                            conditionId: line.packageConditionId,
                            mfrLotNum: line.mfrLotNum,
                            countryId: line.coo,
                            expirationDate: line.expiry? line.expiry.split('T')[0]: ''
                    })
 
                    //Loop through StockBreakdown properties w/ breakdownLine array
                    })
                    stockBreakdowns.push({
                        index: indexCount,
                        itemStockId: element.ItemStockID,
                        poLineId: element.POLineID,
                        itemId: element.ItemID,
                        quantity: element.Qty,
                        warehouseBinId: element.WarehouseBinID,
                        displayWarehouseBinId: element.WarehouseBinID,
                        warehouseId: element.WarehouseID,
                        packagingTypeId: element.PackagingID,
                        mfrLotNum: element.MfrLotNum,
                        conditionId: element.PackageConditionID,
                        countryId: element.COO,
                        dateCode: element.DateCode,
                        receivedDate: element.ReceivedDate,
                        expirationDate: element.Expiry? element.Expiry.split('T')[0]: '',
                        isRejected: element.IsRejected,
                        invStatusID: element.InvStatusID,
                        stockDescription: element.StockDescription,
                        inspectionWarehouseId: element.InspectionWarehouseID,
                        externalId: element.ExternalID,
                        acceptedBinId: element.AcceptedBinID,
                        acceptedBinName: element.AcceptedBinName,
                        rejectedBinId: element.RejectedBinID,
                        rejectedBinName: element.RejectedBinName,
                        itemStockBreakdownList: breakdownLines
                        //for //BreakdownLine
                    })
                    //Create fake index
                    indexCount++;                    
                });
                return stockBreakdowns;
            }
        )
    }
    setItemStock(inspectionId: number = null, itemStockDetails: ItemBreakdown ) {
        let url ="api/inspection/setItemStock";
        let body ={
           inspectionId:inspectionId,
           stockId: itemStockDetails.itemStockId,
           warehouseBinId: itemStockDetails.warehouseBinId,
           packagingTypeId: itemStockDetails.packagingTypeId,
           packageConditionId: itemStockDetails.conditionId,
           poLineId: itemStockDetails.poLineId,
           mfrLotNum : itemStockDetails.mfrLotNum,
           itemId: itemStockDetails.itemId,
           invStatusId: itemStockDetails.invStatusID,
           stockDescription: itemStockDetails.stockDescription,
           externalId: itemStockDetails.externalId,
           coo: itemStockDetails.countryId,
           dateCode: itemStockDetails.dateCode,
           expiry: itemStockDetails.expirationDate,
           receivedDate: itemStockDetails.receivedDate,
           isRejected: itemStockDetails.isRejected
        }
        return this.httpService.Post(url,body).map(data=>{
            let res = data.json();
            return res;
        });
    }

    deleteItemStock(stockId: number){
        let url ="api/inspection/deleteItemStock";
        let body ={
           stockId: stockId
        }
        return this.httpService.Post(url,body).map(data=>{
            let res = data.json();
            return res;
        });
    }
    setBreakdownLine(line: BreakdownLine, breakdownId: number, isDeleted: boolean = false) {
        
        const regex = /[^0-9]/g;
        let url = 'api/inspection/setItemStockBreakdown';
        let body =  {
            stockBreakdownId: breakdownId,
            stockId: line.stockId,
            isDiscrepant: line.isDiscrepant,
            isDeleted: isDeleted,
            packQty: line.packQty,
            mfrLotNum : line.mfrLotNum,
            numPacks: line.numPacks,
            dateCode: line.dateCode,
            coo: line.countryId,
            packageConditionId: line.conditionId,
            packagingTypeId: line.packagingId,
            expiry: line.expirationDate
        }
        return this.httpService.Post(url, body).map(
            data => {
                let res = data.json();
                return res;
            }
        );
        // return this.httpService.Post(url, body).map(
        //     data =>
        //     { return this.mapToDomain(data.json()); },
        //     error => { return error.json(); }
        // );
    }
    
    syncInspectionToSap(inspectionId){
        let url="api/qcinspection/sync?inspectionId="+inspectionId;
        return this.httpService.Post(url,null).map(data=>{
            let res= data.json();
            console.log("InspectionService-qcinspectionSYNC",res);
            return res;
        })
       
    }

    exportConclusionReport(inspectionId){
        let url="api/inspection/exportConclusionReport?inspectionId="+inspectionId;
        return this.httpService.Get(url,null).map(data=>{
            let res= data.json();
            return res;
        })
       
    }
    exportInspectionReport(inspectionId, param){
        let url="api/inspection/exportInspectionReport?inspectionId="+inspectionId + '&acceptedDiscrepant=' + param.acceptedDiscrepant + '&rejectedDiscrepant=' + param.rejectedDiscrepant + '&qtyFailed=' + param.qtyFailed + '&qtyPassed=' + param.qtyPassed + '&apiUrl=' + param.apiUrl;
        return this.httpService.Get(url,null).map(data=>{
            let res= data.json();
            return res;
        })
       
    }

    exportFinalInspectionReport(inspectionId, param){
        let url="api/inspection/exportFinalInspectionReport?inspectionId="+inspectionId + '&acceptedDiscrepant=' + param.acceptedDiscrepant + '&rejectedDiscrepant=' + param.rejectedDiscrepant + '&qtyFailed=' + param.qtyFailed + '&qtyPassed=' + param.qtyPassed + '&apiUrl=' + param.apiUrl;
        return this.httpService.Get(url,null).map(data=>{
            let res= data.json();
            return res;
        })
       
    }
    
    downloadFile(url, fileName) {
        return this.http
          .get(url, {
            responseType: ResponseContentType.Blob,
          })
          .map(res => {
            return {
              filename: fileName,
              data: res.blob()
            };
          })
          .subscribe(res => {
              console.log('start download:',res);
              var url = window.URL.createObjectURL(res.data);
              var a = document.createElement('a');
              document.body.appendChild(a);
              a.setAttribute('style', 'display: none');
              a.href = url;
              a.download = res.filename;
              a.click();
              window.URL.revokeObjectURL(url);
              a.remove(); // remove the element
            }, error => {
              console.log('download error:', JSON.stringify(error));
            }, () => {
              console.log('Completed file download.')
            });
        }

        getInspectionRelatedData(){
            return Observable.forkJoin(
                this.sharedService.getWarehouses(),
                this.sharedService.getPackagingTypes(),
                this.sharedService.getConditionTypes(),
                this.sharedService.getCountryList()
            )
        }
}