import { hello } from ".";

describe("hello", () => {
  it("function check", () => {
    expect(hello).toBeInstanceOf(Function);

    const log = jest.spyOn(window.console, "log");

    hello();

    expect(log).toBeCalled();
  });
});
