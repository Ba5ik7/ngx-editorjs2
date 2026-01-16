import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgxEditorJs2Component } from 'ngx-editor-js2';
import { AppService } from '../services/app.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-document',
  imports: [MatCard, MatCardContent, NgxEditorJs2Component, AsyncPipe],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content>
        <ngx-editor-js2
          [blocks]="(appService.ngxEditorJsBlocks$ | async)!"
          [requestBlocks]="appService.requestBlocks$ | async"
          (blocksRequested)="appService.handleBlocks($event)"
          (formChanged)="formChanged($event)"
        ></ngx-editor-js2>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        @include mat.card-overrides(
          (
            outlined-outline-width: 0.5px,
            outlined-container-color: var(--mat-sys-surface-container-low),
            outlined-outline-color: var(--mat-sys-on-surface),
          )
        );
      }
    `,
  ],
})
export class DocumentComponent {
  appService = inject(AppService);

  formChanged(blocks: any) {
    console.log('DocumentComponent - formChanged', blocks);
  }
}
