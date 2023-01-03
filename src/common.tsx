import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import "./Profile";
import { NavDropdown } from "react-bootstrap";
import ThemeSelector from "./ThemeSelector";

export function globalNavbar() {
  return (
    <Nav className="me-auto">
      <Nav.Link href="/">Home</Nav.Link>
      <Nav.Link href="/codenames">Codenames</Nav.Link>
      <Nav.Link href="/decrypto">Decrypto</Nav.Link>
      <Nav.Link href="/profile">Profile</Nav.Link>
    </Nav>
  );
}

export function MyNavbar(props: any) {
  return (
    <Navbar bg="primary" expand="lg">
      <Container>
        <Navbar.Brand>BigWord</Navbar.Brand>
        {globalNavbar()}
        {props.children}
        <Nav className="me-auto">
          <ThemeSelector></ThemeSelector>
        </Nav>
      </Container>
    </Navbar>
  );
}
