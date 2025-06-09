'use client'

import React from "react";

import { useState } from "react"
import classNames from "classnames";

import style from './characterCircle.module.css'

export type Character = {
  name?: string,
  codename?: string,
  town?: string,
  clues?: string[],
  subs?: Character[],
}

export function CharacterCard({character} : {character: Character}) {
    const [flipped, setFlipped] = useState<Boolean>(false);
    function flip() {
        setFlipped(!flipped);
    }

    return <div className={classNames(style.outer)} onMouseEnter={flip} onMouseLeave={flip}>
        <div className={classNames(style.circle, flipped && style.flipped)}
       >
        <div>
            {character.name && <p>{character.name}</p>}
            {character.codename && <p>{character.codename}</p>}
            {character.town && <p>{character.town}</p>}
        </div>
        <div>
            {character.clues?.map((clue, idx) => <p key={idx}>{clue}</p>)}
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
    const {rowMax, rowCount} = getCardCounts(characters);

    const width = 250 * rowMax;

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
            const pos = (prevEnd + endPos) / 2 - 100;
            
            if (parentPos) {
                addLine({start: parentPos, end: {x: parentPos.x, y: (parentPos.y + row * 250 + 100) / 2}});
                addLine({start: {x: parentPos.x, y: (parentPos.y + row * 250 + 100) / 2}, end: {x: pos + 100, y: (parentPos.y + row * 250 + 100) / 2}});
                addLine({start: {x: pos + 100, y: (parentPos.y + row * 250 + 100) / 2}, end: {x: pos + 100, y: row * 250 + 100}});
            };
            results.push(<foreignObject key={results.length} x={pos} y={row * 250} width="200px" height="200px">
                <CharacterCard character={character}/>
            </foreignObject>);
            
            if (character.subs) renderChars(character.subs, prevEnd, endPos - prevEnd, row + 1, {x: pos + 100, y: row * 250 + 100});
        })
    }

    renderChars(characters, 0, width, 0);
    return <svg viewBox={`0 0 ${width} ${250 * rowCount}`} width={width} height={250 * rowCount}>
        {paths.map((l, idx) => <path key={idx} stroke="white" fill="none" d={`M ${l.start.x} ${l.start.y} L ${l.end.x} ${l.end.y}`}/>)}
        {results}
    </svg>
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
    subs: [
        {
            codename: "Ibex",
            town: "Eldeguard",
        },
        {
            codename: "Crow",
            town: "Bellder",
        },
        {
            codename: "Hawk",
            town: "Freystar",
        },
    ]
}]

export const conspirComplete : Character = {
    codename: "Eagle",
    town: "Earthfield",
    subs: [
        {
            codename: "Komodo",
            town: "Earthfield Castle"
        },
        {
            codename: "Owl",
            town: "Clifrost",
        },
        {
            codename: "Bear",
            town: "Oalehelm",
        },
        {
            codename: "Magpie",
            town: "Houndholver",
            subs: [
                {
                    codename: "Wolf",
                    town: "Doroma",
                }
            ]
        },
        {
            codename: "Tiger",
            town: "Sprinhelm",
            subs: [
                {
                    codename: "Vulture",
                    town: "Sunhelm",
                    subs: [
                        {
                            codename: "Lion",
                            town: "Dradowden",
                        }
                    ]
                }
            ]
        },
        {
            codename: "Spider",
            town: "Sungview",
            subs: [
                {
                    codename: "Ibex",
                    town: "Eldeguard",
                },
                {
                    codename: "Crow",
                    town: "Bellder",
                },
                {
                    codename: "Hawk",
                    town: "Freystar",
                },
                {
                    codename: "Jaguar",
                    town: "Snowdon",
                    subs: [
                        {
                            codename: "Gorilla",
                            town: "Mudwellder",
                            subs: [
                                {
                                    codename: "Raven",
                                    town: "Bearcoast",
                                }
                            ]
                        }
                    ]
                },
                {
                    codename: "Fox",
                    town: "Dawnwameda",
                    subs: [
                        {
                            codename: "Unicorn",
                            town: "Neguard",
                        },
                        {
                            codename: "Panther",
                            town: "Lightdatere",
                        },
                        {
                            codename: "Dragon",
                            town: "Lirehold",
                            subs: [
                                {
                                    codename: "Yeti",
                                    town: "Mosshirere"
                                }
                            ]
                        }
                    ]
                },
            ]
        }
    ]
}