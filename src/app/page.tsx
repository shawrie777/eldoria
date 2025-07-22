"use client"
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid">
      <Link href={"https://azgaar.github.io/Fantasy-Map-Generator/?maplink=https://dl.dropboxusercontent.com/scl/fi/jdha43dce86864r6glj5p/Eldoria-2025-05-15-17-49.map?rlkey=gyxghmg7wh5035rytdefkymvf&dl=0"}>
        <figure>
          <img src={"world_map.png"} alt="World Map"/>
          <figcaption>The World Map</figcaption>
        </figure>
      </Link>
      <Link href={"/paleEye"}>
        <figure>
          <img src={"Pale Eye Black.svg"} alt="The Pale Eye"/>
          <figcaption>The Pale Eye</figcaption>
        </figure>
      </Link>
    </div>
  );
}
