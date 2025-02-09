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
import { NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'header-block',
  host: { class: 'cdk-drag-animating' },
  hostDirectives: [CdkDrag],
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolbarFabDirective,
    CleanPasteDataDirective,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
  ],
  template: `
    <ng-container [ngSwitch]="savedAction()">
      <h1 *ngSwitchCase="'h1'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h1>
      <h2 *ngSwitchCase="'h2'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h2>
      <h3 *ngSwitchCase="'h3'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h3>
      <h4 *ngSwitchCase="'h4'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h4>
      <h5 *ngSwitchCase="'h5'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h5>
      <h6 *ngSwitchCase="'h6'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h6>
    </ng-container>

    <ng-template [formGroup]="formGroup()" #sharedHeaderTemplate>
      <span
        controlAccessor
        cleanPasteData
        contentEditable
        toolbarFab
        [defaultValue]="formGroup().get(formControlName())?.value"
        [actionCallback]="actionCallbackBind"
        [blockOptionActions]="blockOptionActions()"
        [autofocus]="autofocus()"
        [formControlName]="formControlName()"
        [componentContextPositionIndex]="sortIndex()"
      ></span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        :is(h1, h2, h3, h4, h5, h6) {
          margin: 0;
          span {
            display: block;
            line-height: inherit;
          }
        }

        h1 > * {
          font: var(--mat-sys-display-large);
        }
        h2 > * {
          font: var(--mat-sys-display-medium);
        }
        h3 > * {
          font: var(--mat-sys-display-small);
        }
        h4 > * {
          font: var(--mat-sys-headline-large);
        }
        h5 > * {
          font: var(--mat-sys-headline-medium);
        }
        h6 > * {
          font: var(--mat-sys-headline-small);
        }
      }
    `,
  ],
})
export class HeaderBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  componentInstanceName = 'HeaderBlockComponent';
  autofocus = input<boolean>(true);
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  blockOptionActions = input<BlockOptionAction[]>([
    { action: 'h1', text: 'H1' },
    { action: 'h2', text: 'H2' },
    { action: 'h3', text: 'H3' },
    { action: 'h4', text: 'H4' },
    { action: 'h5', text: 'H5' },
    { action: 'h6', text: 'H6' },
  ]);

  savedAction = signal<string>('h1');
  actionCallbackBind = this.actionCallback.bind(this);

  actionCallback(selectedAction: string) {
    this.savedAction.set(selectedAction);
  }
}
