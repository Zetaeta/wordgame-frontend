import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { MyNavbar } from "./common";
import socket, {
  defaultDN,
  defaultUN,
  displayname,
  setDisplayname,
  setUsername,
  username,
} from "./socket";

export default function ProfilePage() {
  const [userName, setUserName] = useState(defaultUN);
  const [displayName, setDisplayName] = useState(defaultDN);

  return (
    <div>
      <MyNavbar></MyNavbar>
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
        <Form
          onSubmit={(event) => {
            if (userName !== username) {
              setUsername(userName);
              socket.emit("login", {
                username: username,
                displayName: displayName,
              });
              localStorage.setItem("username", username);
            } else if (displayname !== displayName) {
              setDisplayname(displayName);
              localStorage.setItem("name", displayName);
              socket.emit("change name", { displayName: displayName });
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
