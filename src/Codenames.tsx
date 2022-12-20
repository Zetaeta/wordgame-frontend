import { useLoaderData } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { useState, useEffect, useMemo } from "react";
import CodeWord from "./CodeWord";
import { MyNavbar } from "./common";
import Color from "color";
import { useParams } from "react-router-dom";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import socket from "./socket";
import { EyeFill, Shuffle } from "react-bootstrap-icons";
import { Button } from "react-bootstrap";

// export class CodeNames extends React.Component {}
const menuId = "colorMenu";
export function CodeNames(props: any) {
  const params = useParams();
  const id = params.id;
  let gameData = useLoaderData() as any;
  const [showKey, setShowKey] = useState(false);
  const [hideCovered, setHideCovered] = useState(true);
  const [game, setGame] = useState(gameData);
  const [colors, setColors] = useState(gameData.colors);
  const [key, setKey] = useState(gameData.key);
  const [spymaster, setSpymaster] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
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
    socket.on("send key", (key) => {
      setKey(key);
    });
    socket.on("player data", (players) => {
      setPlayers(players);
    });
    socket.onAny((eventName, message: any) => {
      console.log("receiving message: " + eventName);
      console.log(message);
    });
    return () => {
      console.log("Cleaning up sockets");
      socket.offAny();
      socket.off("set color");
      socket.off("send key");
      socket.off("player data");
    };
  }, [id]);
  function send(msgType: string, data: any = {}) {
    socket.emit("cnmsg", { msgType: msgType, gameId: id, ...data });
  }
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
  const [team1, team2] = useMemo(() => {
    let team1 = [];
    let team2 = [];
    console.log(players);
    for (let player of players) {
      if (player.team == 2) {
        team2.push(player);
      } else {
        team1.push(player);
      }
    }
    return [team1, team2];
  }, [players]);
  console.log(team1);
  return (
    <div>
      {" "}
      <MyNavbar></MyNavbar>
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
        <Container>
          <Row xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className="g-2">
            {range(25).map((i: number) => {
              const word = game.words[i];
              let color = YELLOW;
              if (showKey && key && key[i]) {
                color = getColor(key[i]);
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
                    invert={color == BLACK}
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
            disabled={spymaster}
            defaultChecked={spymaster}
            label="Spy Master"
            onChange={(event) => {
              console.log(event.target.checked);
              if (event.target.checked) {
                setSpymaster(true);
                socket.emit("cnmsg", {
                  msgType: "spymaster",
                  gameId: id,
                });
              }
            }}
            reverse
            className="switch-red"
          ></Form.Check>{" "}
          <Row>
            {" "}
            <Col>
              Red team
              <PlayerList players={team1} />
            </Col>
            <Col>
              Blue team
              <PlayerList players={team2}></PlayerList>
            </Col>
          </Row>
          <Button
            onClick={() => {
              send("shuffle teams");
            }}
          >
            <Shuffle></Shuffle>
          </Button>
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
const RED = Color.rgb(0xf4, 0x43, 0x36);
const BLUE = Color.rgb(0x1e, 0x88, 0xe5);
const GRAY = Color.rgb(0xd6, 0xd6, 0xd6);
const BLACK = Color.rgb(0x21, 0x21, 0x21);

function getColor(n: number) {
  return [YELLOW, RED, BLUE, GRAY, BLACK][n];
}

function testGames() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((a) => ({
    name: "game" + a,
    id: a.toString(),
  }));
}

export default CodeNames;
interface Player {
  name: string;
  spymaster: boolean;
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
            {player.spymaster ? (
              <EyeFill className="d-inline-block float-end"></EyeFill>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
