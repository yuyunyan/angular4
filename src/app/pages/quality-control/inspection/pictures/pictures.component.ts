import { Component, OnInit, Input, OnChanges, SimpleChange, ViewEncapsulation} from '@angular/core';
import { ProgressAnimate } from './../../../../theme/directives/progress-animate/progress-animate.directive';
import { DropzoneUpload } from './../../../../theme/directives/dropzone/dropzone.directive';
import { InspectionService }  from './../../../../_services/inspection.service';
import { Subject } from 'rxjs/Subject';
import { Image } from './../../../../_models/common/image';
import { NotificationsService } from 'angular2-notifications';
@Component({
  selector: 'az-pictures',
  templateUrl: './pictures.component.html',
  styleUrls: ['./pictures.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PicturesComponent implements OnInit {

  @Input() inspectionId:number;

  private images:any[];
  private previewImageUrl: string;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  
  constructor(private inspectionService: InspectionService, private _notificationsService: NotificationsService) { }

  ngOnInit() {
    this.images = new Array<Image>();
    this.showAdditionalImages();
  }

    showAdditionalImages()
    {

      this.inspectionService.getAdditionalImages(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      images => {
        this.images = images;
      },
      error => {}
    )
    }
PreviewImage(imgUrl) {
  this.previewImageUrl = imgUrl;

}
    imageFinishedUploading(event){
      let file = event.file;
      this.inspectionService.saveAdditionalImages(this.inspectionId, [file]).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
       
        let ret = data.json();
        if(ret.isSuccess){
          this.showAdditionalImages();
          this._notificationsService.success(
            'Success!',
            'Image uploaded!',
            {
              pauseOnHover: false,
              clickToClose: false
            }
          );
        }
        else {
          this._notificationsService.error(
            'Upload error!',
            ret.errorMessage,
            {
              pauseOnHover: false,
              clickToClose: false
            }
          );
        }
      },
      error => {}
    )
    }

    deleteImage(id:number){
      console.log('img ' + id + ' delete toggled')
     this.inspectionService.deleteImage(id).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        this.showAdditionalImages();
      },
      error => {}
      )
    }
    

}

