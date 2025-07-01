"use client"
import Link from "next/link";
import { useEffect } from "react";



export default function Home() {
  return (
      <Link href={"/paleEye"}>
        <img src={"Pale Eye Black.svg"} alt="The Pale Eye"/>
      </Link>
  );
}
