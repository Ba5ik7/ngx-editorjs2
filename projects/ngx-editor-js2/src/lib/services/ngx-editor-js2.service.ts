import { inject, Injectable, InjectionToken, Type } from '@angular/core';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';
import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export const NGX_EDITORJS_OPTIONS = new InjectionToken<NgxEditorjsOptions>(
  'NGX_EDITORJS_OPTIONS'
);

export interface NgxEditorjsOptions {
  consumerSupportedBlocks?: ConsumerSupportedBlock[];
}
export interface ConsumerSupportedBlock {
  name: string;
  component: Type<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class NgxEditorJs2Service {
  consumerSupportedBlocks = new BehaviorSubject<ConsumerSupportedBlock[]>(
    inject(NGX_EDITORJS_OPTIONS, { optional: true })?.consumerSupportedBlocks ??
      []
  );

  internalSupportedBlocks = new BehaviorSubject<ConsumerSupportedBlock[]>([
    {
      name: 'Paragraph',
      component: ParagraphBlockComponent,
    },
    {
      name: 'Header',
      component: HeaderBlockComponent,
    },
  ]);

  supportedBlocks$ = combineLatest([
    this.internalSupportedBlocks.asObservable(),
    this.consumerSupportedBlocks.asObservable(),
  ]).pipe(map(([internal, consumer]) => [...internal, ...consumer]));
}
