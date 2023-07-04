export default function id(state: { id: number }[]) {
  return (
    state.reduce((result, item) => (item.id > result ? item.id : result), 0) + 1
  );
}
