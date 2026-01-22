import { Component, input, signal } from '@angular/core';
import { ControlAccessorDirective } from '../../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ToolbarFabDirective } from '../../directives/toolbar-fab.directive';
import { CleanPasteDataDirective } from '../../directives/clean-paste-data.directive';
import {
  BlockComponent,
  BlockOptionAction,
} from '../../ngx-editor-js2.interface';
import { NgClass } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';


@Component({
  selector: 'paragraph-block',
  host: { class: 'cdk-drag-animating' },
  hostDirectives: [CdkDrag],
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolbarFabDirective,
    CleanPasteDataDirective,
    NgClass,
  ],
  template: `
    <ng-container [formGroup]="formGroup()">
      <p
        controlAccessor
        contentEditable
        toolbarFab
        cleanPasteData
        [ngClass]="savedAction()"
        [defaultValue]="formGroup().get(formControlName())?.value"
        [actionCallback]="actionCallbackBind"
        [autofocus]="autofocus()"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
        [componentContextPositionIndex]="sortIndex()"
      ></p>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        .small {
          font: var(--mat-sys-body-small);
        }
        .medium {
          font: var(--mat-sys-body-medium);
        }
        .large {
          font: var(--mat-sys-body-large);
        }
        .title-small {
          font: var(--mat-sys-title-small);
        }
        .title-medium {
          font: var(--mat-sys-title-medium);
        }
        .title-large {
          font: var(--mat-sys-title-large);
        }
      }
    `,
  ],
})
export class ParagraphBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  componentInstanceName = 'ParagraphBlockComponent';
  autofocus = input<boolean>(true);
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  blockOptionActions = input<BlockOptionAction[]>([
    { action: 'small', icon: 'density_small' },
    { action: 'medium', icon: 'density_medium' },
    { action: 'large', icon: 'density_large' },
    { action: 'title-small', text: 'TS' },
    { action: 'title-medium', text: 'TM' },
    { action: 'title-large', text: 'TL' },
  ]);

  savedAction = signal<string>('medium');
  actionCallbackBind = this.actionCallback.bind(this);

  actionCallback(action: string, updateFormValue = true) {
    this.savedAction.update(() => action);
    updateFormValue && this.formGroup().updateValueAndValidity();
  }
}
