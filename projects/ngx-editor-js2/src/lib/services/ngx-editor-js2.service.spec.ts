import { TestBed } from '@angular/core/testing';
import {
  NgxEditorJs2Service,
  NGX_EDITORJS_OPTIONS,
} from './ngx-editor-js2.service';
import { EditorJsService } from './editor-js.service';
import { SupportedBlock, NgxEditorJsBlock } from '../ngx-editor-js2.interface';
import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';
import { of } from 'rxjs';
import { NgxEditorJsBlockWithComponent } from 'ngx-editor-js2';

describe('NgxEditorJs2Service', () => {
  let service: NgxEditorJs2Service;
  let editorJsServiceMock: MockedObject<EditorJsService>;

  beforeEach(() => {
    editorJsServiceMock = {
      clearBlocks: vi.fn().mockReturnValue(of(null)),
      addBlockComponent: vi.fn().mockImplementation((block) => of(block)),
    } as unknown as MockedObject<EditorJsService>;

    TestBed.configureTestingModule({
      providers: [
        NgxEditorJs2Service,
        { provide: EditorJsService, useValue: editorJsServiceMock }
      ],
    });

    service = TestBed.inject(NgxEditorJs2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default internal supported blocks and empty consumer supported blocks', (done) => {
    service.consumerSupportedBlocks.subscribe((blocks) => {
      expect(blocks).toEqual([]);
      done();
    });
  });

  it('should initialize with default internal supported blocks', (done) => {
    service.supportedBlocks$.subscribe((blocks) => {
      expect(blocks).toEqual([
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
      done();
    });
  });

  it('should load default blocks when no blocks are provided', () => {
    const result = service.determineToloadDefaultBlocks([]);
    expect(result).toEqual([
      {
        blockId: 'tmdjr',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: "Let's get started... 🚀",
        savedAction: 'h1',
      },
    ]);
  });

  it('should not load default blocks when blocks are provided', () => {
    const blocks: NgxEditorJsBlock[] = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
    ];

    const result = service.determineToloadDefaultBlocks(blocks);
    expect(result).toEqual(blocks);
  });

  it('should remove duplicate blocks by blockId', () => {
    const blocks: NgxEditorJsBlock[] = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
      {
        blockId: '2',
        sortIndex: 1,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
    ];

    const uniqueBlocks = service.removeDuplicateBlocksWithSameIds(blocks);
    expect(uniqueBlocks.length).toBe(2);
    expect(uniqueBlocks).toEqual([
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
      {
        blockId: '2',
        sortIndex: 1,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
    ]);
  });

  it('should sort blocks by sortIndex', () => {
    const blocks: NgxEditorJsBlock[] = [
      {
        blockId: '2',
        sortIndex: 2,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
      {
        blockId: '3',
        sortIndex: 1,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
    ];

    const sortedBlocks = service.sortBlocks(blocks);
    expect(sortedBlocks).toEqual([
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
      {
        blockId: '3',
        sortIndex: 1,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
      {
        blockId: '2',
        sortIndex: 2,
        componentInstanceName: 'ParagraphBlockComponent',
        dataClean: '',
      },
    ]);
  });

  it('should create a lookup map for supported blocks', () => {
    const blocks: NgxEditorJsBlock[] = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
    ];

    const supportedBlocks: SupportedBlock[] = [
      {
        name: 'Header',
        componentInstanceName: 'HeaderBlockComponent',
        component: HeaderBlockComponent,
      },
    ];

    const { blocks: resultBlocks, supportedBlocksMap } =
      service.createALookupMapForSupportedBlocks(blocks, supportedBlocks);

    expect(resultBlocks).toEqual(blocks);
    expect(supportedBlocksMap.get('HeaderBlockComponent')).toBe(
      HeaderBlockComponent
    );
  });

  it('should find and marshal block components correctly', () => {
    const blocks: NgxEditorJsBlock[] = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
      {
        blockId: '2',
        sortIndex: 1,
        componentInstanceName: 'UnknownComponent',
        dataClean: '',
      },
    ];

    const supportedBlocksMap = new Map<string, any>([
      ['HeaderBlockComponent', HeaderBlockComponent],
    ]);

    const marshalledBlocks = service.findAndMarshalBlocksComponent(
      blocks,
      supportedBlocksMap
    );

    expect(marshalledBlocks[0].component).toBe(HeaderBlockComponent);
    expect(marshalledBlocks[1].component).toBe(HeaderBlockComponent); // Fallback to default
  });

  it('should call addBlockComponent for each block', (done) => {
    const blocks = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
        component: HeaderBlockComponent,
      },
    ];

    service.addBlocksToEditorJs(blocks).subscribe(() => {
      expect(editorJsServiceMock.addBlockComponent).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should clear blocks from EditorJs before loading', (done) => {
    const blocks = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
    ];

    service.clearBlocksFromEditorJs(blocks).subscribe(([clearedBlocks]) => {
      expect(clearedBlocks).toEqual(blocks);
      expect(editorJsServiceMock.clearBlocks).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should combine supported blocks with provided blocks', (done) => {
    const blocks = [
      {
        blockId: '1',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: '',
      },
    ];

    service.combineSupportBlocks(blocks).subscribe(([resultBlocks, supportedBlocks]) => {
      expect(resultBlocks).toEqual(blocks);
      expect(supportedBlocks).toEqual([
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
      done();
    });
  });

  describe('loadBlocks$', () => {
    it('should load blocks correctly', (done) => {
      const blocks: NgxEditorJsBlock[] = [
        {
          blockId: '1',
          sortIndex: 0,
          componentInstanceName: 'HeaderBlockComponent',
          dataClean: '',
        },
      ];

      const blocksWithComponent: NgxEditorJsBlockWithComponent[] = [
        {
          blockId: '1',
          sortIndex: 0,
          componentInstanceName: 'HeaderBlockComponent',
          dataClean: '',
          component: HeaderBlockComponent,
        },
      ];

      service.blocksToLoad.next(blocks);
      service.loadBlocks$.subscribe((loadedBlocks) => {
        expect(loadedBlocks).toEqual(blocksWithComponent);
        done();
      });
    });
  });
});

describe('NgxEditorJs2Service with consumer supported blocks', () => {
  let service: NgxEditorJs2Service;
  let editorJsServiceMock: MockedObject<EditorJsService>;

  beforeEach(() => {
    editorJsServiceMock = {
      clearBlocks: vi.fn().mockReturnValue(of(null)),
      addBlockComponent: vi.fn().mockImplementation((block) => of(block)),
    } as unknown as MockedObject<EditorJsService>;

    TestBed.configureTestingModule({
      providers: [
        NgxEditorJs2Service,
        { provide: EditorJsService, useValue: editorJsServiceMock },
        {
          provide: NGX_EDITORJS_OPTIONS,
          useValue: {
            consumerSupportedBlocks: [
              {
                name: 'CustomBlock',
                component: HeaderBlockComponent,
                componentInstanceName: 'CustomBlockComponent',
              },
            ],
          },
        },
      ],
    });

    service = TestBed.inject(NgxEditorJs2Service);
  });

  it('should initialize with default internal supported blocks and consumer supported blocks', (done) => {
    service.supportedBlocks$.subscribe((blocks) => {
      expect(blocks).toEqual([
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
        {
          name: 'CustomBlock',
          component: HeaderBlockComponent,
          componentInstanceName: 'CustomBlockComponent',
        },
      ]);
      done();
    });
  });
});