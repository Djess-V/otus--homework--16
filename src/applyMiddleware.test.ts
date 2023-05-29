import applyMiddleware from "./applyMiddleware";
import { createStore } from "./createStore";
import { Action, AnyAction } from "./types/actions";
import { Middleware, MiddlewareAPI } from "./types/middleware";
import { Todo, TodoAction } from "./types/forTests";
import id from "./utils/forTests";

describe("applyMiddleware", () => {
  it("is a function", () => {
    expect(applyMiddleware).toBeInstanceOf(Function);
  });

  it("check for function overloading when we pass enchancer but don't pass preloadedState", () => {
    const reducer = jest.fn((state = 1) => state + 1);
    const enchancer = jest.fn(() => applyMiddleware());
    createStore(reducer, enchancer);

    expect(enchancer).toHaveBeenCalled();
  });

  it("passes through all arguments of dispatch calls from within middleware", () => {
    const spy = jest.fn();
    const testCallArgs = ["test"];
    const todos = (state: Todo[] = [], action: TodoAction) => {
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

    interface MultiDispatch<A extends Action = AnyAction> {
      <T extends A>(action: T, extraArg?: string[]): T;
    }

    const multiArgMiddleware: Middleware<MultiDispatch, any, MultiDispatch> = (
      _store
    ) => {
      return (next) => (action: any, callArgs?: any) => {
        if (Array.isArray(callArgs)) {
          return action(...callArgs);
        }
        return next(action);
      };
    };

    function dummyMiddleware({ dispatch }: MiddlewareAPI) {
      return (_next: unknown) => (action: any) =>
        dispatch(action, testCallArgs);
    }

    const store = createStore(
      todos,
      applyMiddleware(multiArgMiddleware, dummyMiddleware)
    );

    store.dispatch(spy as any);
    expect(spy.mock.calls[0]).toEqual(testCallArgs);
  });
});
