import { Board, conspir, conspirComplete } from "./characters";

export default function Conspiracy() {
  return (
    <>
      <Board characters={conspir} />
    </>
  );
}