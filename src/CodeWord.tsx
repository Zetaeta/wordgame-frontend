import React from "react";
import Color from "color";
import Card from "react-bootstrap/Card";
import { Textfit } from "react-textfit";
type WordProps = {
  word: string;
  name?: string;
  color?: Color;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
};
type WordState = {};

class CodeWord extends React.Component<WordProps, WordState> {
  render() {
    let color = this.props.color;
    if (!color) {
      color = Color.rgb(0xff, 0xe0, 0x82);
    }
    if (this.props.name)
      return (
        <Card
          className="  mb-3 mx-2  text-dark text-center"
          onClick={this.props.onClick}
          style={{ maxWidth: "18rem", backgroundColor: color.string() }}
        >
          <Card.Header>{this.props.name}</Card.Header>
          <Card className="  mx-2 my-2 word-panel shadow-sm">
            {" "}
            <Card.Body>
              <p className="h1 text-dark"> {this.props.word}</p>
            </Card.Body>
          </Card>
        </Card>
      );
    else {
      const maxFontSize = Math.min(30, window.innerHeight / 17);
      // console.log(maxFontSize);
      return (
        <Card
          className=" h-100   text-dark text-center shadow-sm"
          style={{
            maxWidth: "18rem",
            backgroundColor: color.string(),
            // height: "5rem",
          }}
          onContextMenu={this.props.onContextMenu}
          onClick={this.props.onClick}
        >
          <Card.Body className="text-dark">
            <Textfit mode="single" max={maxFontSize}>
              {this.props.word}
            </Textfit>
          </Card.Body>
        </Card>
      );
    }
  }
}

export default CodeWord;
