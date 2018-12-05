import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function contactAccountFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(()=> {
        
        // if (connection.request.url.includes('api/sales-order/getSalesOrderLines') && connection.request.method == RequestMethod.Get) {
            
        //     let parts=new Array();

        //     let total = 105;
        //     for(let i=1; i<=total; i++)
        //     {
        //           let part =  {
        //                         soLineId:i,
        //                         lineNo:i+1,
        //                         customerLineNo:2100+i,
        //                         partNumber:'Part'+i.toString(),  
        //                         manufacturer:'Part ' + i.toString() + ' manuf',
        //                         commodityId: 1,
        //                         customerPN:'PARTNUMBER' + +i.toString(),
        //                         quantity:2000,
        //                         price:2.25,
        //                         cost:14.00,
        //                         packagingId:2,
        //                         shipDate:'03/07/2017', 
        //                         dateCode:'1210123',
        //                         dueDate:'04/07/2017'
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

        //       if (connection.request.url.includes('api/quote/getSourceList') && connection.request.method == RequestMethod.Get) {
            
        //     let parts=new Array();

        //     let total = 105;
        //     for(let i=1; i<=total; i++)
        //     {
        //           let part =  {
        //                 sourceId: i,
        //                 sourceTypeId: 20,
        //                 typeName: 'type ' + i,
        //                 typeRank: i + i,
        //                 itemId: 1000 + i,
        //                 partNumber: '100' + i,
        //                 accountId: 5,
        //                 supplier: 'supplier A',
        //                 contactId: 1,
        //                 manufacturer: 'mfg B',
        //                 commodityId: 1,
        //                 commodityName: 'comm C',
        //                 qty: i * i,
        //                 cost: i * i + i / .423,
        //                 dateCode: 'Days ' + i,
        //                 packagingId: 1,
        //                 packagingName: 'Reel',
        //                 moq: '',
        //                 spq: '',
        //                 leadTimeDays: '2 days',
        //                 validForHours: '24 hours',
        //                 isMatched: false,
        //                 isJoined: false
        //                     }       

        //         parts.push(part);   
        //     }    
        //      connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: 
        //         {
        //              sourceResponse:parts
        //         }})));       
        //     return;
        // }

        if (connection.request.url.includes('api/quote/getPartList') && connection.request.method == RequestMethod.Get) {
            
            let parts=new Array();

            let total = 20;
            for(let i=1; i<=total; i++)
            {
                  let part =  {
                        sourceId: i,
                        sourceTypeId: 20,
                        typeName: 'type ' + i,
                        typeRank: i + i,
                        itemId: 1000 + i,
                        partNumber: '100' + i,
                        accountId: 5,
                        accountName: "Account Name A",
                        salesperson: "Bobby",
                        shipDate: "08/01/2017",
                        supplier: 'supplier A',
                        contactId: 1,
                        manufacturer: 'mfg B',
                        commodityId: 1,
                        commodityName: 'comm C',
                        qty: i * i,
                        cost: i * i + i / .423,
                        dateCode: 'Days ' + i,
                        packagingId: 1,
                        packagingName: 'Reel',
                        moq: '',
                        spq: '',
                        leadTimeDays: '2 days',
                        validForHours: '24 hours',
                        isMatched: false,
                        isJoined: false
                            }       

                parts.push(part);   
                console.log('parts...');
                console.log(parts);
            }    
             connection.mockRespond(new Response(new ResponseOptions({
                status: 200,
                body: 
                {
                     PartsList:parts
                }})));       
            return;
        }
         
        // if (connection.request.url.includes('api/sales-order/setSalesOrderLine') && connection.request.method == RequestMethod.Post) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             soLineId:1,
        //             lineNo:2,
        //             customerLineNo:2100,
        //             partNumber:'Part',  
        //             manufacturer:'Part',
        //             commodityId: 1,
        //             customerPN:'PARTNUMBER',
        //             quantity:2000,
        //             price:2.25,
        //             cost:14.00,
        //             packagingId:2,
        //             shipDate:'03/07/2017', 
        //             dateCode:'1210123',
        //             dueDate:'04/07/2017'
        //         }
        //     })))
        //     return;
        // }

        // if (connection.request.url.includes('api/salesorders/deleteParts') && connection.request.method == RequestMethod.Post) {
        //     connection.mockRespond(new Response(new ResponseOptions({
        //         status: 200,
        //         body: {
        //             errorMessage:''
        //         }
        //     })))
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

    console.log('returns contactAccount backend');
    return new Http(backend, options);
   
}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: contactAccountFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};