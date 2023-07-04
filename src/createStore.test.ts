import { createStore } from "./createStore";
import { Todo, TodoAction } from "./types/forTests";
import id from "./utils/forTests";

describe("createStore", () => {
  describe("public interface", () => {
    it("is a function", () => {
      expect(createStore).toBeInstanceOf(Function);
    });
    it("generates store with reducer", () => {
      const state = 2;
      const store = createStore(() => state);
      console.log(store);
      expect(store.getState).toBeInstanceOf(Function);

      expect(store.dispatch).toBeInstanceOf(Function);

      expect(store.subscribe).toBeInstanceOf(Function);
      expect(store.subscribe(jest.fn())).toBeInstanceOf(Function);
    });
  });

  describe("functional interface", () => {
    it("returns state based on initial state", () => {
      const state = { name: "Bob" };
      expect(createStore(() => null).getState()).toBe(undefined);
      expect(createStore(() => null, state).getState()).toBe(state);
    });

    it("calculates new state with reducer call", () => {
      const action1 = { type: "xxx" };
      const action2 = { type: "yyyy" };
      const reducer = jest.fn((state = 1) => state + 1);
      const store = createStore(reducer);
      store.dispatch(action1);
      expect(reducer).toHaveBeenCalledWith(undefined, action1);
      expect(store.getState()).toBe(2);
      store.dispatch(action2);
      expect(reducer).toHaveBeenCalledWith(2, action2);
      expect(store.getState()).toBe(3);
    });

    it("notifies listeners about updates", () => {
      const action1 = { type: "xxx" };
      const action2 = { type: "yyyy" };
      const reducer = jest.fn((state = 1) => state + 1);
      const store = createStore(reducer);
      const spy = jest.fn();
      store.subscribe(spy);
      expect(spy).not.toHaveBeenCalled();
      store.dispatch(action1);
      expect(spy).toHaveBeenCalled();
      store.dispatch(action2);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("allows to unsubscribe from the events", () => {
      const action1 = { type: "xxx" };
      const action2 = { type: "yyyy" };
      const reducer = jest.fn((state = 1) => state + 1);
      const store = createStore(reducer);
      const spy = jest.fn();
      const unsubscribe = store.subscribe(spy);
      expect(spy).not.toHaveBeenCalled();
      store.dispatch(action1);
      expect(spy).toHaveBeenCalled();
      unsubscribe();
      store.dispatch(action2);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("preserves the state when replacing a reducer", () => {
      const reducer = (state: Todo[] = [], action: TodoAction) => {
        switch (action.type) {
          case "ADD_TODO":
            return [
              ...state,
              {
                id: id(state),
                text: action.text,
              },
            ];
          default:
            return state;
        }
      };

      const reverseReducer = (state: Todo[] = [], action: TodoAction) => {
        switch (action.type) {
          case "ADD_TODO":
            return [
              {
                id: id(state),
                text: action.text,
              },
              ...state,
            ];
          default:
            return state;
        }
      };

      const store = createStore(reducer);
      store.dispatch({ type: "ADD_TODO", text: "Hello" });
      store.dispatch({ type: "ADD_TODO", text: "World" });
      expect(store.getState()).toEqual([
        {
          id: 1,
          text: "Hello",
        },
        {
          id: 2,
          text: "World",
        },
      ]);

      store.replaceReducer(reverseReducer);
      expect(store.getState()).toEqual([
        {
          id: 1,
          text: "Hello",
        },
        {
          id: 2,
          text: "World",
        },
      ]);

      store.dispatch({ type: "ADD_TODO", text: "Perhaps" });
      expect(store.getState()).toEqual([
        {
          id: 3,
          text: "Perhaps",
        },
        {
          id: 1,
          text: "Hello",
        },
        {
          id: 2,
          text: "World",
        },
      ]);

      store.replaceReducer(reducer);
      expect(store.getState()).toEqual([
        {
          id: 3,
          text: "Perhaps",
        },
        {
          id: 1,
          text: "Hello",
        },
        {
          id: 2,
          text: "World",
        },
      ]);

      store.dispatch({ type: "ADD_TODO", text: "Surely" });
      expect(store.getState()).toEqual([
        {
          id: 3,
          text: "Perhaps",
        },
        {
          id: 1,
          text: "Hello",
        },
        {
          id: 2,
          text: "World",
        },
        {
          id: 4,
          text: "Surely",
        },
      ]);
    });
  });

  it("error output testing", () => {
    // @ts-expect-error : Intentional transmission of inappropriate parameters
    expect(() => createStore("Hello")).toThrow();
    expect(() =>
      createStore(
        (a) => a,
        (b) => b,
        (c) => c
      )
    ).toThrow();
    expect(() =>
      createStore(
        (a) => a,
        (b) => b,
        // @ts-expect-error : Intentional transmission of inappropriate parameters
        "Hello"
      )
    ).toThrow();

    const reducer = jest.fn((state = 1) => state + 1);
    const store = createStore(reducer);

    // @ts-expect-error : Intentional transmission of inappropriate parameters
    expect(() => store.dispatch("Hello")).toThrow();
    // @ts-expect-error : Intentional transmission of inappropriate parameters
    expect(() => store.dispatch({ type: undefined })).toThrow();
    // @ts-expect-error : Intentional transmission of inappropriate parameters
    expect(() => store.dispatch({ type: 5 })).toThrow();
    // @ts-expect-error : Intentional transmission of inappropriate parameters
    expect(() => store.replaceReducer({ type: 5 })).toThrow();
  });
});
