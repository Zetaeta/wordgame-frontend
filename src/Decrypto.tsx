// import { useLoaderData } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { useState, useEffect, useRef } from "react";
import { MyNavbar } from "./common";
import { useParams } from "react-router-dom";
import "react-contexify/dist/ReactContexify.css";
import socket from "./socket";
import {
  ChevronLeft,
  ChevronRight,
  EyeFill,
  Shuffle,
} from "react-bootstrap-icons";
import { Badge, Button, Card, Collapse } from "react-bootstrap";
import "./decrypto.scss";
import { Textfit } from "react-textfit";
// export class CodeNames extends React.Component {}
enum Phase {
  PreStart,
  MakeClues,
  EnemyGuess,
  TeamGuess,
}
interface GameState {
  words: string[];
  phase: Phase;
  canStart?: boolean;
  myStatus: string;
  key?: number[];
  ourClues?: string[];
  theirClues: string[];
  theirGuess: number[];
  score: { team: Score; enemy: Score };
}
interface Score {
  hits: number;
  misses: number;
}

function defaultState() {
  const zeroScore = { hits: 0, misses: 0 };
  return {
    words: [],
    phase: Phase.PreStart,
    myStatus: "waiting",
    ourClues: [],
    theirClues: [],
    theirGuess: [],
    score: { team: zeroScore, enemy: { ...zeroScore } },
  };
}

export function Decrypto(props: any) {
  const params = useParams();
  const id = params.id;
  // let gameData = useLoaderData() as any;
  // const [game, setGame] = useState(gameData);
  // const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState([[], []]);
  // const [words, setWords] = useState([]);
  const [status, setStatus] = useState<GameState>(defaultState());
  const [history, setHistory] = useState({
    team: [],
    enemy: [],
  });
  const [showHist1, setShowHist1] = useState(true);
  const [showHist2, setShowHist2] = useState(true);
  const words = status?.words;
  useEffect(() => {
    console.log("sending join message for id " + id);
    socket.emit("join decrypto", { id: id });
    console.log("sent");

    socket.on("dcmsg", (message) => {
      if (message.msgType === "players") {
        const teams = message.teams;
        setTeams(teams);
      } else if (message.msgType === "status") {
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
  const preStart = status.phase === Phase.PreStart;
  if (preStart) {
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
  } else if (status.myStatus === "lateJoin") {
    content = <h1>The game has already started. Choose a team to join:</h1>;
  } else {
    content = (
      <>
        <div className="w-100 ">
          <Row className="g-1 justify-content-end" md={2} xs={1}>
            <Col className=" d-flex flex-column justify-content-center" md={4}>
              <Scoreboard score={status.score}></Scoreboard>
            </Col>
            <Col
              onClick={() => {
                setShowHist1(!showHist1);
              }}
              className="col-md-8 col-10 align-self-end"
            >
              <WordStand words={["?", "?", "?", "?"]} enemy></WordStand>
            </Col>
          </Row>
          <Collapse in={showHist1}>
            <div>
              <History history={history.enemy} reverse></History>
            </div>
          </Collapse>
        </div>{" "}
        <div className="w-100 mt-4">
          <Row className="g-1 justify-content-start" md={2} xs={1}>
            <Col
              xs={10}
              md={8}
              className="align-self-start"
              onClick={() => {
                setShowHist2(!showHist2);
              }}
            >
              <WordStand words={words} />
            </Col>
            {status.key && (
              <Col
                className="d-flex flex-column justify-content-center align-items-center order-first order-md-last"
                md={4}
              >
                <Key gameKey={status.key} />
              </Col>
            )}
          </Row>
          <Collapse in={showHist2}>
            <div
              style={
                {
                  //height: "max-content"
                }
              }
            >
              <History history={history.team}></History>
            </div>
          </Collapse>{" "}
        </div>
        {status.ourClues?.length ? (
          <h1 className="text-center display-5">
            Clues:{" "}
            <span className="fw-bold">{cluesString(status.ourClues)}</span>
          </h1>
        ) : null}
        {status.theirGuess?.length ? (
          <h1 className="text-center display-5">
            Enemy guess: <Badge bg="dark">{keyString(status.theirGuess)}</Badge>
          </h1>
        ) : null}
        {status.myStatus === "teamGuess" && <GuessForm send={send}></GuessForm>}
        {status.theirClues?.length > 0 && (
          <h1 className="text-center display-5">
            Enemy clues:{" "}
            <span className="fw-bold">{cluesString(status.theirClues)}</span>.
          </h1>
        )}
        {status.myStatus === "enemyGuess" && (
          <GuessForm send={send} enemy></GuessForm>
        )}
        {status.myStatus === "clues" && (
          <CluesForm
            gameKey={status.key as number[]}
            send={send}
            words={words}
          ></CluesForm>
        )}
      </>
    );
  }
  function LateJoinButton({ team }: { team: number }) {
    return (
      <Button
        onClick={() => {
          send("lateJoin", { team: team });
        }}
      >
        Join team {team + 1}
      </Button>
    );
  }

  return (
    <div>
      {" "}
      <MyNavbar></MyNavbar>
      <Container>
        <div className="d-flex flex-column min-vh-100 justify-content-evenly align-items-center ">
          {content}
          <Row className="w-100 justify-content-center">
            {" "}
            <Col xs="6" md="4" xl="3">
              Team 1
              <PlayerList
                players={teams[0]}
                changeable={preStart}
                team={0}
                send={send}
              />
              {status.myStatus === "lateJoin" && (
                <LateJoinButton team={0}></LateJoinButton>
              )}
            </Col>
            <Col xs="6" md="4" xl="3">
              Team 2
              <PlayerList
                players={teams[1]}
                changeable={preStart}
                team={1}
                send={send}
              ></PlayerList>
              {status.myStatus === "lateJoin" && (
                <LateJoinButton team={1}></LateJoinButton>
              )}
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
        </div>
      </Container>
    </div>
  );
}

function cluesString(clues: string[]) {
  return `${clues[0]}, ${clues[1]}, ${clues[2]}`;
}

function Scoreboard({ score }: any) {
  if (!score) {
    return null;
  }
  return (
    <Card className="text-bg-warning h-100">
      <Card.Body className="py-2">
        <div className="h6 text-center">
          <Row className=" text-break">
            <Col className="col-3"></Col>
            <Col>
              Hits
              <br /> (2 to win)
            </Col>
            <Col>
              Misses
              <br /> (2 to lose)
            </Col>
          </Row>
          <Row>
            <Col className="col-3 text-start ps-1 pe-0">Allies:</Col>
            <Col className="text-success h4">{score.team.hits}</Col>
            <Col className="text-danger h4">{score.team.misses}</Col>
          </Row>
          <Row>
            <Col className="col-3 text-start ps-1 p-0">Enemies:</Col>
            <Col className="text-success h4">{score.enemy.hits}</Col>
            <Col className="text-danger h4">{score.enemy.misses}</Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function keyString(key: number[]) {
  return key.map((k) => k + 1).toString();
}

// const historyColors = [
//   "history-normal",
//   "history-hit",
//   "history-fail",
//   "history-both",
// ];
const historyColors = ["bg-primary", "bg-success", "bg-warning", "bg-danger"];

function History({ history, reverse }: any) {
  if (history.length === 0) {
    return null;
  }
  return (
    <div>
      {history.map((entry: any, i: number) => {
        return (
          <HistoryLine
            entry={entry}
            reverse={reverse}
            key={i.toString()}
          ></HistoryLine>
        );
      })}
    </div>
  );
}

const badgeClass = "text-end d-inline-block ms-md-auto ms-2 me-1";

function HistoryLine({ entry, reverse }: { entry: any; reverse: boolean }) {
  const [expand, setExpand] = useState(false);
  let color = historyColors[0];
  if (entry.enemyRight) {
    if (entry.teamWrong) {
      color = historyColors[3];
    } else {
      color = historyColors[1];
    }
  } else if (entry.teamWrong) {
    color = historyColors[2];
  }
  color = color + " bg-opacity-50";
  const info = (
    <Col>
      <div className={reverse ? " float-end" : ""}>
        <Collapse in={expand} dimension="width">
          <div>
            <div
              className={"history-info border-end px-1 " + color}
              style={{
                //"25vmin"
                width: "fit-content",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-none d-md-inline-block ">Key: </div>{" "}
                <Badge bg="dark" className={badgeClass}>
                  {keyString(entry.key)}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-none d-md-inline-block me-1">Enemy: </div>
                <Badge
                  bg={entry.enemyRight ? "success" : "danger"}
                  className={badgeClass}
                >
                  {keyString(entry.enemyGuess)}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-none d-md-inline-block ">Guess: </div>
                <Badge
                  bg={entry.teamWrong ? "danger" : "success"}
                  className={badgeClass}
                >
                  {keyString(entry.teamGuess)}
                </Badge>
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    </Col>
  );
  return (
    <Row
      onClick={() => {
        setExpand(!expand);
      }}
      className="h-100 g-0"
    >
      {reverse ? info : null}
      <Col className={color} xs="10" md="8">
        <Row className={"border-bottom w-100 h-100 g-1 bg-opacity-50 mt-0 "}>
          {entry.table.map((clue: string | null, i: number) => {
            return (
              <Col
                className={
                  "border-end h3 text-center d-flex flex-column justify-content-center col-3 "
                }
                key={i.toString()}
              >
                <Textfit mode="single" max={25}>
                  {clue}
                </Textfit>
              </Col>
            );
          })}
        </Row>
      </Col>
      {reverse ? null : info}
    </Row>
  );
}

type SendFn = (msgType: string, data: any) => void;

function GuessForm(props: { enemy?: boolean; send: SendFn }) {
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
    <div>
      <h3>Enter Guess:</h3>
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
    </div>
  );
}

interface CluesFormProps {
  send: SendFn;
  words: string[];
  gameKey: number[];
}

function CluesForm(props: CluesFormProps) {
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
    <div className="mt-2">
      <h3 className="text-center">Enter clues:</h3>
      <Form onSubmit={onSubmit} className="text-center">
        <Form.Group as={Row} className="mb-3">
          {range(3).map((i) => {
            return (
              <Col key={i.toString()}>
                <Form.Label>
                  <span className="h5">{props.gameKey[i] + 1}</span>. Clue for:{" "}
                  <span className="fw-bold">
                    {" "}
                    {props.words[props.gameKey[i]]}
                  </span>
                </Form.Label>
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
    </div>
  );
}

function range(n: number) {
  return Array.from(Array(n).keys());
}

// const BLACK = Color.rgb(0x21, 0x21, 0x21);

interface Player {
  name: string;
  role: boolean;
  username: string;
}

function PlayerList({
  changeable,
  players,
  team,
  send,
}: {
  changeable: boolean;
  players: Player[];
  team: number;
  send: SendFn;
}) {
  let playerNo = 0;
  return (
    <ul className="list-group">
      {players.map((player) => {
        ++playerNo;
        return (
          <li key={playerNo.toString()} className="list-group-item">
            {changeable && team === 1 ? (
              <Button
                variant="link"
                onClick={() => {
                  send("changeTeam", { player: player.username, team: 0 });
                }}
              >
                <ChevronLeft></ChevronLeft>
              </Button>
            ) : null}{" "}
            {player.name}
            {player.role ? (
              <EyeFill className="d-inline-block float-end"></EyeFill>
            ) : null}
            {changeable && team === 0 ? (
              <Button
                variant="link"
                onClick={() => {
                  send("changeTeam", { player: player.username, team: 1 });
                }}
              >
                <ChevronRight></ChevronRight>
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function Key({ gameKey }: { gameKey: number[] }) {
  const word = gameKey.map((k) => k + 1).toString();

  return (
    <h1 className="display-4">
      Key: <Badge bg="dark">{word}</Badge>
    </h1>
  );
}
export default Decrypto;

function WordStand({ words, enemy }: { words: string[]; enemy?: boolean }) {
  const color = enemy ? "bg-danger" : "bg-primary";
  return (
    <Card className="bg-secondary bg-opacity-25  shadow">
      <Card.Body className="px-1">
        <Row className="row-cols-4 g-1">
          {words &&
            words.map((word, i) => {
              return (
                <Col className="d-flex flex-column" key={i.toString()}>
                  <Card
                    className={
                      "  h-100   text-center  shadow-sm text border-dark border border-3 " +
                      color
                    }
                    style={
                      {
                        // maxWidth: "16rem",
                        // backgroundColor: color.string(),
                        // minHeight: "5rem",
                      }
                    }
                  >
                    <Card.Body
                      className={
                        "px-1 py-2 d-flex flex-column h2 justify-content-center text-codeword-inverted fw-bold"
                      }
                    >
                      <Textfit mode="single" max={30}>
                        {word}
                      </Textfit>
                    </Card.Body>
                  </Card>
                  <div>
                    <h2 className="text-center">{i + 1}</h2>
                  </div>
                </Col>
              );
            })}
        </Row>
      </Card.Body>
    </Card>
  );
}
