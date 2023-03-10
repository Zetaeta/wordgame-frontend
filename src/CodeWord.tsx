import React from "react";
import Color from "color";
import Card from "react-bootstrap/Card";
import { Textfit } from "react-textfit";

import "./codenames.scss";
type WordProps = {
  word: string;
  // name?: string;
  color?: Color;
  cover?: boolean;
  invert?: boolean;
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

    const maxFontSize = Math.min(30, window.innerHeight / 17);
    // console.log(maxFontSize);
    return (
      <Card
        className={
          " h-100    text-center  shadow-sm " +
          (this.props.cover
            ? " text-codeword-hidden"
            : this.props.invert
            ? "text-codeword-inverted"
            : "text-codeword")
        }
        style={{
          // maxWidth: "16rem",
          backgroundColor: color.string(),
          // height: "5rem",
        }}
        onContextMenu={this.props.onContextMenu}
        onClick={this.props.onClick}
      >
        <Card.Body
          className={
            "px-2 py-2 d-flex flex-column justify-content-center " +
            (this.props.cover
              ? " text-codeword-hidden"
              : this.props.invert
              ? "text-codeword-inverted"
              : "text-codeword")
          }
        >
          <Textfit mode="single" max={maxFontSize}>
            {this.props.word}
          </Textfit>
        </Card.Body>
      </Card>
    );
  }
}

export default CodeWord;
