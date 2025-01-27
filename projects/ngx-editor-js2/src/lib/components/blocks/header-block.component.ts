import { Component, input } from '@angular/core';
import {
  BlockComponent,
  BlockOptionAction,
} from '../../services/editor-js.service';
import { ControlAccessorDirective } from '../../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ToolFabDirective } from '../../directives/tool-fab.directive';
import { CleanPasteDataDirective } from '../../directives/clean-paste-data.directive';

@Component({
  selector: 'header-block',
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolFabDirective,
    CleanPasteDataDirective,
  ],
  template: `
    <ng-container [formGroup]="formGroup()">
      <h1
        toolFab
        contentEditable
        appControlAccessor
        cleanPasteData
        [autofocus]="autofocus()"
        [actionCallback]="actionCallback"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
      ></h1>
    </ng-container>
  `,
  styles: [
    `
      :host {
        position: relative;
      }
    `,
  ],
})
export class HeaderBlockComponent implements BlockComponent {
  autofocus = input<boolean>(false);
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

  actionCallback() {
    console.log('In da Component!');
  }
}
