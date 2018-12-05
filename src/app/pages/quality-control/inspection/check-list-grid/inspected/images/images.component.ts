import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange, Output, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular/main";
import { AgEditorComponent } from "ag-grid-angular/dist/interfaces";
import { NotificationsService } from 'angular2-notifications';
@Component({
  selector: 'az-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImagesComponent implements OnInit {

  private params:any;
  @Input() customParams: any;
  private modalPopupId:string;
  private modalPopupTargetId:string;
  private carouselId:string;
  private images:any[];
  private parent:any;
  private imageCount:number;
  public notifyOptions = {
    position: ['top', 'right'],
    timeout: 5000,
    lastOnBottom: true
  };
  @ViewChild('imgUpload') imgUploadEl: ElementRef;

  constructor(private _notificationsService: NotificationsService) { }

  ngOnInit() {
    this.initializeModalClearEvent(this);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let customParamsChanged = changes["customParams"];
    if (customParamsChanged && customParamsChanged.currentValue) {
      this.agInit(customParamsChanged.currentValue)
    }
  }

  agInit(params: any): void {
    if (params) {
      this.params = params;
      this.modalPopupId = 'mdlImagesComponent' + params.data.id;
      //this.modalPopupTargetId = '#' + this.modalPopupId;
      this.carouselId = 'carousel'+ params.data.id;
      this.parent = this.params.context.parentComponent;
      this.imageCount = params.data.imageCount;
      if (this.params.data.id)
        this.showImages()
    }
  }

  refresh?(params: any): void {
    
  }
  
  initializeModalClearEvent(self){
    jQuery('.images-modal').on('hidden.bs.modal', function () {
      self.images = []    //reset carousel
      var clearToggle = jQuery('.images-modal .clear.button');
      clearToggle.click();   //toggle clear button on modal close
    });
  }

  onKeyDown(event):void {
    
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39 ||  // left
            key == 38||  // up
            key == 40) {  // down
            event.stopPropagation(); 
        }
    }

    showImages()
    {
      let parent = this.params.context.parentComponent;
      parent.inspectionService.getImagesForAnswer(this.params.data.answerId,this.params.data.inspectionId).takeUntil(parent.ngUnsubscribe.asObservable()).subscribe(
      images => {
       
        this.images = images;
        //jQuery(this.modalPopupTargetId).modal('toggle');
        //$('#myModal').modal('show');
        //$('#myModal').modal('hide');
      },
      error => {}
    )
    }

    imageFinishedUploading(event){
      let file = event.file;
      let parent = this.params.context.parentComponent;
      parent.inspectionService.saveImageAnswer(this.params.data.answerId, this.params.data.inspectionId, [file]).takeUntil(parent.ngUnsubscribe.asObservable()).subscribe(
      data => {
        let ret = data.json();
        if(ret.isSuccess){
          this.showImages();
          this.imageCount++;
          this.params.data.imageCount++
          parent.loadChecklistsQuestions();
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
      error => {
      }
    )
    }

    deleteImage(id:number){
     this.parent.inspectionService.deleteImage(id).takeUntil(this.parent.ngUnsubscribe.asObservable()).subscribe(
      data => {
        this.showImages();
        this.imageCount--;
        this.parent.loadChecklistsQuestions();
      },
      error => {}
      )
    }
    
  ngOnDestroy(): void {
    
  }

}
