import {
  Store,
  StoreEnhancer,
  Dispatch,
  ListenerCallback,
} from "./types/store";
import { Action } from "./types/actions";
import { Reducer } from "./types/reducers";
import isPlainObject from "./utils/isPlainObject";

export function createStore<
  S,
  A extends Action,
  Ext extends {} = {},
  StateExt extends {} = {}
>(
  reducer: Reducer<S, A>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S, A, StateExt> & Ext;

export function createStore<
  S,
  A extends Action,
  Ext extends {} = {},
  StateExt extends {} = {},
  PreloadedState = S
>(
  reducer: Reducer<S, A, PreloadedState>,
  preloadedState?: PreloadedState | undefined,
  enhancer?: StoreEnhancer<Ext, StateExt>,
  ...rest: any[]
): Store<S, A, StateExt> & Ext;

export function createStore<
  S,
  A extends Action,
  Ext extends {} = {},
  StateExt extends {} = {},
  PreloadedState = S
>(
  reducer: Reducer<S, A, PreloadedState>,
  preloadedState?: PreloadedState | StoreEnhancer<Ext, StateExt> | undefined,
  enhancer?: StoreEnhancer<Ext, StateExt>,
  ...rest: any[]
): Store<S, A, StateExt> & Ext {
  if (typeof reducer !== "function") {
    throw new Error(`Reducer is not a function`);
  }

  if (
    (typeof preloadedState === "function" && typeof enhancer === "function") ||
    (typeof enhancer === "function" && typeof rest[0] === "function")
  ) {
    throw new Error(
      "You passed the initial state as a function or the wrong number of parameters"
    );
  }

  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    console.log(
      "Override enchancer if enchancer is passed as a second parameter (in the absence of preloadedState)"
    );
    enhancer = preloadedState as StoreEnhancer<Ext, StateExt>;
    preloadedState = undefined;
  }

  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(`Enchancer is not a function`);
    }

    return enhancer(createStore)(
      reducer,
      preloadedState as PreloadedState | undefined
    );
  }

  let currentReducer = reducer;
  let currentState: S | PreloadedState | undefined = preloadedState as
    | PreloadedState
    | undefined;
  let currentListeners: Map<number, ListenerCallback> | null = new Map();
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }

  function getState(): S {
    if (isDispatching) {
      throw new Error(
        "You may not call store.getState() while the reducer is executing."
      );
    }

    return currentState as S;
  }

  function subscribe(listener: () => void) {
    if (typeof listener !== "function") {
      throw new Error(`Listener is not a function`);
    }

    if (isDispatching) {
      throw new Error(
        "You may not call store.subscribe() while the reducer is executing."
      );
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    listenerIdCounter += 1;
    const listenerId = listenerIdCounter;
    nextListeners.set(listenerId, listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error(
          "You may not unsubscribe from a store listener while the reducer is executing."
        );
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }

  function dispatch(action: A) {
    if (!isPlainObject(action)) {
      throw new Error(`Actions is not a plain objects.`);
    }

    if (typeof action.type === "undefined") {
      throw new Error('Actions may not have an undefined "type" property.');
    }

    if (typeof action.type !== "string") {
      throw new Error(`Action "type" property must be a string.`);
    }

    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    currentListeners = nextListeners;
    const listeners = currentListeners;
    listeners.forEach((listener) => {
      listener();
    });
    return action;
  }

  function replaceReducer(nextReducer: Reducer<S, A>): void {
    if (typeof nextReducer !== "function") {
      throw new Error(`NextReducer is not a function`);
    }

    currentReducer = nextReducer as unknown as Reducer<S, A, PreloadedState>;
  }

  const store = {
    dispatch: dispatch as Dispatch<A>,
    subscribe,
    getState,
    replaceReducer,
  } as unknown as Store<S, A, StateExt> & Ext;

  return store;
}
