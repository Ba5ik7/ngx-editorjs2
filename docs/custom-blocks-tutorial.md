# Creating a Custom Block

This tutorial explains how block components work in **Ngx-EditorJs2** and demonstrates how you can register and load your own.

## Block Component Structure

All blocks implement the `BlockComponent` interface which defines the required inputs and signals. The interface is defined in `projects/ngx-editor-js2/src/lib/ngx-editor-js2.interface.ts`:

```ts
export interface BlockComponent {
  sortIndex: InputSignal<number>;
  componentInstanceName: string;
  formControlName: InputSignal<string>;
  formGroup: InputSignal<FormGroup>;
  blockOptionActions: InputSignal<BlockOptionAction[]>;
  savedAction: Signal<string>;
  actionCallback?: (string: string) => void;
}
```

The built-in paragraph and header blocks located in `projects/ngx-editor-js2/src/lib/components/blocks/` follow this structure. They use `hostDirectives` such as `CdkDrag` to enable drag‑and‑drop and expose a `formGroup`/`formControlName` pair for integration with the editor level form.

## Building a Simple Custom Block

Below is a minimal block component. It attaches `CdkDrag` via `hostDirectives`, defines a form control, and stores the last selected action in the `savedAction` signal:

```ts
import { Component, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { BlockComponent, BlockOptionAction } from '@tmdjr/ngx-editor-js2';

@Component({
  selector: 'custom-block',
  host: { class: 'cdk-drag-animating' },
  hostDirectives: [CdkDrag],
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div [formGroup]="formGroup()">
      <div [formControlName]="formControlName()"></div>
    </div>
  `,
})
export class CustomBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  componentInstanceName = 'CustomBlockComponent';
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  autofocus = input<boolean>(true);
  blockOptionActions = input<BlockOptionAction[]>([]);

  savedAction = signal('');
}
```

## Registering the Block

Use the `NGX_EDITORJS_OPTIONS` provider to register the new block so the editor knows how to create it:

```ts
import { ApplicationConfig } from '@angular/core';
import { NGX_EDITORJS_OPTIONS } from '@tmdjr/ngx-editor-js2';
import { CustomBlockComponent } from './custom-block.component';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: NGX_EDITORJS_OPTIONS,
      useValue: {
        consumerSupportedBlocks: [
          {
            name: 'Custom',
            component: CustomBlockComponent,
            componentInstanceName: 'CustomBlockComponent',
          },
        ],
      },
    },
  ],
};
```

## Loading the Block in an Application

A service can be used to supply initial blocks and handle editor output. Below is a condensed example similar to the demo service:

```ts
@Injectable({ providedIn: 'root' })
export class EditorService {
  blocks = new BehaviorSubject<NgxEditorJsBlock[]>([]);
  blocks$ = this.blocks.asObservable();

  requestBlocks = new BehaviorSubject({});
  requestBlocks$ = this.requestBlocks.asObservable();

  handleBlocks(blocks$: Observable<NgxEditorJsBlock[]>) {
    void lastValueFrom(blocks$); // persist or inspect data here
  }
}
```

You can then load the custom block in a component:

```ts
@Component({
  selector: 'my-editor',
  standalone: true,
  imports: [NgxEditorJs2Component, AsyncPipe],
  template: `
    <ngx-editor-js2
      [blocks]="(service.blocks$ | async)!"
      [requestBlocks]="service.requestBlocks$ | async"
      (blocksRequested)="service.handleBlocks($event)"
    ></ngx-editor-js2>
  `,
})
export class MyEditorComponent {
  constructor(public service: EditorService) {}
}
```

This setup registers your block and displays it in the editor alongside the built-in blocks.
