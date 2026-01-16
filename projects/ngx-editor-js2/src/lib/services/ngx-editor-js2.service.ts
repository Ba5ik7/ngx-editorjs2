import { inject, Injectable, InjectionToken, Type } from '@angular/core';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';
import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
import {
  BehaviorSubject,
  combineLatest,
  delay,
  exhaustMap,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';
import { EditorJsService } from './editor-js.service';
import {
  NgxEditorjsOptions,
  NgxEditorJsBlock,
  NgxEditorJsBlockWithComponent,
  SupportedBlock,
  BlockComponent,
} from '../ngx-editor-js2.interface';

export const NGX_EDITORJS_OPTIONS = new InjectionToken<NgxEditorjsOptions>(
  'NGX_EDITORJS_OPTIONS'
);

@Injectable({
  providedIn: 'root',
})
export class NgxEditorJs2Service {
  editorJsService = inject(EditorJsService);

  consumerSupportedBlocks = new BehaviorSubject<SupportedBlock[]>(
    inject(NGX_EDITORJS_OPTIONS, { optional: true })?.consumerSupportedBlocks ??
      []
  );

  internalSupportedBlocks = new BehaviorSubject<SupportedBlock[]>([
    {
      name: 'Paragraph',
      component: ParagraphBlockComponent,
      componentInstanceName: 'ParagraphBlockComponent',
    },
    {
      name: 'Header',
      component: HeaderBlockComponent,
      componentInstanceName: 'HeaderBlockComponent',
    },
  ]);

  supportedBlocks$ = combineLatest([
    this.internalSupportedBlocks.asObservable(),
    this.consumerSupportedBlocks.asObservable(),
  ]).pipe(map(([internal, consumer]) => [...internal, ...consumer]));

  blocksToLoad = new BehaviorSubject<NgxEditorJsBlock[]>([]);

  loadBlocks$ = this.blocksToLoad.asObservable().pipe(
    delay(0),
    exhaustMap((blocks) => this.clearBlocksFromEditorJs(blocks)),
    map(([blocks]) => this.determineToloadDefaultBlocks(blocks)),
    map((blocks) => this.removeDuplicateBlocksWithSameIds(blocks)),
    map((blocks) => this.sortBlocks(blocks)),
    switchMap((blocks) => this.combineSupportBlocks(blocks)),
    map(([blocks, supportedBlocks]) =>
      this.createALookupMapForSupportedBlocks(blocks, supportedBlocks)
    ),
    map(({ blocks, supportedBlocksMap }) =>
      this.findAndMarshalBlocksComponent(blocks, supportedBlocksMap)
    ),
    mergeMap((blocks) =>
      this.addBlocksToEditorJs(blocks).pipe(map(() => blocks))
    )
  );

  clearBlocksFromEditorJs(blocks: NgxEditorJsBlock[]) {
    return forkJoin([of(blocks), this.editorJsService.clearBlocks()]);
  }

  determineToloadDefaultBlocks(blocks: NgxEditorJsBlock[]) {
    return blocks.length > 0 ? blocks : this.loadDefaultBlocks();
  }

  loadDefaultBlocks() {
    return [
      {
        blockId: 'tmdjr',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: "Let's get started... 🚀",
        savedAction: 'h1',
      },
    ];
  }

  removeDuplicateBlocksWithSameIds(blocks: NgxEditorJsBlock[]) {
    return Array.from(
      new Map(blocks.map((block) => [block.blockId, block])).values()
    );
  }

  sortBlocks(blocks: NgxEditorJsBlock[]) {
    return blocks.sort((a, b) => a.sortIndex - b.sortIndex);
  }

  combineSupportBlocks(blocks: NgxEditorJsBlock[]) {
    return combineLatest([of(blocks), this.supportedBlocks$]);
  }

  createALookupMapForSupportedBlocks(
    blocks: NgxEditorJsBlock[],
    supportedBlocks: SupportedBlock[]
  ) {
    return {
      blocks,
      supportedBlocksMap: new Map(
        supportedBlocks.map((sb) => [sb.componentInstanceName, sb.component])
      ),
    };
  }

  findAndMarshalBlocksComponent(
    blocks: NgxEditorJsBlock[],
    supportedBlocksMap: Map<string, Type<BlockComponent>>
  ) {
    return blocks.map((block) => ({
      ...block,
      component:
        supportedBlocksMap.get(block.componentInstanceName) ??
        HeaderBlockComponent,
    }));
  }

  addBlocksToEditorJs(blocks: NgxEditorJsBlockWithComponent[]) {
    return combineLatest(
      blocks.map((block: NgxEditorJsBlockWithComponent) =>
        this.editorJsService.addBlockComponent(block, false)
      )
    );
  }
}
