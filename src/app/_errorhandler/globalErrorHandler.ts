import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from './../_services/httpService';
import { ErrorManagementService } from './../_services/errorManagement.service';
import swal from 'sweetalert2';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private injector: Injector,
    private httpsService: HttpService,
    private errorManagementService: ErrorManagementService) {}

  handleError(error) {
    const message = error.originalStack ? error.originalStack : '' + error;
    if (error.status && error.status === 401) {
      const router = this.injector.get(Router);
      router.navigate(['/login'], { queryParams: { returnUrl: router.url }});
    } else {
      this.errorManagementService.handleApiError(new Error());
      this.logErrorDb(message).subscribe(res => {
        if (res.isSuccess){
          console.log("Error logged to database.")
        }
      });
      throw error;
    }
  }

  private logErrorDb(errorMessage){
    const url = 'api/error-logging/logToDb';
    return this.httpsService.Post(url, {errorMessage}).map(res => {
      let result = res.json();
      return result;
    });
  }
}
