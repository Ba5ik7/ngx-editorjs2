import { InjectionToken, InputSignal, Signal, Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

export interface NgxEditorjsOptions {
  consumerSupportedBlocks?: SupportedBlock[];
}
export interface SupportedBlock {
  name: string;
  componentInstanceName: string;
  component: Type<BlockComponent>;
}

export interface NgxEditorJsBlock {
  blockId: string;
  sortIndex: number;
  componentInstanceName: string;
  dataClean: string;
  savedAction?: string;
}
export interface NgxEditorJsBlockWithComponent extends NgxEditorJsBlock {
  component: Type<BlockComponent>;
  autofocus?: boolean;
}

export interface BlockComponent {
  sortIndex: InputSignal<number>;
  componentInstanceName: string;
  formControlName: InputSignal<string>;
  formGroup: InputSignal<FormGroup>;
  blockOptionActions: InputSignal<BlockOptionAction[]>;
  savedAction: Signal<string>;
  actionCallback?: (action: string, updateFormValue: boolean) => void;
}

export interface BlockOptionAction {
  action: string;
  icon?: string;
  text?: string;
}

export enum MovePositionActions {
  UP = 'UP',
  DOWN = 'DOWN',
  DELETE = 'DELETE',
}

export type TAddBlockCallback = (
  block: Type<BlockComponent>,
  index: number
) => Observable<unknown>;

export type TMoveBlockPositionCallback = (
  action: MovePositionActions,
  index: number
) => Observable<unknown>;
