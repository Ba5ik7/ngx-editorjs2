import {
  Component,
  effect,
  inject,
  input,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { EditorJsService } from '../services/editor-js.service';
import { NgxEditorJs2Service } from '../services/ngx-editor-js2.service';
import { NgxEditorJsBlock } from '../ngx-editor-js2.interface';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { lastValueFrom, tap } from 'rxjs';

@Component({
  selector: 'editor-js',
  imports: [CdkDropList],
  template: `
    <div cdkDropList class="block-list" (cdkDropListDropped)="drop($event)" >
      <ng-container #ngxEditor></ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        .block-list {
          min-height: 60px;
        }
      }
    `,
  ],
})
export class EditorJsComponent {
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);

  bootstrapEditorJs = input();
  blocks = input.required({
    transform: (value: NgxEditorJsBlock[]) =>
      this.ngxEditorJs2Service.blocksToLoad.next(value),
  });

  ngxEditor = viewChild.required('ngxEditor', { read: ViewContainerRef });

  constructor() {
    effect(() => {
      this.editorJsService.setNgxEditor(this.ngxEditor());
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    void lastValueFrom(
      this.editorJsService.moveBlockComponentPosition(
        event.previousIndex,
        event.currentIndex
      ).pipe(
        tap(() => this.editorJsService.formGroup.updateValueAndValidity())
      )
    );
  }
}
