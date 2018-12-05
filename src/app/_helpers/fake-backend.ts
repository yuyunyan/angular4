import {Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';


export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions, realBackEnd: XHRBackend){
      
     let users:any[] =  [];

      backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(()=> {
            if(connection.request.url.endsWith('token'))
            {
                var requestBody = connection.request.json();
                
                 connection.mockRespond(new Response(new ResponseOptions({
                        status: 200,
                        body: {
                            
                            access_token: "uolzOBuUq3WuDMwkBPHOsQvxRqY9EI3a83CDFVJ8j8AYCdtgw3z8OGELdzkiIGMggY6ogmKchd17dMUZOVLwl9VUiLljaBF9DbSrjoN9cZFiDQlAFwvHG4qjqjEauQP_CTsEr9x--RLkkPJi9fazbkAnUmnqMLSMqRDdEN8sPX5L0RcuUNBKHVuAi-StsXBtwbxJWA70wUy4bmtZr7qp6zLqbC812Z5nnxG1VBvUW2A",
                            token_type: "bearer",
                            displayusername: "Manuka",
                            expires_in:86399
                        }
                    })));
                    return;
            }

            if(connection.request.url.endsWith('/api/users') && connection.request.method=== RequestMethod.Post)
            {
                  //get new user object from post body 
                  let newUser = JSON.parse(connection.request.getBody());
                  var requestBody = connection.request.json();
                 
                  //validation
                //   let duplicateUser = users.filter(user=>{return user.username === newUser.username;}).length;
                //   if(duplicateUser){
                //       return connection.mockError(new Error('userName is already taken'));
                //   }

                //   newUser.id= users.length +1;
                  users.push(newUser);
                  localStorage.setItem('users', JSON.stringify(users));

                  connection.mockRespond(new Response(new ResponseOptions({ status:200,
                      body:{
                          success:true,
                          failureMessage:'',
                          user:{
                              id:'456',
                              name:requestBody.name,
                              email:requestBody.email,
                              password:requestBody.password
                          }
                      }
                   })));

                  return;
            }

            // if(connection.request.url.endsWith('/user/getrolelist') && connection.request.method=== RequestMethod.Get)
            // {
            //     //get new user object from post body 
            //       console.log('in fake');
            //       connection.mockRespond(new Response(new ResponseOptions({ status:200,
            //           body:{
            //                 isSuccess:true,
            //                 errorMessage:"error",
            //                 data:
            //                 [
            //                     {	roleId: 1,
            //                         roleName: "Account Owner",
            //                         type: "Account"
            //                     },
            //                     {	roleId: 2,
            //                         roleName: "Account Access",
            //                         type: "Navigation"
            //                     }
            //                 ]
            //         	}
            //        })));

            //       return;
            // }

            // if(connection.request.url.includes('/user/getroledetails') && connection.request.method=== RequestMethod.Get)
            // {
            //     //get new user object from post body 
            //       if(connection.request.url.includes('roleId=1'))
            //       {
            //       connection.mockRespond(new Response(new ResponseOptions({ status:200,
            //           body:{
            //                 isSuccess:true,
            //                 errorMessage:"",
            //                 data:
            //                 {	
            //                     permissions:[
            //                         {	
            //                             id : 1,
            //                             name:"Merge Accounts",
            //                             description: "Merge",
            //                             selectedForRole:true
            //                         },
            //                         {
            //                             id : 1,
            //                             name:"Change credit",
            //                             description: "desc",
            //                             selectedForRole:false
            //                         },
            //                         {
            //                             id : 1,
            //                             name:"ASDF",
            //                             description: "desc 2",
            //                             selectedForRole:true
            //                         }
                                    
            //                     ],
            //                     fields:[
            //                         {
            //                             id:1,
            //                             name:"Account Name",
            //                             selectedForRole:true,
            //                             isEditable:false
            //                         },
            //                         {
            //                             id:2,
            //                             name:"Phone",
            //                             selectedForRole:true,
            //                             isEditable:true
            //                         },
            //                         {
            //                             id:3,
            //                             name:"Address",
            //                             selectedForRole:false,
            //                             isEditable:false
            //                         }
            //                     ],
            //                     navigationLinks:
            //                     [
            //                         {
            //                             id: 123,
            //                             name: "Contacts & Accounts",
            //                             isLink: true,
            //                             selectedForRole:true,
            //                             childNodes: 
            //                             [
            //                                 {	
            //                                     id: 123,
            //                                     name: "Contacts Details",
            //                                     isLink: true,
            //                                     selectedForRole:false,
            //                                     childNodes:[]
            //                                 },
            //                                 {
            //                                     id: 456,
            //                                     name: "Accounts Details",
            //                                     isLink: false,
            //                                     selectedForRole:true,
            //                                     childNodes:[]
            //                                 }
            //                             ]				
            //                         },
            //                         {
            //                             id: 123,
            //                             name: "User security",
            //                             isSelected: true,
            //                             isLink: true,
            //                             selectedForRole:false,
            //                             childNodes: []			
            //                         }
            //                     ]
		    //                 }
            //         	}
            //        })));
            //     }
            //     else{
            //         connection.mockRespond(new Response(new ResponseOptions({ status:200,
            //           body:{
            //                 isSuccess:true,
            //                 errorMessage:"",
            //                 data:
            //                 {	
            //                     permissions:[
            //                         {	
            //                             id : 1,
            //                             name:"Merge Accounts 2",
            //                             description: "Merge 2",
            //                             selectedForRole:false
            //                         },
            //                         {
            //                             id : 1,
            //                             name:"Change credit 2",
            //                             description: "desc 2",
            //                             selectedForRole:true
            //                         },
            //                         {
            //                             id : 1,
            //                             name:"ASDF 2",
            //                             description: "desc 2",
            //                             selectedForRole:true
            //                         }
                                    
            //                     ],
            //                     fields:[
            //                         {
            //                             id:1,
            //                             name:"Account Name 2",
            //                             selectedForRole:false,
            //                             isEditable:false
            //                         },
            //                         {
            //                             id:2,
            //                             name:"Phone 2",
            //                             selectedForRole:true,
            //                             isEditable:false
            //                         },
            //                         {
            //                             id:3,
            //                             name:"Address 2",
            //                             selectedForRole:true,
            //                             isEditable:true
            //                         }
            //                     ],
            //                     navigationLinks:
            //                     [
            //                         {
            //                             id: 123,
            //                             name: "Contacts & Accounts 2",
            //                             isLink: true,
            //                             selectedForRole:true,
            //                             childNodes: 
            //                             [
            //                                 {	
            //                                     id: 123,
            //                                     name: "Contacts Details 2",
            //                                     isLink: true,
            //                                     selectedForRole:true,
            //                                     childNodes:[]
            //                                 },
            //                                 {
            //                                     id: 456,
            //                                     name: "Accounts Details 2",
            //                                     isLink: false,
            //                                     selectedForRole:false,
            //                                     childNodes:[]
            //                                 }
            //                             ]				
            //                         },
            //                         {
            //                             id: 123,
            //                             name: "User security",
            //                             isSelected: true,
            //                             isLink: true,
            //                             selectedForRole:true,
            //                             childNodes: []			
            //                         }
            //                     ]
		    //                 }
            //         	}
            //        })));
            //     }

            //       return;
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

        },500);
        
    });
    console.log('returns backend');
    return new Http(backend, options);
}

export let fakeBackEndProvider = {
    provide: Http,
    useFactory: fakeBackendFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};