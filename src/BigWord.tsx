import React, { useState } from "react";
import ChangeHighlight from "react-change-highlight";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import DropdownButton from "react-bootstrap/DropdownButton";
import NavDropdown from "react-bootstrap/NavDropdown";
import Color from "color";
import { ChromePicker } from "react-color";
import Word from "./Word";
import { Message } from "./Message";
import * as Msg from "./Message";
import WordForm from "./WordForm";
import {
  CaretRightFill,
  Clock,
  CheckCircleFill,
  XCircleFill,
  SkipEndFill,
  FastForwardFill,
} from "react-bootstrap-icons";
//import zWebSocket from "ws-browser";
import { LoginForm, LoginState } from "./Login";
type BigWordState = {
  clues: Clue[];
  word: string;
  guess: string;
  guesser: string;
  phase: Phase;
  myRole: Role;
  count: number;
  self: Player;
  players: Player[];
  colors: Map<string, Color>;
  deletePlayerModal: boolean;
  displayColorPicker: boolean;
  deletingPlayer?: PlayerId;
};

type BigWordProps = {};

enum Phase {
  Prelim = "Prelim",
  MakeClues = "MakeClues",
  InspectClues = "InspectClues",
  MakeGuess = "MakeGuess",
  Complete = "Complete",
}
let socket: WebSocket | null = null;
const defaultColor = Color.rgb(0x18, 255, 255);

export function BigWordHome() {
  let [login, setLogin] = useState(false);
  if (login) {
    return <BigWord></BigWord>;
  } else {
    return (
      <LoginForm
        login={(form) => {
          socket = new WebSocket(
            "ws://" + form.ip + ":" + form.port
          ) as WebSocket;
          const ws = socket as WebSocket;
          ws.onopen = () => {
            setLogin(true);
            ws.send(`{"msgtype": "join", "name": "${form.name}"}\n`);
          };
        }}
      ></LoginForm>
    );
  }
}

class BigWord extends React.Component<BigWordProps, BigWordState> {
  state: BigWordState;

  constructor(props: any) {
    super(props);
    this.state = {
      count: 0,
      word: "",
      guess: "",
      guesser: "",
      phase: Phase.Prelim,
      myRole: "clue",
      self: {
        id: 0,
        name: "",
        ready: false,
        role: "clue",
      },
      clues: [
        {
          word: "test",
          name: "me",
          id: 0,
        },
        {
          word: "test2",
          name: "someone",
          id: 1,
        },
      ],
      players: [],
      colors: new Map<string, Color>(),
      deletePlayerModal: false,
      displayColorPicker: false,
    };
    if (socket) {
      socket.onmessage = (data) => {
        console.log(data.data);
        this.handleMessage(JSON.parse(data.data));
      };
    }
  }

  render() {
    const closeModal = () => {
      this.setState({ deletePlayerModal: false });
    };
    return (
      <div>
        {" "}
        <Navbar bg="primary" expand="lg">
          <Container>
            <Navbar.Brand>BigWord</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {" "}
                <Nav.Link
                  onClick={() =>
                    this.sendMsg(Msg.NextPhase(Phase[this.state.phase]))
                  }
                >
                  <FastForwardFill
                    className="d-inline-block"
                    size="2em"
                  ></FastForwardFill>
                  Next Phase
                </Nav.Link>{" "}
                <Nav.Link
                  onClick={() => {
                    this.sendMsg(Msg.NextTurn());
                  }}
                >
                  <SkipEndFill className="d-inline-block" size="2em" /> Next
                  Round
                </Nav.Link>
                <Nav.Item>
                  <NavDropdown title="Settings">
                    <NavDropdown.Item
                      onClick={() => {
                        this.setState({ displayColorPicker: true });
                      }}
                    >
                      Set colour
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
          {/*this.state.displayColorPicker ? (
            <ColorPicker initial={this.myColor()}></ColorPicker>
          ) : null */}
          {this.renderPlayers()}
          {this.theWord()}
          {this.theGuess()}
          <div className="card-group">
            {this.state.clues.map((clue) => {
              const name = clue.name ? clue.name : this.getPlayerName(clue.id);
              let color = defaultColor;
              if (!clue.shown) {
                color = Color.rgb(0xd6, 0xd6, 0xd6);
              } else if (this.state.colors.has(name)) {
                color = this.state.colors.get(name) as Color;
              }
              return (
                <Word
                  name={name}
                  word={clue.word}
                  key={name}
                  onClick={() => {
                    if (this.state.phase == Phase.InspectClues) {
                      this.sendMsg(
                        Msg.ClueVis(clue.id, !(clue.shown as boolean))
                      );
                    }
                  }}
                  color={color}
                ></Word>
              );
            })}
          </div>
          <Modal show={this.state.deletePlayerModal} onHide={closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Delete Player{" "}
                {this.getPlayerName(this.state.deletingPlayer as PlayerId)}?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
              <Button
                onClick={() => {
                  closeModal();
                  this.deletePlayer(this.state.deletingPlayer as number);
                }}
                variant="danger"
              >
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>{" "}
          <Modal
            show={this.state.displayColorPicker}
            onHide={() => {
              this.setState({ displayColorPicker: false });
            }}
          >
            <Modal.Body>
              <ColorPicker
                select={({
                  r,
                  g,
                  b,
                  a,
                }: {
                  r: number;
                  g: number;
                  b: number;
                  a: number;
                }) => {
                  console.log(r);
                  const colorVal = valueFromRgba(r, g, b, a);
                  console.log(colorVal);
                  this.sendMsg(Msg.SetColor(colorVal));
                }}
                initial={this.myColor()}
              ></ColorPicker>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary">Close</Button>
            </Modal.Footer>
          </Modal>
          {this.submitClue()}
          {this.submitGuess()}
          {this.readyButton()}
        </div>
      </div>
    );
  }

  theGuess() {
    if (this.state.phase != Phase.Complete) {
      return null;
    }
    return (
      <p>
        {this.state.guesser} guessed {this.state.guess}
      </p>
    );
  }

  myColor() {
    const { colors, self } = this.state;
    if (colors.has(self.name)) {
      return colors.get(self.name);
    }
    return defaultColor;
  }

  readyButton() {
    const phase = this.state.phase;
    if (
      phase == Phase.Prelim ||
      (phase == Phase.InspectClues && this.state.myRole == "clue") ||
      phase == Phase.Complete
    ) {
      return <Button onClick={() => this.sendMsg(Msg.Ready())}>Ready</Button>;
    }
  }

  renderPlayers() {
    return (
      <div className="row justify-content-center">
        <div className="col-auto">
          <ChangeHighlight>
            <Table className=" text-dark" borderless>
              <tbody>
                {this.state.players.map((player) => {
                  return (
                    <tr key={player.id.toString()}>
                      <td className="s">
                        {player.role === "guess" && (
                          <CaretRightFill color="black" size="1em" />
                        )}
                      </td>
                      <td
                        className={`h5 ${
                          player.role === "guess" ? "text-warning" : "text-dark"
                        }`}
                      >
                        {player.name}
                      </td>
                      <td ref={React.createRef()}>
                        {player.ready ? (
                          <CheckCircleFill size="1em" />
                        ) : (
                          <Clock size="1em" />
                        )}
                      </td>
                      <td>
                        <Button
                          onClick={() => {
                            this.confirmDeletePlayer(player.id);
                          }}
                          variant="link"
                        >
                          {" "}
                          <XCircleFill size="1em" color="black" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ChangeHighlight>
        </div>
      </div>
    );
  }

  menu() {
    return (
      <DropdownButton
        title="Settings"
        onSelect={(key, event) => {
          if (key === "1") {
            alert("setting color");
          }
        }}
      >
        <Dropdown.Item eventKey="1">Set colour</Dropdown.Item>
      </DropdownButton>
    );
  }

  submitClue() {
    if (
      this.state.phase == Phase.InspectClues &&
      this.state.myRole == "guess"
    ) {
      return <p>Waiting for players to inspect clues.</p>;
    }
    if (this.state.phase !== Phase.MakeClues) {
      return null;
    }
    if (this.state.myRole !== "clue") {
      return <p>Waiting for players to submit clues.</p>;
    }
    return (
      <WordForm
        submit={(clue) => {
          this.sendMsg(Msg.SendClue(clue));
        }}
        hint="Clue"
      ></WordForm>
    );
  }
  submitGuess() {
    if (this.state.phase !== Phase.MakeGuess) {
      return null;
    }
    if (this.state.myRole !== "guess") {
      return <p>Waiting for player to submit guess.</p>;
    }
    return (
      <WordForm
        submit={(clue) => {
          this.sendMsg(Msg.SendGuess(clue));
        }}
        hint="Guess"
      ></WordForm>
    );
  }

  sendMsg(msg: Message) {
    const str = `${JSON.stringify(msg)}\n`;
    if (socket) {
      socket.send(str);
    }
  }

  deletePlayer(id: PlayerId) {
    this.sendMsg(new Msg.RemovePlayer(id));
    //    alert("Removing player " + this.getPlayerName(id));
  }

  confirmDeletePlayer(id: PlayerId) {
    this.setState({
      deletePlayerModal: true,
      deletingPlayer: id,
    });
  }

  getPlayerName(id: PlayerId): string {
    const p = this.state.players.filter((p) => p.id === id)[0];
    return p ? p.name : "";
  }

  login = (form: LoginState) => {
    socket = new WebSocket("ws://" + form.ip + ":" + form.port) as WebSocket;
    const ws = socket as WebSocket;
    ws.onopen = () => {
      ws.send(`{"msgtype": "join", "name": "${form.name}"}\n`);
    };
    ws.onmessage = (data) => {
      console.log(data.data);
      this.handleMessage(JSON.parse(data.data));
    };
  };

  click() {
    this.setState({
      count: this.state.count + 1,
    });
  }

  handleMessage(msg: any) {
    const mType = msg.msgtype;
    if (mType === "status") {
      const mClues = msg.pers_status.clues;
      const mPlayers = msg.players as Player[];
      let clues = [];
      for (const id in mClues) {
        clues.push({
          word: mClues[id].word,
          id: toPlayerId(id),
          shown: mClues[id].shown,
        });
      }
      const role = msg.pers_status.role;
      const self = msg.self;
      const guess = msg.pers_status.guess;
      this.setState({
        word: msg.pers_status.word,
        guess: guess,
        guesser: msg.guesser,
        players: mPlayers,
        clues: clues,
        self: {
          ...self,
          role: role,
        },
        myRole: msg.pers_status.role,
        phase: Phase[msg.phase as keyof typeof Phase],
      });
    } else if (mType === "allcolors" || mType === "allcolours") {
      this.setState({
        colors: new Map<string, Color>(
          Object.keys(msg.colours).map((key: string) => [
            key,
            colorFromValue(msg.colours[key]),
          ])
        ),
      });
    } else if (mType === "setcolour") {
      let colors = this.state.colors;
      colors.set(msg.player, colorFromValue(msg.colour));
      this.setState({ colors: colors });
    }
  }

  theWord() {
    if (
      !this.state.word ||
      (this.state.myRole === "guess" && this.state.phase !== Phase.Complete)
    ) {
      return null;
    }
    return (
      <div>
        <p>The word is</p>
        <Word word={this.state.word} color={Color.rgb(0xff, 0xe0, 0x82)}></Word>
      </div>
    );
  }
}

function valueFromRgba(r: number, g: number, b: number, a: number): number {
  const arr = [a * 255, r, g, b];
  let val = 0;
  for (let i = 0; i < 4; ++i) {
    val += arr[i];
    if (i < 3) val <<= 8;
    console.log(val.toString(16));
  }
  console.log(val.toString(16));
  return val;
}

function colorFromValue(val: number): Color {
  let c = "#" + val.toString(16).padStart(8, "0");
  console.log(c);
  let arr = new Array(4);
  for (let i = 0; i < 4; ++i) {
    arr[i] = val & 0xff;
    val >>= 8;
  }
  let [b, g, r, a] = arr;
  return Color.rgb(r, g, b).alpha(a / 255);
  return Color(c);
}

export type Clue = {
  word: string;
  name?: string;
  id: PlayerId;
  shown?: boolean;
};
export type PlayerId = number;

export function toPlayerId(s: string): PlayerId {
  return +s;
}

export type Player = {
  name: string;
  id: PlayerId;
  role: Role;
  ready: boolean;
};
export type Role = "clue" | "guess";
export default BigWord;
function ColorPicker(props: any) {
  const [color, setColor] = useState(props.initial.hex());
  return (
    <ChromePicker
      onChangeComplete={(color, event) => {
        console.log(color.hex);
        console.log(color.toString());
        props.select(color.rgb);
      }}
      disableAlpha
      color={color}
      onChange={(color, event) => setColor(color.hex)}
    ></ChromePicker>
  );
}
