# Ngx-EditorJs2

DEMO - With blocks: [https://ba5ik7.github.io/ngx-editor-js2-blocks](https://ba5ik7.github.io/ngx-editor-js2-blocks)

DEMO: [https://ba5ik7.github.io/ngx-editorjs2](https://ba5ik7.github.io/ngx-editorjs2)

## Overview
Ngx-EditorJs2 is an Angular-based, highly extensible block-style editor inspired by Editor.js. It allows users to create and manage rich text content using a variety of customizable blocks while leveraging Angular's reactive capabilities.

### Supports
- Angular 20+
- For legacy Angular support, use [ngx-editorjs](https://github.com/Ba5ik7/ngx-editorjs)

## Features
- 📝 **Modular Block System** – Supports paragraph, header, and other content blocks.
- 🔄 **Reactive Data Streams** – Uses RxJS for efficient state management.
- 🎛 **Drag & Drop** – Easily reorder blocks with smooth animations.
- ✍ **Inline Toolbar** – Provides text formatting options when selecting text.
- 🔧 **Customizable** – Easily extendable with new block types and actions.

## Installation
To install Ngx-EditorJs2, run:

```sh
npm install @tmdjr/ngx-editor-js2
```

### Adding via Angular CLI (Recommended)

To quickly set up Ngx-EditorJs2 with optional blocks, use Angular's `ng add` command:

```sh
ng add @tmdjr/ngx-editor-js2
```

This command will prompt you to select optional blocks and will handle the installation, configuration updates to `angular.json`, global styles, and your application's configuration (`app.config.ts`).


## Usage
Import the Component into your Angular Standalone Component:

```ts
import { NgxEditorJs2Component } from '@tmdjr/ngx-editor-js2';

@Component({
  selector: 'some-component',
  imports: [NgxEditorJs2Component],
  template: `
    <ngx-editor-js2
      [blocks]="initialBlocks"
      [requestBlocks]="requestBlocks"
      (blocksRequested)="handleBlocks($event)">
    </ngx-editor-js2>
  `,
})
```
- Implementation found in the [Demo Src](https://github.com/Ba5ik7/ngx-editor-js2-blocks/blob/main/projects/demo/src/app/app.component.ts)


## API
### **Inputs**
| Property      | Type                        | Description |
|--------------|----------------------------|-------------|
| `blocks`     | `NgxEditorJsBlock[]` \| `null`      | List of blocks to initialize the editor with. |
| `requestBlocks` | `any` | When the value changes `blocksRequested` will emit the current state of the blocks. |

### **Outputs**
| Property      | Type                        | Description |
|--------------|----------------------------|-------------|
| `blocksRequested` | `NgxEditorJsBlock[]` | Emits the current state of blocks in the Form Group. Trigger when the `requestBlocks` value changes

## Block Components
Ngx-EditorJs2 comes with built-in block components:
- **ParagraphBlockComponent** – Standard text block.
- **HeaderBlockComponent** – Allows different heading levels.

You can also add custom blocks by implementing the `NGX_EDITORJS_OPTIONS` provider:

```ts
import { NGX_EDITORJS_OPTIONS } from '@tmdjr/ngx-editor-js2';
import { NgxEditorJs2ImageComponent } from '@tmdjr/ngx-editor-js2-image';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: NGX_EDITORJS_OPTIONS,
      useValue: {
        consumerSupportedBlocks: [
          {
            // Customize the block name.
            name: 'Image',
            component: NgxEditorJs2ImageComponent,
            // Must match the component name.
            componentInstanceName: 'NgxEditorJs2ImageComponent',
          },
        ],
      },
    },
  ],
};
```

## 📦 Custom Blocks for Ngx-EditorJs2

Ngx-EditorJs2 allows you to extend its functionality with custom blocks. Below are some additional components that can be installed separately to enhance the editor with images, blockquotes, and code blocks.

### 🖼️ Image Block
Easily add and manage images within the editor.

- **Component:** `NgxEditorJs2ImageComponent`
- **Install:**
  ```sh
  npm install @tmdjr/ngx-editor-js2-image
  ```
- **Package:** [@tmdjr/ngx-editor-js2-image](https://www.npmjs.com/package/@tmdjr/ngx-editor-js2-image)

---

### 📝 Blockquotes Block
Insert styled blockquotes to emphasize key points in the content.

- **Component:** `NgxEditorJs2BlockquotesComponent`
- **Install:**
  ```sh
  npm install @tmdjr/ngx-editor-js2-blockquotes
  ```
- **Package:** [@tmdjr/ngx-editor-js2-blockquotes](https://www.npmjs.com/package/@tmdjr/ngx-editor-js2-blockquotes)

---

### 💻 Code Block
Embed syntax-highlighted code snippets using CodeMirror.

- **Component:** `NgxEditorJs2CodemirrorComponent`
- **Install:**
  ```sh
  npm install @tmdjr/ngx-editor-js2-codemirror
  ```
- **Package:** [@tmdjr/ngx-editor-js2-codemirror](https://www.npmjs.com/package/@tmdjr/ngx-editor-js2-codemirror)

---

### 🌐 MFE Loader Block
Dynamically load and embed micro-frontends using Module Federation.

- **Component:** `NgxEditorJs2MfeLoaderComponent`
- **Install:**
  ```sh
  npm install @tmdjr/ngx-editor-js2-mfe-loader
  ```
- **Package:** [@tmdjr/ngx-editor-js2-mfe-loader](https://www.npmjs.com/package/@tmdjr/ngx-editor-js2-mfe-loader)

---

### 🧩 MermaidJS Block
Embed interactive Mermaid diagrams for flowcharts, graphs, and more.

- **Component:** `NgxEditorJs2MermaidjsComponent`
- **Install:**
  ```sh
  npm install @tmdjr/ngx-editor-js2-mermaidjs
  ```
- **Package:** [@tmdjr/ngx-editor-js2-mermaidjs](https://www.npmjs.com/package/@tmdjr/ngx-editor-js2-mermaidjs)

---

### 🧐 Pop Quiz Block
Create engaging quizzes within your content for interactive learning.

- **Component:** `NgxEditorJs2PopQuizComponent`
- **Install:**
  ```sh
  npm install @tmdjr/ngx-editor-js2-pop-quiz
  ```
- **Package:** [@tmdjr/ngx-editor-js2-pop-quiz](https://www.npmjs.com/package/@tmdjr/ngx-editor-js2-pop-quiz)

---

For more details and documentation, visit the [official repository](https://github.com/Ba5ik7/ngx-editor-js2-blocks).



## Development
To contribute, clone the repository and install dependencies:

```sh
git clone git@github.com:Ba5ik7/ngx-editorjs2.git
cd ngx-editorjs2
npm i
```

Build the library:

```sh
npm run build-ngx-editor-js2
```

Run the development server:
If you want to live reload the library, run the following commands in succession:

```sh
npm run watch-ngx-editor-js2 // Important to run 1st
npm run start-demo
```

*Custom Block development should be done in the [Ngx-Editor-Js2-Blocks](https://github.com/Ba5ik7/ngx-editor-js2-blocks) MonoRepo.*


## Architecture Overview
Ngx-EditorJs2 is built on Angular's reactive architecture, using RxJS to manage state and data streams. The library is composed of several Services and Directives that handle different aspects of the editor:
```mermaid
graph TD;
  NgxEditorJs2Component -->|Contains| EditorJsComponent;
  EditorJsComponent -->|Handles Blocks| ParagraphBlockComponent;
  EditorJsComponent -->|Handles Blocks| HeaderBlockComponent;
  NgxEditorJs2Component -->|Uses Service| NgxEditorJs2Service;
  EditorJsComponent -->|Uses Service| EditorJsService;
  EditorJsService -->|Manages| BlockMovementService;
  EditorJsService -->|Manages| ToolFabService;
  EditorJsComponent -->|Uses Toolbar| ToolbarComponent;
  ToolbarComponent -->|Has| ToolbarBlocksComponent;
  ToolbarComponent -->|Has| ToolbarBlockOptionsComponent;
  EditorJsComponent -->|Uses| ToolbarInlineComponent;
```

## Services
| Service                   | Purpose |
|---------------------------|---------|
| `NgxEditorJs2Service`     | Manages available block types and loaded blocks. |
| `EditorJsService`         | Handles block rendering and form controls. |
| `BlockMovementService`    | Manages drag-and-drop & reordering. |
| `ToolbarInlineService`    | Manages inline text formatting. |
| `ToolFabService`          | Provides contextual toolbars for block actions. |

## Creating a Custom Block Component
Ngx-EditorJs2 follows a structured approach where each block component:
- **Implements the `BlockComponent` interface** to ensure consistency.
- **Uses `hostDirectives`** to inherit required behaviors such as drag-and-drop.
- **Uses `host` CSS classes** to apply styling and animations.
- **Uses a `formGroup`**, which integrates with the larger form structure that holds all blocks.

For a complete walkthrough see [docs/custom-blocks-tutorial.md](docs/custom-blocks-tutorial.md).

### **How Blocks Work in Ngx-EditorJs2**
Each block in Ngx-EditorJs2 is part of a larger **`formGroup`**, allowing seamless state management across the entire editor. This design ensures that:
- Each block maintains its own **FormControl**, enabling real-time data binding.
- The **editor-level formGroup** acts as a centralized store, making it easier to retrieve or modify block data.
- Blocks can **interact with services and directives**, enhancing their capabilities dynamically.

*Custom Block development should be done in the [Ngx-Editor-Js2-Blocks](https://github.com/Ba5ik7/ngx-editor-js2-blocks) MonoRepo.*

## License
MIT License © 2025 [Wesley DuSell](https://github.com/ba5ik7)

