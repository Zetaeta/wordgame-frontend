import { useLoaderData } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import ToggleButton from "react-bootstrap/ToggleButton";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import WordForm from "./WordForm";
import { serverUrl } from "./Env";
import CodeWord from "./CodeWord";
import axios from "axios";
import Color from "color";
import { useParams } from "react-router-dom";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

const socketUrl = "ws" + serverUrl.slice(4, -4) + "8000";
const socket = io(socketUrl);
// export class CodeNames extends React.Component {}
const menuId = "colorMenu";
export function CodeNames(props: any) {
  const params = useParams();
  const id = params.id;
  let gameData = useLoaderData() as any;
  const [showKey, setShowKey] = useState(false);
  const [hideCovered, setHideCovered] = useState(true);
  const [game, setGame] = useState(gameData);
  const [colors, setColors] = useState(gameData.boardColors);
  const [spyMaster, setSpyMaster] = useState(false);
  useEffect(() => {
    console.log("sending join message for id " + id);
    socket.emit("join codenames", { id: id });
    console.log("sent");
    socket.on("set color", (changes: [{ i: number; c: number }]) => {
      setColors((colors: number[]) => {
        let newColors = [...colors];
        for (let { i, c } of changes) {
          newColors[i] = c;
        }
        console.log("new colors: " + newColors.toString());
        return newColors;
      });
    });
    socket.onAny((eventName, message: any) => {
      console.log("receiving message: " + eventName);
      console.log(message);
    });
    return () => {
      console.log("Cleaning up sockets");
      socket.offAny();
      socket.off("set color");
    };
  }, [id]);
  function handleItemClick(
    params: any //{ id, event, props, triggerEvent, data }: any
  ) {
    // console.log(event, props, triggerEvent, data);
    socket.emit("cnmsg", {
      msgType: "set color",
      gameId: id,
      changes: [{ i: params.props.wordId, c: +params.id }],
    });
    console.log("send sat color message");
  }

  const { show } = useContextMenu({ id: menuId });
  console.log("colors: " + colors.toString());
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
              <Nav.Item>
                <NavDropdown title="Settings">
                  <NavDropdown.Item
                    onClick={() => {
                      // this.setState({ displayColorPicker: true });
                    }}
                  >
                    Set colour
                    <ToggleButton type="checkbox" value="1"></ToggleButton>
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
        <Container>
          <Row xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className="g-2">
            {range(25).map((i: number) => {
              const word = game.words[i];
              let color = YELLOW;
              if (showKey && game.key[i]) {
                color = getColor(game.key[i]);
              }
              let covered = false;
              if (colors[i]) {
                covered = hideCovered;
                color = getColor(colors[i]);
              }
              return (
                <Col className=" pb-0 align-items-stretch" key={"word-" + i}>
                  <CodeWord
                    word={word}
                    cover={covered}
                    key={word}
                    color={color}
                    onContextMenu={(e) => {
                      show({ event: e, props: { wordId: i } });
                      console.log("shown");
                    }}
                  ></CodeWord>
                </Col>
              );
            })}
          </Row>
        </Container>
        <Container>
          <Form.Check
            type="switch"
            label="Show key"
            defaultChecked={showKey}
            onChange={(event) => {
              setShowKey(event.target.checked);
            }}
          ></Form.Check>{" "}
          <Form.Check
            type="switch"
            className="text-opacity-25 text-dark"
            label="Hide covered"
            defaultChecked={hideCovered}
            onChange={(event) => {
              setHideCovered(event.target.checked);
            }}
          ></Form.Check>
          <Form.Check
            type="switch"
            label="Spy Master"
            onChange={(event) => {
              console.log(event.target.checked);
            }}
            reverse
            className="switch-red"
          ></Form.Check>
        </Container>
      </div>
      <Menu id={menuId}>
        <Item onClick={handleItemClick} id={"1"}>
          Red
        </Item>
        <Item onClick={handleItemClick} id="2">
          Blue
        </Item>
        <Item onClick={handleItemClick} id="3">
          Neutral
        </Item>
        <Item onClick={handleItemClick} id="4">
          Assassin
        </Item>
        <Item onClick={handleItemClick} id="0">
          Default
        </Item>
      </Menu>
    </div>
  );
}

function range(n: number) {
  return Array.from(Array(n).keys());
}

const YELLOW = Color.rgb(0xff, 0xe0, 0x82);
const RED = Color.rgb(0xff, 0, 0);
const BLUE = Color.rgb(0, 0, 0xff);
const GRAY = Color.rgb(100, 100, 100);
const BLACK = Color.rgb(0, 0, 0);

function getColor(n: number) {
  return [YELLOW, RED, BLUE, GRAY, BLACK][n];
}

export function CodeNamesHome() {
  let games = useLoaderData() as any[];
  const [newGame, setNewGame] = useState(false);
  console.log(games);
  // games = testGames();
  games = games.filter((p) => p);
  games.push(null);
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
      <Container>
        <CardGroup>
          {games.map((g: any) => {
            let card = null;
            let style = {
              minWidth: "18rem",
              maxWidth: "18rem",
              height: "18rem",
            };
            let key = "add";
            if (g) {
              key = g.id;
              card = (
                <a href={`/codenames/${g.id}`}>
                  {" "}
                  <Card style={style}>
                    <Card.Body>
                      <p className="h1 text-dark">{g.name}</p>
                    </Card.Body>
                  </Card>
                </a>
              );
            } else {
              card = (
                <Card
                  style={style}
                  onClick={() => {
                    setNewGame(true);
                  }}
                >
                  <Card.Body>
                    <p className="h1"> New Game</p>
                  </Card.Body>
                </Card>
              );
            }
            return (
              <Col className="container-fluid mt-4" key={key}>
                {card}
              </Col>
            );
          })}
        </CardGroup>
      </Container>
      <Modal
        show={newGame}
        onHide={() => {
          setNewGame(false);
        }}
      >
        <Modal.Body>
          <WordForm
            submit={(name: string) => {
              setNewGame(false);
              axios
                .post(serverUrl + "/api/codenames/new", { name: name })
                .then((response) => {
                  console.log(response.data);
                });
            }}
          ></WordForm>
        </Modal.Body>
      </Modal>
    </div>
  );
}

function testGames() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((a) => ({
    name: "game" + a,
    id: a.toString(),
  }));
}

export default CodeNames;
