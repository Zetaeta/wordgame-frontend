import { useRef } from "react";
import { Button, Form } from "react-bootstrap";

export function WordSourceEditor({
  sources,
}: {
  sources: { weight: number; file: string }[];
}) {
  const filesRef = useRef(Array(sources.length));
  function submit(event: any) {
    filesRef.current.map((field, i) => {
      const value = field.value;
    });
  }
  return (
    <Form onSubmit={submit} className="text-center">
      {sources.map((source, i) => {
        return (
          <Form.Group>
            <Form.Label>{source.file}</Form.Label>
            <Form.Control
              type="number"
              defaultValue={source.weight}
              name={source.file}
              ref={(el: any) => (filesRef.current[i] = el)}
            ></Form.Control>
          </Form.Group>
        );
      })}
      <Button type="submit" value="Submit">
        Submit
      </Button>
    </Form>
  );
}
