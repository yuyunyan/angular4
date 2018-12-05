import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlimScroll } from './slim-scroll/slim-scroll.directive';
//import { Widget } from './widget/widget.directive';
import { Skycon } from './skycon/skycon.directive';
import { Counter } from './counter/counter.directive';
import { LiveTile } from './live-tile/live-tile.directive';
import { ProgressAnimate } from './progress-animate/progress-animate.directive';
import { DropzoneUpload } from './dropzone/dropzone.directive';
import {WidgetDirectivesModule} from './widgetdirective.module';

@NgModule({
    imports: [ 
        CommonModule 
    ],
    declarations: [ 
        SlimScroll,
        Skycon,
        Counter,
        LiveTile,
        ProgressAnimate,
        DropzoneUpload
    ],
    exports: [ 
        SlimScroll,
        WidgetDirectivesModule,
        Skycon,
        Counter,
        LiveTile,
        ProgressAnimate,
        DropzoneUpload
    ]
})
export class DirectivesModule { }