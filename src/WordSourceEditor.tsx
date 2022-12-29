import { useRef } from "react";
import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
export interface Source {
  weight: number;
  file: string;
}
export interface WordSourceEditorProps {
  sources: Source[];
  submit: (sources: Source[]) => void;
}
export function WordSourceEditor({
  sources,
  children,
  submit,
}: WordSourceEditorProps & React.FormHTMLAttributes<HTMLFormElement>) {
  const filesRef = useRef(Array(sources.length));
  function onSubmit(event: any) {
    event.preventDefault();
    const finalized = filesRef.current.map((field, i) => {
      const value = field.value;
      return { weight: value, file: sources[i].file };
    });
    console.log(finalized);
    if (!validate(finalized)) {
      alert("improper form");
      return;
    }
    submit(finalized);
  }
  return (
    <Form onSubmit={onSubmit} className="text-center">
      {sources.map((source, i) => {
        return (
          <Form.Group key={source.file} as={Row} className="mb-3">
            <Form.Label column>{source.file}</Form.Label>
            <Col>
              <Form.Control
                type="number"
                defaultValue={source.weight}
                name={source.file}
                ref={(el: any) => (filesRef.current[i] = el)}
              ></Form.Control>
            </Col>
          </Form.Group>
        );
      })}
      {children}
      <Button type="submit" value="Submit">
        Submit
      </Button>
    </Form>
  );
}

function validate(sources: Source[]) {
  let total = 0;
  for (let { weight } of sources) {
    if (weight < 0) {
      return false;
    }
    total += weight;
  }
  return total > 0;
}
