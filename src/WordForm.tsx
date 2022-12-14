import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export type WordFormState = {
  word: string;
};
type WordFormProps = { submit: (word: string) => void; hint?: string };

export class WordForm extends React.Component<WordFormProps, WordFormState> {
  state: WordFormState;

  constructor(props: any) {
    super(props);
    this.state = { word: "" };
  }

  handleChange = (event: any) => {
    const target = event.target;
    const value = target.value as string;

    this.setState({ word: value });
  };

  handleSubmit = (event: any) => {
    this.props.submit(this.state.word);
    event.preventDefault();
  };

  render() {
    return (
      <Form onSubmit={this.handleSubmit} className=" text-center">
        <Form.Control
          type="text"
          placeholder={this.props.hint}
          name="word"
          value={this.state.word}
          className="mb-3"
          onChange={this.handleChange}
        />
        <Button type="submit" value="Submit" className="mb-3">
          Submit
        </Button>
      </Form>
    );
  }
}

export default WordForm;
