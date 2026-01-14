import { Component, inject, input, output } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { AsyncPipe } from '@angular/common';
import {
  combineLatest,
  debounceTime,
  firstValueFrom,
  fromEvent,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { ToolFabService } from './services/tool-fab.service';
import { NgxEditorJsBlock } from './ngx-editor-js2.interface';
import { ToolbarInlineService } from './services/toolbar-inline.service';
import { EditorJsService } from './services/editor-js.service';
import { NgxEditorJs2Service } from './services/ngx-editor-js2.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngx-editor-js2',
  imports: [EditorJsComponent, AsyncPipe],
  template: `
    <editor-js
      [blocks]="blocks()"
      [bootstrapEditorJs]="bootstrapEditorJs$ | async"
    ></editor-js>
  `,
})
export class NgxEditorJs2Component {
  inlineToolbarSerivce = inject(ToolbarInlineService);
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);

  constructor() {
    this.editorJsService.formGroup.valueChanges.pipe(
      takeUntilDestroyed(),
      debounceTime(500),
      switchMap(() => this.editorJsService.getBlocks$()),
      tap((blocks) => this.formChanged.emit(blocks))
    ).subscribe();
  }

  blocks = input<NgxEditorJsBlock[]>([]);

  // Allows the parent component to request the current blocks
  blocksRequested = output<Observable<NgxEditorJsBlock[]>>();
  requestBlocks = input.required({
    transform: (value: unknown) =>
      value && this.blocksRequested.emit(this.editorJsService.getBlocks$()),
  });

  // Tells the parent component when the form has changed
  formChanged = output<NgxEditorJsBlock[]>();


  bootstrapEditorJs$ = combineLatest([
    inject(ToolFabService).toolbarComponentRef$,
    this.ngxEditorJs2Service.loadBlocks$,
    fromEvent(document, 'selectionchange').pipe(
      debounceTime(200),
      switchMap((event) =>
        this.inlineToolbarSerivce.determineToDisplayInlineToolbarBlock(event)
      )
    )
  ]);
}
