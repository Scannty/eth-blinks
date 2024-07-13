import React from 'react';
import './Navbar.css'; // Make sure to create a Navbar.css file
import { Navbar, Nav, Button } from 'react-bootstrap';

const NavbarCustom = () => {
  const logoUrl = 'https://i.ibb.co/5BxBMjQ/aggrgator.png'; // Replace with your logo image URL

  return (
    <Navbar variant="dark" expand="lg"  style={{backgroundColor:'#ffa433', borderBottom: '1px  white'}}>
    
      <Navbar.Toggle aria-controls="basic-navbar-nav" style={{marginRight:'10px'}} />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end" style={{marginRight:'20px'}}>
        <Nav style={{marginRight:'199px'}}>
          <Nav.Link href="/whitepaper">Whitepaper</Nav.Link>
          <Nav.Link href="/roadmap">Roadmap</Nav.Link>
          <Nav.Link href="/team">Team</Nav.Link>
          <Nav.Link href="/overview">Overview</Nav.Link>
        </Nav>
        <button variant="light" className="launch-app-button" style={{color:'black'}}>See Blinker Examples</button>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarCustom;
