import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { MyNavbar } from "./common";

export type LoginState = {
  name: string;
  ip: string;
  port: number;
};
type LoginProps = { login: (form: LoginState) => void };

export class LoginForm extends React.Component<LoginProps, LoginState> {
  state: LoginState;

  constructor(props: any) {
    super(props);
    let defaultName = localStorage.getItem("userName");
    if (!defaultName) {
      defaultName = "JohnSmith";
    }
    this.state = { name: defaultName, ip: "wordgame.space", port: 3001 };
  }

  handleChange = (event: any) => {
    const target = event.target;
    const value = target.value as string | number;
    const name = target.name as "name" | "ip" | "port";

    this.setState({ [name]: value } as any);
  };

  handleSubmit = (event: any) => {
    localStorage.setItem("userName", this.state.name);
    this.props.login(this.state);
    event.preventDefault();
  };

  render() {
    return (
      <div>
        <MyNavbar></MyNavbar>
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center ">
          <Form
            onSubmit={this.handleSubmit}
            className="text-center"
            style={{ maxWidth: "1000px" }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="ip"
                value={this.state.ip}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Port</Form.Label>
              <Form.Control
                type="number"
                name="port"
                value={this.state.port}
                onChange={this.handleChange}
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
}

export default LoginForm;
