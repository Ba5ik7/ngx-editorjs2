import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BlockMovementService } from './block-movement.service';
import { BlockComponent, MovePositionActions } from '../ngx-editor-js2.interface';
import { firstValueFrom, of } from 'rxjs';

describe('BlockMovementService', () => {
  let service: BlockMovementService;
  let ngxEditorMock: MockedObject<ViewContainerRef>;
  let mockComponentRef: ComponentRef<BlockComponent>;

  beforeEach(() => {
    service = new BlockMovementService();

    // Mock ngxEditor
    ngxEditorMock = {
      length: 3,
      indexOf: vi.fn((view) => (view as any).mockIndex),
      move: vi.fn(),
      remove: vi.fn(),
    } as unknown as MockedObject<ViewContainerRef>;

    // Mock ComponentRef
    mockComponentRef = {
      instance: {},
      hostView: { mockIndex: 1 },
      setInput: vi.fn(),
    } as unknown as ComponentRef<BlockComponent>;
  });

  // ✅ 1. clearComponentRefs()
  it('should clear all component refs', () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);
    service.clearComponentRefs();
    expect(service.componentRefMap.size).toBe(0);
  });

  // ✅ 2. getNgxEditorJsBlocks()
  it('should return all component refs', async () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    const blocks = await firstValueFrom(service.getNgxEditorJsBlocks());
    expect(blocks).toEqual([mockComponentRef]);
  });

  // ✅ 3. newComponentAttached()
  it('should add a component ref to componentRefMap', () => {
    service.newComponentAttached(mockComponentRef);
    expect(service.componentRefMap.has(mockComponentRef.instance)).toBe(true);
  });

  // ✅ 4. updateComponentIndices()
  it('should update component sort indices', async () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    await firstValueFrom(service.updateComponentIndices(ngxEditorMock));
    expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 1);
  });

  // ✅ 5. moveBlockComponentPosition()
  it('should move a block up when MovePositionActions.UP is used', async () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);
    vi.spyOn(ngxEditorMock, 'length', 'get').mockReturnValue(3);

    await firstValueFrom(service.moveBlockComponentPosition(ngxEditorMock, MovePositionActions.UP, 2));
    expect(ngxEditorMock.move).toHaveBeenCalledWith(mockComponentRef.hostView, 0);
    expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 0);
    expect(mockComponentRef.setInput).toHaveBeenCalledWith('autofocus', true);
  });

  it('should move a block down when MovePositionActions.DOWN is used', async () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);
    vi.spyOn(ngxEditorMock, 'length', 'get').mockReturnValue(3);

    await firstValueFrom(service.moveBlockComponentPosition(ngxEditorMock, MovePositionActions.DOWN, 1));
    expect(ngxEditorMock.move).toHaveBeenCalledWith(mockComponentRef.hostView, 2);
    expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 2);
    expect(mockComponentRef.setInput).toHaveBeenCalledWith('autofocus', true);
  });

  // ✅ 6. removeBlockComponent()
  it('should remove a block component from ngxEditor and componentRefMap', async () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    await firstValueFrom(service.removeBlockComponent(ngxEditorMock, 2, false));
    expect(service.componentRefMap.has(mockComponentRef.instance)).toBe(false);
    expect(ngxEditorMock.remove).toHaveBeenCalledWith(1);
  });

  it('should not remove the last component if clear is false', async () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    const result = await firstValueFrom(service.removeBlockComponent(ngxEditorMock, 2, false));
    expect(result).toBe(false);
    expect(ngxEditorMock.remove).not.toHaveBeenCalled();
  });
});