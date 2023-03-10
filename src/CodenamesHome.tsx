import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Container,
  Form,
  Modal,
  Table,
} from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { MyNavbar } from "./common";
import { BASE_URL } from "./Env";
import socket from "./socket";
import { XLg } from "react-bootstrap-icons";
import { Source, WordSourceEditor } from "./WordSourceEditor";

export function CodeNamesHome() {
  let initialGames = useLoaderData() as any[];
  const [currGames, setGames] = useState(initialGames);
  const [newGame, setNewGame] = useState(false);
  const [wordSources, setWordSources] = useState([]);
  const [deleteGame, setDeleteGame] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const closeDelete = () => {
    setDeleteGame(null);
  };
  // console.log(games); // games = testGames();
  useEffect(() => {
    socket.on("cngames", (games) => {
      setGames(games);
    });
    return () => {
      socket.off("cngames");
    };
  });

  let games = currGames.filter((p) => p);
  games.unshift(null);
  return (
    <div>
      <MyNavbar></MyNavbar>
      {
        // <BootswatchSelect
        // version={"5.2.3"}
        // className="form-control"
        // cdnLocation="/bootswatch/"
        // />
      }
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
        <Container>
          <Row className="g-1 row-cols-auto">
            {games.map((g: any) => {
              let card = null;
              let style = {
                minWidth: "10rem",
                maxWidth: "18rem",
                // height: "12rem",
              };
              let key = "add";
              const cardProps = {
                style: style,
                className: "h-100 px-1",
              };

              if (g) {
                key = g.id;
                card = (
                  <a
                    href={`/codenames/${g.id}`}
                    className="text-decoration-none"
                  >
                    {" "}
                    <Card {...cardProps}>
                      <Card.Body className="px-1">
                        <div className="h2">
                          <Button
                            variant="link"
                            className="float-end px-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDeleteGame({ id: g.id, name: g.name });
                            }}
                          >
                            <XLg
                              className="float-end"
                              size="2em"
                              color="red"
                            ></XLg>
                          </Button>
                          {g.name}
                          <MiniTable colors={g.colors}></MiniTable>
                        </div>
                      </Card.Body>
                    </Card>
                  </a>
                );
              } else {
                card = (
                  <Card
                    {...cardProps}
                    onClick={() => {
                      axios
                        .get(BASE_URL + "/api/wordsource/default")
                        .then((response) => {
                          console.log(response.data);
                          if (!response.data) {
                            return;
                          }
                          setWordSources(response.data);
                        });
                      setNewGame(true);
                    }}
                  >
                    <Card.Body>
                      <p className="h2"> New Game</p>
                    </Card.Body>
                  </Card>
                );
              }

              return (
                <Col className=" align-items-stretch pb-0 mt-4" key={key}>
                  {card}
                </Col>
              );
            })}
          </Row>
        </Container>{" "}
        <Modal show={deleteGame != null} onHide={closeDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Delete Player {deleteGame?.name}?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeDelete}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (!deleteGame) {
                  console.log("error");
                  return;
                }
                deleteCodenamesGame(deleteGame.id);
                closeDelete();
              }}
              variant="danger"
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>{" "}
        <Modal
          show={newGame}
          onHide={() => {
            setNewGame(false);
          }}
        >
          <Modal.Body>
            <NewGameForm
              submit={(name: string, sources: Source[]) => {
                setNewGame(false);
                axios
                  .post(BASE_URL + "/api/codenames/new", {
                    name: name,
                    source: sources,
                  })
                  .then((response) => {
                    console.log(response.data);
                  });
              }}
              sources={wordSources}
            ></NewGameForm>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

function NewGameForm(
  props: {
    sources: Source[];
    submit: (name: string, sources: Source[]) => void;
  } & React.FormHTMLAttributes<HTMLFormElement>
) {
  const submit = props.submit;
  const nameRef = useRef<any>();
  const wseProps = {
    ...props,
    submit: (sources: Source[]) => {
      const name = nameRef.current?.value;
      submit(name, sources);
    },
  };
  return (
    <WordSourceEditor {...wseProps}>
      <Form.Control ref={nameRef} type="text"></Form.Control>
    </WordSourceEditor>
  );
}

const classes = ["cn-default", "cn-red", "cn-blue", "cn-gray", "cn-black"];

function MiniTable(props: any) {
  const r5 = [0, 1, 2, 3, 4];
  console.log(props.colors);
  return (
    <Table borderless>
      <tbody>
        {r5.map((i) => {
          return (
            <tr key={"r" + i}>
              {r5.map((j) => {
                return (
                  <td
                    key={"c" + j}
                    className={"mini-cell " + classes[props.colors[i * 5 + j]]}
                  ></td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

function deleteCodenamesGame(id: string) {
  axios.post(BASE_URL + "/api/codenames/delete/" + id, {});
}

export default CodeNamesHome;
