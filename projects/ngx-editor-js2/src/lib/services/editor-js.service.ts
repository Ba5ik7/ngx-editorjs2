import { inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  combineLatest,
  defaultIfEmpty,
  filter,
  forkJoin,
  iif,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  BlockComponent,
  MovePositionActions,
  NgxEditorJsBlock,
  NgxEditorJsBlockWithComponent,
} from '../ngx-editor-js2.interface';
import { BlockMovementService } from './block-movement.service';

const createUID = () => Math.random().toString(36).substring(7);
@Injectable({
  providedIn: 'root',
})
export class EditorJsService {
  formBuilder = inject(FormBuilder);
  blockMovementService = inject(BlockMovementService);

  componentRefMap = new Map<object, unknown>();

  ngxEditor!: ViewContainerRef;
  formGroup = this.formBuilder.group({});

  // TODO - Handle this idiomatically
  setNgxEditor(ngxEditor: ViewContainerRef) {
    this.ngxEditor = ngxEditor;
  }

  getBlocks$(): Observable<NgxEditorJsBlock[]> {
    return new Observable<NgxEditorJsBlock[]>((observer) => {
      lastValueFrom(
        this.blockMovementService.getNgxEditorJsBlocks().pipe(
          map((componentRefs) =>
            componentRefs.map<NgxEditorJsBlock>(({ instance }) => ({
              blockId: instance.formControlName(),
              sortIndex: instance.sortIndex(),
              componentInstanceName: instance.componentInstanceName,
              savedAction: instance.savedAction(),
              dataClean: instance.formGroup().get(instance.formControlName())
                ?.value,
            }))
          ),
          map((blocks) => blocks.sort((a, b) => a.sortIndex - b.sortIndex))
        )
      ).then((blocks) => {
        observer.next(blocks);
        observer.complete();
      });
    });
  }

  createNgxEditorJsBlockWithComponent(
    blockComponent: Type<BlockComponent>,
    componentContextPositionIndex: number
  ) {
    return of<NgxEditorJsBlockWithComponent>({
      blockId: createUID(),
      sortIndex: componentContextPositionIndex,
      componentInstanceName: blockComponent.name,
      component: blockComponent,
      // TODO - Force content-type for dataClean? JSON, HTML, etc.
      // TODO - And maybe rename dataClean to just data?
      dataClean: '',
      autofocus: true,
    });
  }

  addBlockComponent(
    ngxEditorJsBlock: NgxEditorJsBlockWithComponent,
    emitEvent = true
  ): Observable<void> {
    return forkJoin([
      this.createFormGroupControl(ngxEditorJsBlock, emitEvent),
      this.attachComponent(ngxEditorJsBlock),
      this.blockMovementService.updateComponentIndices(this.ngxEditor),
    ]).pipe(map(() => void 0));
  }

  createFormGroupControl({
    blockId,
    dataClean,
  }: NgxEditorJsBlockWithComponent, emitEvent = true) {
    return of(this.formBuilder.control(dataClean, [])).pipe(
      tap((formControl) => this.formGroup.addControl(blockId, formControl, { emitEvent }))
    );
  }

  attachComponent({
    component,
    blockId,
    autofocus,
    savedAction,
    sortIndex: index,
  }: NgxEditorJsBlockWithComponent) {
    return of(blockId).pipe(
      map((controlName) => {
        const componentRef = this.ngxEditor.createComponent(component, {
          index,
        });

      (componentRef.location.nativeElement as HTMLElement)
        .classList.add('ngx-editor-js2-block');

        componentRef.setInput('sortIndex', index);
        componentRef.setInput('formGroup', this.formGroup);
        componentRef.setInput('formControlName', controlName);
        componentRef.setInput('autofocus', autofocus);

        savedAction && componentRef.instance.actionCallback?.(savedAction);

        this.blockMovementService.newComponentAttached(componentRef);
        return componentRef;
      })
    );
  }

  determineMovePositionAction(
    action: MovePositionActions,
    index: number,
    formControlName: string
  ) {
    return iif(
      () => action === MovePositionActions.DELETE,
      this.removeBlockComponent(index, formControlName),
      this.blockMovementService.moveBlockComponentPosition(
        this.ngxEditor,
        action,
        index
      )
    ).pipe(
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      )
    );
  }

  moveBlockComponentPosition(previousIndex: number, currentIndex: number) {
    return of(this.ngxEditor.get(previousIndex)).pipe(
      filter((viewRef) => !!viewRef),
      tap((viewRef) => {
        this.ngxEditor.move(viewRef, currentIndex);
      }),
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      ),
      defaultIfEmpty(false)
    );
  }

  removeBlockComponent(index: number, formControlName: string, clear = false) {
    return combineLatest([
      this.blockMovementService.removeBlockComponent(
        this.ngxEditor,
        index,
        clear
      ),
      of(this.formGroup.removeControl(formControlName)),
    ]);
  }

  clearBlocks() {
    return this.blockMovementService.getNgxEditorJsBlocks().pipe(
      filter((componentRefs) => componentRefs.length > 0),
      map((componentRefs) =>
        componentRefs.sort(
          (a, b) => a.instance.sortIndex() - b.instance.sortIndex()
        )
      ),
      mergeMap((componentRefs) =>
        forkJoin(
          Array.from(componentRefs.values()).map((componentRef) =>
            this.removeBlockComponent(
              componentRef.instance.sortIndex() + 1,
              componentRef.instance.formControlName(),
              true
            )
          )
        )
      ),
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      ),
      tap(() => {
        this.blockMovementService.clearComponentRefs();
        this.ngxEditor.clear();
      }),
      defaultIfEmpty(false)
    );
  }
}
