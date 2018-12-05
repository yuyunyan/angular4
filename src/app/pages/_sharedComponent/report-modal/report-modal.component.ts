import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { Report } from './../../../_models/shared/report';
import { environment } from './../../../../environments/environment';
@Component({
  selector: 'report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
})
export class ReportModalComponent implements OnInit {
  @Input() reportUrl: string;
  @Input() cssSelectorClass: string = '';
  @Input() display: string = '';
  private modalParentClass: string = 'container-fluid'
  constructor() {}

  ngOnInit() {
  } 

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let reportUrl = changes["reportUrl"];
    let cssSelector = changes["cssSelectorClass"];
    let displayMode = changes["display"];
    //Check if css selector class has value and add it to parent class if so
    if (cssSelector && cssSelector.currentValue) {
      this.cssSelectorClass = cssSelector.currentValue;
      this.modalParentClass = this.modalParentClass + ' '  + this.cssSelectorClass;
    }
    if (displayMode && displayMode.currentValue) {
      this.display = displayMode.currentValue;
    }
    //Check if there are parameters before initiating modal open event
    if (reportUrl && reportUrl.currentValue) {
      let cssClass = '';
      
      //check if css class has value
      if (this.cssSelectorClass)
        cssClass = "." + this.cssSelectorClass + ' ';

      //on modal open (event)
      jQuery(cssClass + ".mdlReportViewer").on('shown.bs.modal', function () {

          //set report source
        this.reportUrl = environment.apiEndPoint + reportUrl.currentValue
        var iframeSrc = this.reportUrl;
        console.log('Report toggled: ' + iframeSrc, this.reportUrl);
        jQuery(cssClass + " .mdlReportViewer iframe").attr('src', iframeSrc)
        
          //show report visibility
        setTimeout(function () {
          jQuery(cssClass + ".mdlReportViewer iframe").css('visibility', 'visible')
        },250);
      })

      //on modal close (event)
      jQuery(cssClass + ".mdlReportViewer iframe").on('hidden.bs.modal', function () {
          //hide report visibility
        jQuery(cssClass + ".mdlReportViewer").css('visibility', 'hidden')
      });
    }
  }

}
