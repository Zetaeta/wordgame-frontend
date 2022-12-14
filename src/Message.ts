import { PlayerId, Player, Clue } from "./BigWord";
export type Message = {
  msgtype: string;
};

export class RemovePlayer implements Message {
  msgtype: string = "remplr";
  id: PlayerId;

  constructor(id: PlayerId) {
    this.id = id;
  }
}
export type SendClue = Message & { clue: string };
export function SendClue(clue: string): SendClue {
  return {
    clue: clue,
    msgtype: "sendclue",
  };
}
export type SendGuess = Message & { guess: string };
export function SendGuess(guess: string): SendGuess {
  return {
    guess: guess,
    msgtype: "sendguess",
  };
}

export function NextTurn(): Message {
  return { msgtype: "nextturn" };
}
export type NextPhase = Message & { currphase: string };

export function NextPhase(phase: string): NextPhase {
  return {
    msgtype: "nextphase",
    currphase: phase,
  };
}

export function Ready(): Message {
  return { msgtype: "ready" };
}
export type ClueVis = Message & { playerid: PlayerId; visible: boolean };

export function ClueVis(id: PlayerId, shown: boolean) {
  return {
    msgtype: "cluevis",
    playerid: id,
    visible: shown,
  };
}
export type SetColor = Message & { color: number };

export function SetColor(color: number) {
  return {
    msgtype: "setcolour",
    colour: color,
  };
}
