import '../test-setup';
import { MockComponent } from 'ng-mocks';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorJsService } from './editor-js.service';
import { BlockMovementService } from './block-movement.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import {
  BlockComponent,
  NgxEditorJsBlockWithComponent,
  MovePositionActions,
} from '../ngx-editor-js2.interface';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';

describe('EditorJsService', () => {
  let service: EditorJsService;
  let blockMovementServiceMock: MockedObject<BlockMovementService>;
  let ngxEditorMock: MockedObject<ViewContainerRef>;
  let fixture: ComponentFixture<HeaderBlockComponent>;
  let mockComponentRef: ComponentRef<HeaderBlockComponent>;

  beforeEach(() => {
    blockMovementServiceMock = {
      getNgxEditorJsBlocks: vi.fn().mockReturnValue(of([])),
      removeBlockComponent: vi.fn().mockReturnValue(of(null)),
      moveBlockComponentPosition: vi.fn().mockReturnValue(of(null)),
      updateComponentIndices: vi.fn().mockReturnValue(of(null)),
      newComponentAttached: vi.fn(),
      clearComponentRefs: vi.fn(),
    } as unknown as MockedObject<BlockMovementService>;

    ngxEditorMock = {
      createComponent: vi.fn(),
      move: vi.fn(),
      get: vi.fn(),
      clear: vi.fn(),
    } as unknown as MockedObject<ViewContainerRef>;

    TestBed.configureTestingModule({
      providers: [
        EditorJsService,
        { provide: BlockMovementService, useValue: blockMovementServiceMock },
        { provide: FormBuilder, useValue: new FormBuilder() },
      ],
    });

    service = TestBed.inject(EditorJsService);
    service.setNgxEditor(ngxEditorMock);

    fixture = TestBed.createComponent(HeaderBlockComponent);
    mockComponentRef = fixture.componentRef;
    // Create a mock FormGroup
    const mockFormGroup = new FormGroup({
      mockBlockId: new FormControl('mockData'),
    });

    mockComponentRef.setInput('formControlName', 'mockBlockId');
    mockComponentRef.setInput('formGroup', mockFormGroup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBlocks$', () => {
    it('should return an empty array when no blocks exist', async () => {
      blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(of([]));

      const blocks = await firstValueFrom(service.getBlocks$());
      expect(blocks).toEqual([]);
    });

    it('should return sorted blocks with correct data', async () => {
      // Arrange: Mock component references in unsorted order
      const mockComponentRef1 = {
        instance: {
          formControlName: vi.fn().mockReturnValue('block1'),
          sortIndex: vi.fn().mockReturnValue(2), // Higher index (should be sorted last)
          constructor: { name: 'BMockBlockComponent' },
          formGroup: vi.fn().mockReturnValue({
            get: vi.fn().mockReturnValue({ value: 'data1' }),
          }),
        },
      } as unknown as ComponentRef<BlockComponent>;

      const mockComponentRef2 = {
        instance: {
          formControlName: vi.fn().mockReturnValue('block2'),
          sortIndex: vi.fn().mockReturnValue(1), // Lower index (should be sorted first)
          constructor: { name: 'AMockBlockComponent' },
          formGroup: vi.fn().mockReturnValue({
            get: vi.fn().mockReturnValue({ value: 'data2' }),
          }),
        },
      } as unknown as ComponentRef<BlockComponent>;

      // Mock getNgxEditorJsBlocks to return the blocks in unsorted order
      blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(
        of([mockComponentRef1, mockComponentRef2]) // Unsorted
      );

      // Act
      const blocks = await firstValueFrom(service.getBlocks$());
      // Assert: Blocks should be sorted by `sortIndex`
      expect(blocks).toEqual([
        {
          blockId: 'block2', // This should be first (sortIndex = 1)
          sortIndex: 1,
          componentInstanceName: 'MockBlockComponent',
          dataClean: 'data2',
        },
        {
          blockId: 'block1', // This should be second (sortIndex = 2)
          sortIndex: 2,
          componentInstanceName: 'MockBlockComponent',
          dataClean: 'data1',
        },
      ]);
    });
  });

  describe('createNgxEditorJsBlockWithComponent', () => {
    it('should create a new NgxEditorJsBlockWithComponent', async () => {
      const result = await firstValueFrom(
        service.createNgxEditorJsBlockWithComponent(HeaderBlockComponent, 0)
      );

      expect(result).toEqual({
        blockId: expect.any(String), // Allow any dynamically generated UID
        sortIndex: 0, // The passed index should match
        componentInstanceName: 'HeaderBlockComponent',
        component: HeaderBlockComponent, // Expect component class/type, not instance
        dataClean: '',
        autofocus: true,
      });
    });
  });

  describe('addBlockComponent', () => {
    it('should call createFormGroupControl, attachComponent, and updateComponentIndices with correct args', async () => {
      // Arrange - Mock block
      const block: NgxEditorJsBlockWithComponent = {
        blockId: 'testBlock',
        sortIndex: 0,
        componentInstanceName: 'MockBlockComponent',
        component: HeaderBlockComponent,
        dataClean: '',
        autofocus: true,
      };

      // Mock FormControl
      const mockFormControl = new FormControl<string | null>('mockValue');

      // Mock ComponentRef
      const mockComponentRef = {
        instance: {}, // Fake instance of component
      } as ComponentRef<BlockComponent>;

      // Mock dependencies
      vi
        .spyOn(service, 'createFormGroupControl')
        .mockReturnValue(of(mockFormControl));
      vi
        .spyOn(service, 'attachComponent')
        .mockReturnValue(of(mockComponentRef));
      vi
        .spyOn(blockMovementServiceMock, 'updateComponentIndices')
        .mockReturnValue(of(void 0));

      // Act - Call the function
      await firstValueFrom(service.addBlockComponent(block));
      // Assert - Verify that each method was called with the expected arguments
      expect(service.createFormGroupControl).toHaveBeenCalledWith(block);
      expect(service.attachComponent).toHaveBeenCalledWith(block);
      expect(
        blockMovementServiceMock.updateComponentIndices
      ).toHaveBeenCalledWith(service.ngxEditor);
    });
  });

  describe('removeBlockComponent', () => {
    it('should call removeBlockComponent on blockMovementService', async () => {
      await firstValueFrom(service.removeBlockComponent(0, 'testBlock'));
      expect(
        blockMovementServiceMock.removeBlockComponent
      ).toHaveBeenCalledWith(ngxEditorMock, 0, false);
    });
  });

  describe('moveBlockComponentPosition', () => {
    it('should move a block to a new position', async () => {
      // Arrange: Mock ViewRef (or whatever `get()` should return)
      const mockViewRef = mockComponentRef.hostView;

      // Mock ngxEditor.get to return the mockViewRef
      vi.spyOn(ngxEditorMock, 'get').mockReturnValue(mockViewRef);

      // Spy on ngxEditor.move
      vi.spyOn(ngxEditorMock, 'move').mockImplementation();

      // Mock updateComponentIndices to return an observable
      vi
        .spyOn(blockMovementServiceMock, 'updateComponentIndices')
        .mockReturnValue(of(void 0));

      // Act
      await firstValueFrom(service.moveBlockComponentPosition(1, 2));
      // Assert
      expect(ngxEditorMock.get).toHaveBeenCalledWith(1); // Ensure get() is called with the correct index
      expect(ngxEditorMock.move).toHaveBeenCalledWith(mockViewRef, 2); // Ensure move() is called correctly
      expect(
        blockMovementServiceMock.updateComponentIndices
      ).toHaveBeenCalledWith(service.ngxEditor); // Ensure indices update
    });
  });

  describe('determineMovePositionAction', () => {
    it('should delete a block when action is DELETE', async () => {
      await firstValueFrom(
        service.determineMovePositionAction(MovePositionActions.DELETE, 0, 'testBlock')
      );
      expect(
        blockMovementServiceMock.removeBlockComponent
      ).toHaveBeenCalled();
    });

    it('should move a block when action is MOVE_UP or MOVE_DOWN', async () => {
      await firstValueFrom(
        service.determineMovePositionAction(MovePositionActions.UP, 1, 'testBlock')
      );
      expect(
        blockMovementServiceMock.moveBlockComponentPosition
      ).toHaveBeenCalled();
    });
  });

  describe('clearBlocks', () => {
    it('should clear all blocks, sort them correctly, and reset indices', async () => {
      // Arrange - Mock component references with different sortIndex values
      const mockComponentRef1 = {
        instance: {
          sortIndex: vi.fn().mockReturnValue(2), // Higher index
          formControlName: vi.fn().mockReturnValue('block2'),
        },
      } as unknown as ComponentRef<BlockComponent>;

      const mockComponentRef2 = {
        instance: {
          sortIndex: vi.fn().mockReturnValue(1), // Lower index
          formControlName: vi.fn().mockReturnValue('block1'),
        },
      } as unknown as ComponentRef<BlockComponent>;

      // Mock getNgxEditorJsBlocks() to return unsorted component refs
      blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(
        of([mockComponentRef1, mockComponentRef2]) // Unsorted order
      );

      // Spy on removeBlockComponent to track call order and return correct type
      const removeBlockSpy = vi
        .spyOn(service, 'removeBlockComponent')
        .mockReturnValue(of([true, void 0] as [boolean, void])); // ✅ Correct tuple type

      // Spy on updateComponentIndices
      vi
        .spyOn(blockMovementServiceMock, 'updateComponentIndices')
        .mockReturnValue(of(void 0));

      // Act
      await firstValueFrom(service.clearBlocks());
      // Assert - Ensure sorting is correct and removeBlockComponent is called in order
      expect(removeBlockSpy).toHaveBeenNthCalledWith(
        1,
        1 + 1, // Lower index (1) first, so we expect removeBlockComponent(2, "block1", true)
        'block1',
        true
      );
      expect(removeBlockSpy).toHaveBeenNthCalledWith(
        2,
        2 + 1, // Higher index (2) second, so we expect removeBlockComponent(3, "block2", true)
        'block2',
        true
      );

      // Ensure final cleanup methods are called
      expect(blockMovementServiceMock.clearComponentRefs).toHaveBeenCalled();
      expect(ngxEditorMock.clear).toHaveBeenCalled();
    });
  });

  describe('attachComponent', () => {
    it('should create and attach a component with correct inputs', async () => {
      // Arrange - Mock ComponentRef
      const mockComponentInstance = {
        actionCallback: vi.fn(),
      };

      const mockComponentRef = {
        instance: mockComponentInstance,
        setInput: vi.fn(), // Spy on setInput
      } as unknown as ComponentRef<BlockComponent>;

      // Mock ngxEditor.createComponent to return mockComponentRef
      vi
        .spyOn(ngxEditorMock, 'createComponent')
        .mockReturnValue(mockComponentRef);

      // Spy on blockMovementService.newComponentAttached
      vi.spyOn(blockMovementServiceMock, 'newComponentAttached');

      // Create test input
      const block: NgxEditorJsBlockWithComponent = {
        blockId: 'testBlock',
        sortIndex: 1,
        componentInstanceName: 'MockBlockComponent',
        component: HeaderBlockComponent,
        dataClean: '',
        autofocus: true,
        savedAction: 'mockAction', // Mock action for testing
      };

      // Act
      const result = await firstValueFrom(service.attachComponent(block));
      // Assert
      expect(ngxEditorMock.createComponent).toHaveBeenCalledWith(
        HeaderBlockComponent,
        { index: 1 }
      );
      expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 1);
      expect(mockComponentRef.setInput).toHaveBeenCalledWith(
        'formGroup',
        service.formGroup
      );
      expect(mockComponentRef.setInput).toHaveBeenCalledWith(
        'formControlName',
        'testBlock'
      );
      expect(mockComponentRef.setInput).toHaveBeenCalledWith(
        'autofocus',
        true
      );

      // Verify action callback is called if savedAction is set
      expect(mockComponentInstance.actionCallback).toHaveBeenCalledWith(
        'mockAction'
      );

      // Verify newComponentAttached is called with the componentRef
      expect(
        blockMovementServiceMock.newComponentAttached
      ).toHaveBeenCalledWith(mockComponentRef);

      // Ensure correct value is returned
      expect(result).toBe(mockComponentRef);
    });
  });

  describe('createFormGroupControl', () => {
    let formBuilderMock: Partial<FormBuilder>;
    let formGroupMock: Partial<FormGroup>;

    beforeEach(() => {
      // Manually mock FormBuilder
      formBuilderMock = {
        control: vi.fn((value) => new FormControl(value)), // Return real FormControl
      };

      // Manually mock FormGroup
      formGroupMock = {
        addControl: vi.fn(), // Spy on addControl
      } as Partial<FormGroup>;

      // Assign mocks to the service
      service.formBuilder = formBuilderMock as FormBuilder;
      service.formGroup = formGroupMock as FormGroup;
    });

    it('should create a new form control and add it to the form group', async () => {
      // Arrange: Test block data
      const block: NgxEditorJsBlockWithComponent = {
        blockId: 'testBlock',
        sortIndex: 0,
        componentInstanceName: 'MockBlockComponent',
        component: HeaderBlockComponent,
        dataClean: 'mockData',
        autofocus: true,
      };

      // Act
      const formControl = await firstValueFrom(service.createFormGroupControl(block));
      // Assert: Ensure form control is created with correct data
      expect(formControl.value).toBe('mockData');

      // Ensure formGroup.addControl is called with correct arguments
      expect(formGroupMock.addControl).toHaveBeenCalledWith(
        'testBlock',
        formControl
      );
    });
  });
});
