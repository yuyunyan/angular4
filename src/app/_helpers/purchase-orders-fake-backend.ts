import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function purchaseOrderFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(() => {

            // if (connection.request.url.includes('api/purchase-order/getPurchaseOrderExtras') && connection.request.method == RequestMethod.Get) {
            
            //     const poExtras = [{
            //         poExtraId: 1,
            //         lineNum: 1,
            //         refLineNum: 1,
            //         extraName: 'Item 1',
            //         itemExtraId: 1,
            //         note: 'Note',
            //         qty: 12,
            //         price: 13.5,
            //         cost: 6,
            //         printOnPO: true
            //     },
            //     {
            //         poExtraId: 2,
            //         lineNum: 2,
            //         refLineNum: 2,
            //         extraName: 'Item 4',
            //         itemExtraId: 4,
            //         note: 'Notea',
            //         qty: 2,
            //         price: 3.525,
            //         cost: 0.857,
            //         printOnPO: true
            //     }];

            //     connection.mockRespond(new Response(new ResponseOptions({
            //         status: 200,
            //         body: 
            //         {
            //             poExtras: poExtras
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
    console.log('returns contactAccount backend');
    return new Http(backend, options);
}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: purchaseOrderFBFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};
