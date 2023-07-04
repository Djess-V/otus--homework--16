import { AnyAction } from "./actions";

export interface Todo {
  id: number;
  text: string;
}

export type TodoAction = { type: "ADD_TODO"; text: string } | AnyAction;
