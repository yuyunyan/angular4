import { NotificationsService } from 'angular2-notifications';

export class SapSyncNotifier
{
    constructor(private _notificationsService: NotificationsService){}
    showNotification(data:any)
    {    
    if(!data.errorMessage)
    {
    this._notificationsService.success(
        'Transaction Pending',
        data.transactionId,
        {
        pauseOnHover: true,
        clickToClose: false
        }
    )
    }
    else{
        this._notificationsService.error(
        'Sync was not initiated',
         data.errorMessage,
        {
            pauseOnHover: true,
            clickToClose: false
        }
        )
    }
    }
}