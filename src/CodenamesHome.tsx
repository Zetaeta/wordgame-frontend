import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardGroup, Col, Container, Modal } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { MyNavbar } from "./common";
import { BASE_URL } from "./Env";
import WordForm from "./WordForm";
import socket from "./socket";

export function CodeNamesHome() {
  let initialGames = useLoaderData() as any[];
  const [currGames, setGames] = useState(initialGames);
  const [newGame, setNewGame] = useState(false);
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
  games.push(null);
  return (
    <div>
      <MyNavbar></MyNavbar>
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
                  .post(BASE_URL + "/api/codenames/new", {
                    name: name,
                  })
                  .then((response) => {
                    console.log(response.data);
                  });
              }}
            ></WordForm>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
export default CodeNamesHome;
