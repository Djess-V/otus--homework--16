import { Action, AnyAction } from "./actions";
import { Reducer } from "./reducers";

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): T;
}

export interface Unsubscribe {
  (): void;
}

export type ListenerCallback = () => void;

export interface Store<
  S = any,
  A extends Action = AnyAction,
  StateExt extends {} = {}
> {
  dispatch: Dispatch<A>;

  getState(): S & StateExt;

  subscribe(listener: ListenerCallback): Unsubscribe;

  replaceReducer(nextReducer: Reducer<S, A>): void;
}

export type StoreEnhancerStoreCreator<
  Ext extends {} = {},
  StateExt extends {} = {}
> = <S, A extends Action, PreloadedState>(
  reducer: Reducer<S, A, PreloadedState>,
  preloadedState?: PreloadedState | undefined
) => Store<S, A, StateExt> & Ext;

export type StoreEnhancer<Ext extends {} = {}, StateExt extends {} = {}> = <
  NextExt extends {},
  NextStateExt extends {}
>(
  next: StoreEnhancerStoreCreator<NextExt, NextStateExt>
) => StoreEnhancerStoreCreator<NextExt & Ext, NextStateExt & StateExt>;

export interface StoreCreator {
  <S, A extends Action, Ext extends {} = {}, StateExt extends {} = {}>(
    reducer: Reducer<S, A>,
    enhancer?: StoreEnhancer<Ext, StateExt>
  ): Store<S, A, StateExt> & Ext;
  <
    S,
    A extends Action,
    Ext extends {} = {},
    StateExt extends {} = {},
    PreloadedState = S
  >(
    reducer: Reducer<S, A, PreloadedState>,
    preloadedState?: PreloadedState | undefined,
    enhancer?: StoreEnhancer<Ext>
  ): Store<S, A, StateExt> & Ext;
}
