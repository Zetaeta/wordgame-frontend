import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import "./Profile";
import ThemeSelector from "./ThemeSelector";

export function globalNavbar() {
  return (
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="/codenames">Codenames</Nav.Link>
        <Nav.Link href="/decrypto">Decrypto</Nav.Link>
        <Nav.Link href="/profile">Profile</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  );
}

export function MyNavbar(props: any) {
  return (
    <Navbar bg="primary" expand="sm">
      <Container fluid>
        <Navbar.Brand href="/">BigWord</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        {globalNavbar()}
        {props.children}
        <ThemeSelector></ThemeSelector>
      </Container>
    </Navbar>
  );
}
