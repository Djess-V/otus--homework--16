import { AnyAction } from "./actions";

export interface Todo {
  id: number;
  text: string;
}

export type TodoAction = { type: "ADD_TODO"; text: string } | AnyAction;

export function id(state: { id: number }[]) {
  return (
    state.reduce((result, item) => (item.id > result ? item.id : result), 0) + 1
  );
}
