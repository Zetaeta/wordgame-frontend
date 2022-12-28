import socket from "./socket";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { MyNavbar } from "./common";
const savedDN = localStorage.getItem("name");
export const defaultUN = getSavedUN();

function getSavedUN() {
  const savedUN = localStorage.getItem("username");
  if (savedUN) {
    return savedUN;
  }
  const random = randomUsername();
  localStorage.setItem("username", random);
  return random;
}

export const defaultDN = savedDN ? savedDN : "Player";
export let username = defaultUN;
export let name = defaultDN;
socket.emit("login", {
  username: username,
  displayName: name,
});

export default function ProfilePage() {
  const [userName, setUserName] = useState(defaultUN);
  const [displayName, setDisplayName] = useState(defaultDN);

  return (
    <div>
      <MyNavbar></MyNavbar>
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
        <Form
          onSubmit={(event) => {
            if (userName != username) {
              username = userName;
              socket.emit("login", {
                username: username,
                displayName: displayName,
              });
              localStorage.setItem("username", username);
            } else if (name != displayName) {
              name = displayName;
              localStorage.setItem("name", displayName);
              socket.emit("change name", userName);
            }
            event.preventDefault();
          }}
          className="text-center"
          style={{ maxWidth: "1000px" }}
        >
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={userName}
              onChange={(event) => {
                setUserName(event.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              name="ip"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
              }}
            />
          </Form.Group>
          <Button type="submit" value="Submit">
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
}

function randomUsername() {
  return "user" + Math.floor(Math.random() * 100000);
}
