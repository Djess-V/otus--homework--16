import { AnyAction } from "./types/actions";
import {
  ActionFromReducersMapObject,
  PreloadedStateShapeFromReducersMapObject,
  Reducer,
  StateFromReducersMapObject,
} from "./types/reducers";

import ActionTypes from "./utils/actionTypes";

function assertReducerShape(reducers: {
  [key: string]: Reducer<any, any, any>;
}) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === "undefined") {
      throw new Error(
        `The reducer with key "${key}" returned undefined during initialization.`
      );
    }

    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION(),
      }) === "undefined"
    ) {
      throw new Error(
        `The reducer with key "${key}" returned undefined when probed with a random type. `
      );
    }
  });
}

export function combineReducers<M>(
  reducers: M
): M[keyof M] extends Reducer<any, any, any> | undefined
  ? Reducer<
      StateFromReducersMapObject<M>,
      ActionFromReducersMapObject<M>,
      Partial<PreloadedStateShapeFromReducersMapObject<M>>
    >
  : never;

export function combineReducers(reducers: {
  [key: string]: Reducer<any, any, any>;
}) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers: { [key: string]: Reducer<any, any, any> } = {};
  for (let i = 0; i < reducerKeys.length; i += 1) {
    const key = reducerKeys[i];

    if (typeof reducers[key] === "undefined") {
      console.log(`The reducer's name is equal to undefined`);
    }

    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  let shapeAssertionError: unknown;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction
  ) {
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    let hasChanged = false;
    const nextState: StateFromReducersMapObject<typeof reducers> = {};
    for (let i = 0; i < finalReducerKeys.length; i += 1) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        throw new Error(`Reducer returned undefined`);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}
