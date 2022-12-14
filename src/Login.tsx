import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

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
    this.state = { name: "JohnSmith", ip: "wordgame.space", port: 3001 };
  }

  handleChange = (event: any) => {
    const target = event.target;
    const value = target.value as string | number;
    const name = target.name as "name" | "ip" | "port";

    this.setState({ [name]: value } as any);
  };

  handleSubmit = (event: any) => {
    this.props.login(this.state);
    event.preventDefault();
  };

  render() {
    return (
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
    );
  }
}

export default LoginForm;
