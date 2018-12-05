import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function contactAccountFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(()=> {
        
        /*if (connection.request.url.includes('api/quote/getQuoteHeader') && connection.request.method == RequestMethod.Get) {
            connection.mockRespond(new Response(new ResponseOptions({
                status: 200,
                body: {
                    errorMessage: "",
                    quoteTotal: "1,000.00",
                    quoteCost: "100.00",
                    grossProfit: "100.00",
                    margin:"100.00"
                }
            })))
            return;
        }*/


        //  if (connection.request.url.includes('api/quote/getQuoteExtra') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             extraListResponse:[
        //                 {
        //                     quoteExtraId: 1,
        //                     lineNum: 1,    
        //                     refLineNum: 1,
        //                     extraName: 'Fedex Shipping',
        //                     note: '',
        //                     qty: 1,
        //                     price: 100,
        //                     cost: 25.23,
        //                     gpm: 0,
        //                     printOnQuote: false,
        //                     isDelete: false
        //                 },
        //                 {
        //                     quoteExtraId: 2,
        //                     lineNum: 2,    
        //                     refLineNum: 1,
        //                     extraName: 'Fedex Shipping',
        //                     note: '',
        //                     qty: 1,
        //                     price: 100,
        //                     cost: 25.23,
        //                     gpm: 0,
        //                     printOnQuote: false,
        //                     isDelete: false
        //                 }
        //             ]    
        //         }
        //     })))
        //     return;
        // }
        // if (connection.request.url.includes('api/quote/getCommodities') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             commodities:[
        //                 {
        //                     id:1,
        //                     name: 'com 1'
        //                 },
        //                 {
        //                     id:2,
        //                     name: 'com 2'
        //                 },
        //                 {
        //                     id:3,
        //                     name: 'com 3'
        //                 },
        //                 {
        //                     id:4,
        //                     name: 'com 4'
        //                 },
        //                 {
        //                     id:5,
        //                     name: 'com 5'
        //                 },
        //                 {
        //                     id:6,
        //                     name: 'com 6'
        //                 },
        //                 {
        //                     id:7,
        //                     name: 'com 7'
        //                 },
        //                 {
        //                     id:8,
        //                     name: 'com 8'
        //                 },
        //                 {
        //                     id:9,
        //                     name: 'com 9'
        //                 },
        //                 {
        //                     id:10,
        //                     name: 'com 10'
        //                 },
        //                 {
        //                     id:11,
        //                     name: 'com 11'
        //                 },
        //                 {
        //                     id:12,
        //                     name: 'com 12'
        //                 },
        //                 {
        //                     id:13,
        //                     name: 'com 13'
        //                 },
        //                 {
        //                     id:14,
        //                     name: 'com 14'
        //                 },
        //                 {
        //                     id:15,
        //                     name: 'com 15'
        //                 },
        //                 {
        //                     id:16,
        //                     name: 'com 16'
        //                 },
        //                 {
        //                     id:17,
        //                     name: 'com 17'
        //                 },
        //                 {
        //                     id:18,
        //                     name: 'com 18'
        //                 },
        //                 {
        //                     id:19,
        //                     name: 'com 19'
        //                 },
        //                 {
        //                     id:20,
        //                     name: 'com 20'
        //                 },
        //                 {
        //                     id:21,
        //                     name: 'com 21'
        //                 },
        //                 {
        //                     id:22,
        //                     name: 'com 22'
        //                 },
        //                 {
        //                     id:23,
        //                     name: 'com 23'
        //                 },
        //                 {
        //                     id:24,
        //                     name: 'com 24'
        //                 },
        //                 {
        //                     id:25,
        //                     name: 'com 25'
        //                 },
        //                 {
        //                     id:26,
        //                     name: 'com 26'
        //                 },
        //                 {
        //                     id:27,
        //                     name: 'com 27'
        //                 },
        //                 {
        //                     id:28,
        //                     name: 'com 28'
        //                 },
        //                 {
        //                     id:29,
        //                     name: 'com 29'
        //                 },
        //                 {
        //                     id:30,
        //                     name: 'com 30'
        //                 },
        //                 {
        //                     id:31,
        //                     name: 'com 31'
        //                 },
        //                 {
        //                     id:32,
        //                     name: 'com 32'
        //                 },
        //                 {
        //                     id:33,
        //                     name: 'com 33'
        //                 },
        //                 {
        //                     id:34,
        //                     name: 'com 34'
        //                 },
        //                 {
        //                     id:35,
        //                     name: 'com 35'
        //                 },
        //                 {
        //                     id:36,
        //                     name: 'com 36'
        //                 },
        //                 {
        //                     id:37,
        //                     name: 'com 37'
        //                 },
        //                 {
        //                     id:38,
        //                     name: 'com 38'
        //                 }
        //             ]
        //         }
        //     })))
        //     return;
        //     }

        //  if (connection.request.url.includes('api/quote/getPackagingTypes') && connection.request.method == RequestMethod.Get) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             packaging:[
        //                 {
        //                     id:1,
        //                     name:'packaging 1'
        //                 },
        //                 {
        //                     id:2,
        //                     name:'packaging 2'
        //                 },
        //                 {
        //                     id:3,
        //                     name:'packaging 3'
        //                 },
        //                 {
        //                     id:4,
        //                     name:'packaging 4'
        //                 }
        //             ]
        //         }
        //     })))
        //     return;
        // }

    //     if (connection.request.url.includes('api/quote/setQuoteExtra') && connection.request.method == RequestMethod.Post) {
    //         let body = connection.request.getBody();
    //         const { QuoteExtraId, isDelete } = JSON.parse(body);

    //         let extraListResponse = [
    //             {
    //                 quoteExtraId: 1,
    //                 lineNum: 1,    
    //                 refLineNum: 1,
    //                 extraName: 'Fedex Shipping',
    //                 note: '',
    //                 qty: 1,
    //                 price: 100,
    //                 cost: 25.23,
    //                 gpm: 0,
    //                 printOnQuote: false,
    //                 isDeleted: false
    //             },
    //             {
    //                 quoteExtraId: 2,
    //                 lineNum: 2,    
    //                 refLineNum: 1,
    //                 extraName: 'Fedex Shipping',
    //                 note: '',
    //                 qty: 1,
    //                 price: 100,
    //                 cost: 25.23,
    //                 gpm: 0,
    //                 printOnQuote: false,
    //                 isDeleted: false
    //             }
    //         ];

    //         console.log('QuoteExtraId', QuoteExtraId);    
    //         if (!QuoteExtraId) {
    //             extraListResponse.push({
    //                 quoteExtraId: 3,
    //                 lineNum: 3,    
    //                 refLineNum: 1,
    //                 extraName: 'Fedex Shipping',
    //                 note: '',
    //                 qty: 1,
    //                 price: 100,
    //                 cost: 25.23,
    //                 gpm: 0,
    //                 printOnQuote: false,
    //                 isDeleted: false
    //             });
    //         } else {
    //             const extraItemIndex = extraListResponse.findIndex(extra => extra.quoteExtraId === QuoteExtraId);
    //             extraListResponse[extraItemIndex].isDeleted = true;
    //         }

    //         console.log(extraListResponse);
            
    //         connection.mockRespond(new Response(new ResponseOptions({
    //             status: 200,
    //             body: {
    //                 extraListResponse: extraListResponse
    //             }
    //         })))
    //         return;
    // }

        // if (connection.request.url.includes('api/quote/setPartsDetails') && connection.request.method == RequestMethod.Post) {
        //     //let body = connection.request.getBody();
            
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //                         quoteLineId:9999,
        //                         lineNo:20,
        //                         customerLineNo:1,
        //                         partNumber:'changed partnumber 1',
        //                         manufacture:'changed Part 1 manuf',
        //                         commodityId: 1,
        //                         customerPN:'PARTNUMBER1',
        //                         quantity:1000,
        //                         price:1.25,
        //                         cost:10.00,
        //                         gpm:20.00,
        //                         packagingId:1,
        //                         shipDate:'02/06/2017', 
        //                         dateCode:'1210123',  
        //                         alternates:
        //                             [
        //                                 {
        //                                     lineNo:11,
        //                                     customerLineNo:11200,
        //                                     partNumber:'changed P 1 alt 1',
        //                                     manufacture:'changed p 1 alt man 1',
        //                                     commodityId: 2,
        //                                     customerPN:'PARTNUMBER1 alt 1',
        //                                     quantity:2000,
        //                                     price:2.50,
        //                                     cost:12.00,
        //                                     gpm:15.00,
        //                                     packagingId:3,
        //                                     shipDate:'03/06/2017',
        //                                     dateCode:'1210123',  
        //                                 },
        //                                 {
        //                                     lineNo:12,
        //                                     customerLineNo:12300,
        //                                     partNumber:'changed P 1 alt 2',
        //                                     manufacture:'changed  p 1 alt man 2',
        //                                     commodityId: 2,
        //                                     customerPN:'PARTNUMBER1 alt 1',
        //                                     quantity:2000,
        //                                     price:2.50,
        //                                     cost:12.00,
        //                                     gpm:15.00,
        //                                     packagingId:3,
        //                                     shipDate:'03/06/2017',
        //                                     dateCode:'1210123',    
        //                                 }
        //                             ]
        //         }
        //     })))
        //     return;
        // }

        // if (connection.request.url.includes('api/quote/deleteParts') && connection.request.method == RequestMethod.Post) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             success:true
        //           }
        //     })))
        //     return;
        // }
        
        //  if (connection.request.url.includes('api/quote/getPartList') && connection.request.method == RequestMethod.Get) {

        //     let parts=new Array();

        //     let total = 105;
        //     for(let i=1; i<=total; i++)
        //     {
        //           let part =  {
        //                         quoteLineId:i,
        //                         lineNo:i+1,
        //                         customerLineNo:2100+i,
        //                         partNumber:'Part'+i.toString(),  
        //                         manufacture:'Part ' + i.toString() + ' manuf',
        //                         commodityId: 1,
        //                         customerPN:'PARTNUMBER' + +i.toString(),
        //                         quantity:2000,
        //                         price:2.25,
        //                         cost:14.00,
        //                         gpm:70.00,
        //                         packagingId:2,
        //                         shipDate:'03/07/2017', 
        //                         dateCode:'1210123',   
        //                          alternates:
        //                              [
        //                                 {
        //                                     quoteLineId:51,
        //                                     lineNo:21,
        //                                     customerLineNo:2200,
        //                                     partNumber:'P 2 alt 1',
        //                                     manufacture:'p 2 alt man 1',
        //                                     commodityId: 2,
        //                                     customerPN:'PARTNUMBER2 alt 1',
        //                                     quantity:3000,
        //                                     price:3.50,
        //                                     cost:22.00,
        //                                     gpm:25.00,
        //                                     packagingId:1,
        //                                     shipDate:'05/07/2017',
        //                                     dateCode:'1210123',    
        //                                 },
        //                                 {
        //                                     quoteLineId:52,
        //                                     lineNo:22,
        //                                     customerLineNo:2300,
        //                                     partNumber:'P 2 alt 2',
        //                                     manufacture:'p 2 alt man 2',
        //                                     commodityId: 3,
        //                                     customerPN:'PARTNUMBER2 alt 2',
        //                                     quantity:5000,
        //                                     price:1.50,
        //                                     cost:30.00,
        //                                     gpm:22.00,
        //                                     packagingId:2,
        //                                     shipDate:'07/07/2017',
        //                                     dateCode:'1210123',    
        //                                 }
        //                              ]
        //                     }       

        //         parts.push(part);   
        //     }    
        //      connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: 
        //         {
        //              partList:parts
        //         }})));       
        //     return;
        // }
        
        let realHttp = new Http(realBackEnd, options);
        let requestOptions = new RequestOptions({
            method: connection.request.method,
            headers: connection.request.headers,
            body: connection.request.getBody(),
            url: connection.request.url,
            withCredentials: connection.request.withCredentials,
            responseType: connection.request.responseType
        });
        realHttp.request(connection.request.url, requestOptions)
            .subscribe((response: Response) => {
                connection.mockRespond(response);
            },
            (error: any) => {
                connection.mockError(error);
            });
    }, 0);

});

    // console.log('returns contactAccount backend');
    return new Http(backend, options);
   
}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: contactAccountFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};
