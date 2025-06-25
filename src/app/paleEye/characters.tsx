'use client'

import React, { ReactNode } from "react";

import { useState } from "react"
import classNames from "classnames";

import style from './characterCircle.module.css'

type Clue = {
    title: string;
    description?: string;
} & (
    {src: string;} | {content: ReactNode}
)

type Character = {
  name?: string,
  codename?: string,
  town?: string,
  clues?: Array<string | Clue>,
  subs?: Character[],
  dead?: boolean,
}

function CharacterCard({character, clueSetter} : {character: Character, clueSetter: (c: Clue | null) => void}) {
    const [flipped, setFlipped] = useState<boolean>(false);
    function flip() {
        setFlipped(!flipped);
    }

    return <div className={classNames(style.outer)} onMouseEnter={flip} onMouseLeave={flip}>
        <div className={classNames(style.circle, flipped && style.flipped, character.dead && style.dead)}
       >
        <div>
            {character.name && <p>{character.name}</p>}
            {character.codename && <p>{character.codename}</p>}
            {character.town && <p>{character.town}</p>}
        </div>
        <div>
            {character.clues ? character.clues?.map((clue, idx) => {
                if (typeof clue === "string")
                    return <p key={idx}>{clue}</p>;
                return <p key={idx} className={style.clueLink}
                    onMouseEnter={() => clueSetter(clue)}
                    onMouseLeave={() => clueSetter(null)}
                    >
                    {clue.title}
                </p>
            }) : <p>No clues yet!</p>}
        </div>
    </div></div>
}

type Point = {
    x: number,
    y: number
}

type Line = {
    start: Point,
    end: Point
}

function lineMatch(first: Line, second: Line) {
    const firstHoriz = first.start.x === first.end.x;
    const secondHoriz = second.start.x === second.end.x;
    if (firstHoriz !== secondHoriz) return false;
    if (firstHoriz) {
        if (first.start.x <= second.start.x && second.start.x <= first.end.x) return true;
        if (first.start.x <= second.end.x && second.end.x <= first.end.x) return true;
        if (first.start.x >= second.start.x && second.start.x >= first.end.x) return true;
        if (first.start.x >= second.end.x && second.end.x >= first.end.x) return true;
    } else {
        if (first.start.y <= second.start.y && second.start.y <= first.end.y) return true;
        if (first.start.y <= second.end.y && second.end.y <= first.end.y) return true;
        if (first.start.y >= second.start.y && second.start.y >= first.end.y) return true;
        if (first.start.y >= second.end.y && second.end.y >= first.end.y) return true;
    }
    return false;
}

export function Board({characters}:{characters: Character[]}){
    const [currentClue, setCurrentClue] = useState<Clue | null>(null);

    const {rowMax, rowCount} = getCardCounts(characters);

    const width = 350 * rowMax;

    const results : React.JSX.Element[] = [];
    let paths: Line[] = []

    function addLine(l: Line) {
        const filtered = paths.filter(line => lineMatch(l, line));
        paths = paths.filter(line => !lineMatch(l, line));
        if (!filtered.length) paths.push(l);
        else {
            const xs = [l.start.x, l.end.x, ...filtered.flatMap(line => [line.start.x, line.end.x])];
            const ys = [l.start.y, l.end.y, ...filtered.flatMap(line => [line.start.y, line.end.y])];
            paths.push({
                start: {
                    x: Math.min(...xs),
                    y: Math.min(...ys),
                },
                end: {
                    x: Math.max(...xs),
                    y: Math.max(...ys),
                }
            });
        }
    }

    function renderChars(characters: Character[], rowStart: number, width: number, row: number, parentPos?: Point) {
        const sizes = characters.map(ch => {
            return {character: ch, count: ch.subs ? getCardCounts(ch.subs).rowMax : 1}
        });
        const total = sizes.reduce((total, current) => total + current.count, 0);
        
        let endPos = rowStart;
        sizes.forEach(({character, count}) => {
            const prevEnd = endPos;
            endPos += count / total * width;
            const pos = (prevEnd + endPos) / 2 - 150;
            
            if (parentPos) {
                addLine({start: parentPos, end: {x: parentPos.x, y: (parentPos.y + row * 350 + 150) / 2}});
                addLine({start: {x: parentPos.x, y: (parentPos.y + row * 350 + 150) / 2}, end: {x: pos + 150, y: (parentPos.y + row * 350 + 150) / 2}});
                addLine({start: {x: pos + 150, y: (parentPos.y + row * 350 + 150) / 2}, end: {x: pos + 150, y: row * 350 + 150}});
            };
            results.push(<foreignObject key={results.length} x={pos} y={row * 350} width="300px" height="300px">
                <CharacterCard character={character} clueSetter={setCurrentClue}/>
            </foreignObject>);
            
            if (character.subs) renderChars(character.subs, prevEnd, endPos - prevEnd, row + 1, {x: pos + 150, y: row * 350 + 150});
        })
    }

    renderChars(characters, 0, width, 0);
    return <>
        {currentClue && <RenderClue clue={currentClue}/>}
        <svg viewBox={`0 0 ${width} ${350 * rowCount}`} width={width} height={350 * rowCount}>
            {paths.map((l, idx) => <path key={idx} stroke="white" fill="none" d={`M ${l.start.x} ${l.start.y} L ${l.end.x} ${l.end.y}`}/>)}
            {results}
        </svg>
    </>
}

function RenderClue({clue} : {clue: Clue}) {
    return <div className={style.clue}>
        <h1>{clue.title}</h1>
        {"src" in clue ? <img src={clue.src} alt={clue.title}/> : clue.content}
        {clue.description && <p className={style.description}>{clue.description}</p>}
    </div>
}

function getCardCounts(characters: Character[]) : {rowMax : number, rowCount : number} {
    let rowCount = 0;
    let subs = characters;
    while (subs.length) {
        subs = subs.flatMap(ch => ch.subs).filter(ch => ch !== undefined);
        rowCount++;
    }

    return {rowMax: characters.reduce((total, ch) => total + (ch.subs ? getCardCounts(ch.subs!).rowMax : 1), 0), rowCount};
}

export const conspir : Character[] = [{
    codename: "Spider",
    clues: ["Ordered Crow's murder"],
    subs: [
        {
            codename: "Ibex",
            name: "Embervein",
            town: "Eldeguard",
            clues: [
                "Helped in Crow's murder",
                "Works at the Blackgem Mine",
                {
                    title: "Letter from Spider",
                    description: "Letter found in the office safe.",
                    content: <>
                        <p>Ibex,</p>
                        <p>Crow is having doubts. Meet with Hawk and deal with the situation. Report to the Broken Lantern in 2 weeks.</p>
                        <p>Spider</p>
                        </>
                },
                {
                    title: "Letter from Hawk",
                    description: "Letter found in the office safe.",
                    content: <>
                        <p>Ibex,</p>
                        <p>We'll move tomorrow. I'll be on the early boat from Freystar and we can head south on horseback.</p>
                        <p>Hawk</p>
                        </>
                },
                {
                    title: "Order from Oalehelm",
                    description: "Order for black saphire found in the office safe.",
                    content: <>
                        <p>Mr Embervein</p>
                        <p>Please prepare the following for delivery to Oalehelm as soon as possilbe.</p>
                        <ol><li>Refined Black Sapphire (Grade A) — 30 ingots (approx. 10 lbs each)</li>
                        <li>Rough-Cut Black Sapphire Shards — quantity: 20 pieces, no smaller than a man’s thumb</li>
                        <li>Sifting Dust and Tailings — 2 crates (as requested)</li></ol>
                        <p>The project must keep moving or our mutual friend will be displeased.</p>
                        <p>X</p>
                        </>
                }
            ]
        },
        {
            codename: "Crow",
            name: "Merrin",
            town: "Bellder",
            dead : true,
            clues: [
                {
                    title: "Ripped Cloth",
                    description: "Ripped cloth found in Merrin's House",
                    src: "cloth-worn-blue.webp"
                },{
                    title: "Merrin's Letter",
                    description: "A fragment of a letter found in Merrin's pocket",
                    content: <><p>…tience runs short! Fall in line or expect a visit from The Ibex.</p><p>Spider</p></>
                },{
                    title: "Merrin's Journal",
                    description: "A fragment of a page from Merrin's journal",
                    content: <p>Clearly it was foolish to think they'd let me leave! I need to move as soon as I recover the amulet!</p>
                },{
                    title: "Merrin's Amulet",
                    src: "necklace-simple-round-carved-wood.webp"
                }
            ]
        },
        {
            codename: "Hawk",
            town: "Freystar",
            clues: [
                "Helped in Crow's murder",
            ]
        },
    ]
}, {
    town: "Oalehelm"
}]

// export const conspirComplete : Character = {
//     codename: "Eagle",
//     town: "Earthfield",
//     subs: [
//         {
//             codename: "Komodo",
//             town: "Earthfield Castle"
//         },
//         {
//             codename: "Owl",
//             town: "Clifrost",
//         },
//         {
//             codename: "Bear",
//             town: "Oalehelm",
//         },
//         {
//             codename: "Magpie",
//             town: "Houndholver",
//             subs: [
//                 {
//                     codename: "Wolf",
//                     town: "Doroma",
//                 }
//             ]
//         },
//         {
//             codename: "Tiger",
//             town: "Sprinhelm",
//             subs: [
//                 {
//                     codename: "Vulture",
//                     town: "Sunhelm",
//                     subs: [
//                         {
//                             codename: "Lion",
//                             town: "Dradowden",
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             codename: "Spider",
//             town: "Sungview",
//             subs: [
//                 {
//                     codename: "Ibex",
//                     town: "Eldeguard",
//                 },
//                 {
//                     codename: "Crow",
//                     town: "Bellder",
//                 },
//                 {
//                     codename: "Hawk",
//                     town: "Freystar",
//                 },
//                 {
//                     codename: "Jaguar",
//                     town: "Snowdon",
//                     subs: [
//                         {
//                             codename: "Gorilla",
//                             town: "Mudwellder",
//                             subs: [
//                                 {
//                                     codename: "Raven",
//                                     town: "Bearcoast",
//                                 }
//                             ]
//                         }
//                     ]
//                 },
//                 {
//                     codename: "Fox",
//                     town: "Dawnwameda",
//                     subs: [
//                         {
//                             codename: "Unicorn",
//                             town: "Neguard",
//                         },
//                         {
//                             codename: "Panther",
//                             town: "Lightdatere",
//                         },
//                         {
//                             codename: "Dragon",
//                             town: "Lirehold",
//                             subs: [
//                                 {
//                                     codename: "Yeti",
//                                     town: "Mosshirere"
//                                 }
//                             ]
//                         }
//                     ]
//                 },
//             ]
//         }
//     ]
// }