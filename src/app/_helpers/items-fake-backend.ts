import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function contactAccountFBFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend) {

    let accountBasicOptions: any[] = [];

    backend.connections.subscribe((connection: MockConnection) => {
        let debugMode = true;      //TRUE uses fake backend
        setTimeout(() => {
            if (debugMode == true) {
                if (connection.request.url.endsWith('api/items/getItemsList') && connection.request.method == RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        status: 200,
                        body: {
                            isSuccess: true,
                            errorMessage: "",
                            manufacturer: "Dell",
                            manufacturerPartNumber: "1234",
                            commodity: "Goods",
                            status: "Active",
                            description: 'test',
                        }
                    })))
                    return;

                }
            }
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