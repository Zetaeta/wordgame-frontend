import React from "react";
import Color from "color";
import Card from "react-bootstrap/Card";
type WordProps = {
  word: string;
  name?: string;
  color?: Color;
  onClick?: () => void;
};
type WordState = {};

class Word extends React.Component<WordProps, WordState> {
  render() {
    let color = this.props.color;
    if (!color) {
      color = Color.rgb(0x18, 255, 255);
    }
    if (this.props.name)
      return (
        <Card
          className="  mb-3 mx-2  text-dark text-center"
          onClick={this.props.onClick}
          style={{
            //width: "18rem",
            backgroundColor: color.string(),
          }}
        >
          <Card.Header>{this.props.name}</Card.Header>
          <Card className="  mx-2 my-2 word-panel shadow-sm">
            {" "}
            <Card.Body className="h3 text-dark">{this.props.word}</Card.Body>
          </Card>
        </Card>
      );
    else {
      return (
        <Card
          className=" mb-3 mx-2  text-dark text-center shadow-sm"
          style={{ maxWidth: "18rem", backgroundColor: color.string() }}
          onClick={this.props.onClick}
        >
          <Card.Body className="text-dark h1">{this.props.word}</Card.Body>
        </Card>
      );
    }
  }
}

export default Word;
