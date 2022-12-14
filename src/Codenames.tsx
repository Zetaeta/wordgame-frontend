import { useLoaderData } from "react-router-dom";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import WordForm from "./WordForm";
import { serverUrl } from "./Env";
import axios from "axios";
import React from "react";
import { useParams } from "react-router-dom";

// export class CodeNames extends React.Component {}
export function CodeNames(props: any) {
  const params = useParams();
  const id = params.id;
  return <div></div>;
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
