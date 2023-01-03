import { useLoaderData } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { useState, useEffect, useMemo, useRef } from "react";
import CodeWord from "./CodeWord";
import { MyNavbar } from "./common";
import Color from "color";
import { useParams } from "react-router-dom";
import { Menu, Item, useContextMenu, Separator } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import socket from "./socket";
import { EyeFill, Shuffle } from "react-bootstrap-icons";
import { Button, Card, Table } from "react-bootstrap";

// export class CodeNames extends React.Component {}
const menuId = "colorMenu";
const teamNames = ["Unassigned", "Red", "Blue", "Neutral", "Assassin"];
const teamClasses = ["cn-default", "cn-red", "cn-blue", "cn-gray", "cn-black"];
interface GameState {
  words: string[];
  phase: Phase;
  canStart?: boolean;
  myStatus: string;
  key?: number[];
  ourClues?: string[];
  theirClues: string[];
  theirGuess: number[];
}

function defaultState() {
  return {
    words: [],
    phase: Phase.PreStart,
    myStatus: "waiting",
    ourClues: [],
    theirClues: [],
    theirGuess: [],
  };
}

export function Decrypto(props: any) {
  const params = useParams();
  const id = params.id;
  let gameData = useLoaderData() as any;
  const [game, setGame] = useState(gameData);
  // const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState([[], []]);
  // const [words, setWords] = useState([]);
  const [status, setStatus] = useState<GameState>(defaultState());
  const [history, setHistory] = useState({ team: [], enemy: [] });
  const words = status?.words;
  useEffect(() => {
    console.log("sending join message for id " + id);
    socket.emit("join decrypto", { id: id });
    console.log("sent");

    socket.on("dcmsg", (message) => {
      if (message.msgType == "players") {
        const teams = message.teams;
        setTeams(teams);
      } else if (message.msgType == "status") {
        delete message.msgType;
        setStatus(message);
      } else if (message.msgType === "history") {
        setHistory(message.history);
      }
    });
    socket.onAny((eventName, message: any) => {
      console.log("receiving message: " + eventName);
      console.log(message);
    });
    return () => {
      console.log("Cleaning up sockets");
      socket.offAny();
      socket.off("dcmsg");
    };
  }, [id]);
  function send(msgType: string, data: any = {}) {
    socket.emit("dcmsg", { msgType: msgType, gameId: id, ...data });
  }

  let content;
  if (status.phase == Phase.PreStart) {
    const startButton = (
      <Button
        onClick={() => {
          send("start");
        }}
      >
        Start game
      </Button>
    );
    if (status.canStart) {
      content = startButton;
    } else {
      content = <h2>Need more players to start game.</h2>;
    }
  } else {
    content = (
      <div>
        <div className="w-75 float-end">
          <History history={history.enemy}></History>
        </div>{" "}
        <div className="w-75 float-start">
          <Row className="g-1">
            {words &&
              words.map((word) => {
                return (
                  <Col>
                    <CodeWord word={word}></CodeWord>
                  </Col>
                );
              })}
          </Row>
          <History history={history.team}></History>{" "}
          {status.ourClues?.length ? (
            <p>clues: {status.ourClues.toString()}</p>
          ) : null}
          {status.theirGuess?.length ? (
            <p>Enemy guess: {status.theirGuess.toString()}</p>
          ) : null}
          {status.myStatus == "teamGuess" && (
            <GuessForm send={send}></GuessForm>
          )}
          {status.theirClues?.length > 0 && (
            <p>Enemy clues: {status.theirClues.toString()}</p>
          )}
          {status.myStatus == "enemyGuess" && (
            <GuessForm send={send} enemy></GuessForm>
          )}
          {status.myStatus == "clues" && <CluesForm send={send}></CluesForm>}
        </div>
        <div className="float-end w-25">
          {status.key && <Key gameKey={status.key} />}
        </div>
      </div>
    );
  }

  return (
    <div>
      {" "}
      <MyNavbar></MyNavbar>
      <div className="d-flex flex-column min-vh-100 justify-content-center  ">
        {content}
        <Container>
          <Row>
            {" "}
            <Col>
              Red team
              <PlayerList players={teams[0]} />
            </Col>
            <Col>
              Blue team
              <PlayerList players={teams[1]}></PlayerList>
            </Col>
          </Row>
          {status.phase === Phase.PreStart && (
            <Button
              onClick={() => {
                send("shuffle teams");
              }}
            >
              <Shuffle></Shuffle>
            </Button>
          )}
        </Container>
      </div>
    </div>
  );
}

function keyString(key: number[]) {
  return key.map((k) => k + 1).toString();
}

function History({ history }: any) {
  if (history.length == 0) {
    return null;
  }
  return (
    <>
      {history.map((entry: any) => {
        return (
          <Row className="border w-100 g-1">
            {entry.table.map((clue: string | null) => {
              return <Col className="border">{clue}</Col>;
            })}
            <Col className="col-2">
              <div>Key: {keyString(entry.key)}</div>
              <div>Enemy Guess: {keyString(entry.enemyGuess)}</div>
              <div>Team Guess: {keyString(entry.teamGuess)}</div>
            </Col>
          </Row>
        );
      })}
    </>
  );
}

function GuessForm(props: {
  enemy?: boolean;
  send: (msgType: string, data: any) => void;
}) {
  const entriesRef = useRef(Array(3));
  function onSubmit(event: any) {
    event.preventDefault();
    const finalized = entriesRef.current.map((field, i) => {
      return +field.value - 1;
    });
    console.log(finalized);
    const messageType = props.enemy ? "sendEnemyGuess" : "sendTeamGuess";
    console.log(messageType);
    props.send(messageType, { guess: finalized });
  }
  return (
    <Form onSubmit={onSubmit} className="text-center">
      <Form.Group as={Row} className="mb-3">
        {range(3).map((i) => {
          return (
            <Col key={i.toString()}>
              <Form.Control
                type="number"
                ref={(el: any) => (entriesRef.current[i] = el)}
              ></Form.Control>
            </Col>
          );
        })}
      </Form.Group>
      <Button type="submit" value="Submit">
        Submit
      </Button>
    </Form>
  );
}
function CluesForm(props: { send: (msgType: string, data: any) => void }) {
  const entriesRef = useRef(Array(3));
  function onSubmit(event: any) {
    event.preventDefault();
    const finalized = entriesRef.current.map((field, i) => {
      return field.value;
    });
    console.log(finalized);
    const messageType = "sendClue";
    props.send(messageType, { clues: finalized });
  }
  return (
    <Form onSubmit={onSubmit} className="text-center">
      <Form.Group as={Row} className="mb-3">
        {range(3).map((i) => {
          return (
            <Col key={i.toString()}>
              <Form.Control
                type="text"
                ref={(el: any) => (entriesRef.current[i] = el)}
              ></Form.Control>
            </Col>
          );
        })}
      </Form.Group>
      <Button type="submit" value="Submit">
        Submit
      </Button>
    </Form>
  );
}

function range(n: number) {
  return Array.from(Array(n).keys());
}
enum Phase {
  PreStart,
  MakeClues,
  EnemyGuess,
  TeamGuess,
}

const YELLOW = Color.rgb(0xff, 0xe0, 0x82);
const RED = Color.rgb(0xf4, 0x43, 0x36);
const BLUE = Color.rgb(0x1e, 0x88, 0xe5);
const GRAY = Color.rgb(0xd6, 0xd6, 0xd6);
const BLACK = Color.rgb(0x21, 0x21, 0x21);

interface Player {
  name: string;
  role: boolean;
}

function PlayerList({ players }: { players: Player[] }) {
  let playerNo = 0;
  return (
    <ul className="list-group">
      {players.map((player) => {
        ++playerNo;
        return (
          <li key={playerNo.toString()} className="list-group-item">
            {" "}
            {player.name}
            {player.role ? (
              <EyeFill className="d-inline-block float-end"></EyeFill>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function Key({ gameKey }: { gameKey: number[] }) {
  const word = gameKey.map((k) => k + 1).toString();
  const color = BLACK;
  return (
    <Row className="px-2">
      <Col className="col-3 h3 my-auto">Key: </Col>
      <Col>
        <Card
          className={" h-100    text-center  shadow-sm text-codeword-inverted"}
          style={{
            // maxWidth: "16rem",
            backgroundColor: color.string(),
            // height: "5rem",
          }}
        >
          <Card.Body
            className={
              "px-2 py-2 d-flex flex-column h1 justify-content-center text-codeword-inverted"
            }
          >
            {word}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
export default Decrypto;
