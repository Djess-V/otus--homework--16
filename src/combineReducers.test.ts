import { combineReducers } from "./combineReducers";
import { Reducer } from "./types/reducers";
import { Action, AnyAction } from "./types/actions";

describe("combineReducers", () => {
  it("is a function", () => {
    expect(combineReducers).toBeInstanceOf(Function);
  });

  it("returns a function", () => {
    expect(combineReducers({})).toBeInstanceOf(Function);
  });

  it("returns a reducer based on the config (initial state)", () => {
    const reducer = combineReducers({
      a: (state = 2, action: Action) => state,
      b: (state = "hop", action: Action) => state,
    });
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      a: 2,
      b: "hop",
    });
  });

  it("calls subreducers with proper values", () => {
    type State = { a: number; b: number };
    const config = {
      a: jest.fn((state = 5, action) => state + action.payload),
      b: jest.fn((state = 6, action) => state - action.payload),
    };
    const reducer = combineReducers(config);

    const state: State = {
      a: 55,
      b: 66,
    };
    const action1 = { type: "unknown", payload: 1 };
    const newState1 = reducer(state, action1);

    expect(config.a).toHaveBeenCalledWith(55, action1);
    expect(config.b).toHaveBeenCalledWith(66, action1);

    expect(newState1).toEqual({
      a: 56,
      b: 65,
    });

    const action2 = { type: "unknown", payload: 2 };
    const newState2 = reducer(newState1, action2);
    expect(config.a).toHaveBeenCalledWith(56, action2);
    expect(config.b).toHaveBeenCalledWith(65, action2);
    expect(newState2).toEqual({
      a: 58,
      b: 63,
    });
  });

  it("ignores all props which are not a function", () => {
    const reducer = combineReducers({
      fake: true as unknown as Reducer,
      broken: "string" as unknown as Reducer,
      another: { nested: "object" } as unknown as Reducer,
      stack: (state = []) => state,
    });

    expect(Object.keys(reducer(undefined, { type: "push" }))).toEqual([
      "stack",
    ]);
  });

  it("throws an error if a reducer returns undefined handling an action", () => {
    const reducer = combineReducers({
      counter(state = 0, action: Action) {
        switch (action && action.type) {
          case "increment":
            return state + 1;
          case "decrement":
            return state - 1;
          case "whatever":
          case null:
          case undefined:
            return undefined;
          default:
            return state;
        }
      },
    });

    expect(() => reducer({ counter: 0 }, { type: "whatever" })).toThrow();
    // @ts-expect-error : Intentional transmission of inappropriate parameters
    expect(() => reducer({ counter: 0 }, null)).toThrow();
    expect(() => reducer({ counter: 0 }, {} as unknown as AnyAction)).toThrow();
  });

  it("warns if a reducer prop is undefined", () => {
    const spy = jest.spyOn(window.console, "log");

    let isNotDefined: any;
    combineReducers({ isNotDefined });
    expect(spy).toHaveBeenCalled();
  });

  it("throws an error on first call if a reducer returns undefined initializing", () => {
    const reducer = combineReducers({
      counter(state: number, action: Action) {
        switch (action.type) {
          case "increment":
            return state + 1;
          case "decrement":
            return state - 1;
          default:
            return state;
        }
      },
    });
    expect(() => reducer(undefined, { type: "" })).toThrow();
  });
});
