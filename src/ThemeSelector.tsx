import { useState } from "react";
import { Form, NavDropdown } from "react-bootstrap";

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
    </>
  );
}
export default ThemeSelector;
