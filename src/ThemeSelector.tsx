import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

export function ThemeSelector() {
  let defaultTheme = localStorage.getItem("theme");
  if (!defaultTheme) {
    defaultTheme = "default";
  }
  const [themeName, setThemeName] = useState(defaultTheme);
  const themes = [
    "Default",
    "Cerulean",
    "Cosmo",
    "Cyborg",
    "Darkly",
    "Flatly",
    "Journal",
    "Litera",
    "Lumen",
    "Lux",
    "Materia",
    "Minty",
    "Morph",
    "Pulse",
    "Quartz",
    "Sandstone",
    "Simplex",
    "Sketchy",
    "Slate",
    "Solar",
    "Spacelab",
    "Superhero",
    "United",
    "Vapor",
    "Yeti",
    "Zephyr",
  ];
  return (
    <>
      <link
        rel="stylesheet"
        type="text/css"
        href={
          "/bootswatch/5.2.3/" + themeName.toLowerCase() + "/bootstrap.min.css"
        }
      ></link>
      <Form>
        <Form.Group as={Row}>
          <Form.Label column className="col-4 ">
            Theme:
          </Form.Label>
          <Col>
            <Form.Select
              onChange={(e) => {
                setThemeName(e.target.value);
                localStorage.setItem("theme", e.target.value);
              }}
            >
              {themes.map((theme) => {
                return (
                  <option value={theme.toLowerCase()} key={theme}>
                    {theme}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
        </Form.Group>
      </Form>
    </>
  );
}
export default ThemeSelector;
