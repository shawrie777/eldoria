"use client"
import { useContext } from "react";
import { DmContext } from "../context";
import { Board, conspir, conspirComplete } from "./characters";

export default function Conspiracy() {
  const dmMode = useContext(DmContext);
  return (
    <>
      <Board characters={dmMode ? [conspirComplete] : conspir} />
    </>
  );
}