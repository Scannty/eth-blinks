import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import styled from 'styled-components';
import './Navbar.css';

const NavbarCustom = () => {
  const logoUrl = 'https://i.ibb.co/5BxBMjQ/aggrgator.png';

  return (
    <StyledNavbar expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          <StyledNavLink href="/whitepaper">Whitepaper</StyledNavLink>
          <StyledNavLink href="/roadmap">Roadmap</StyledNavLink>
          <StyledNavLink href="/team">Team</StyledNavLink>
          <StyledNavLink href="/overview">Overview</StyledNavLink>
        </Nav>
        <button className='launch-app-button' style={{marginLeft:'20px'}}>See Blinker Examples</button>
      </Navbar.Collapse>
    </StyledNavbar>
  );
};

const StyledNavbar = styled(Navbar)`
  background: linear-gradient(135deg, rgba(230, 230, 250, 0.2), rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  padding: 1rem 2rem;
`;

const StyledNavLink = styled(Nav.Link)`
  font-size: 1rem;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0%;
    background: rgba(255, 255, 255, 0.2);
    z-index: -1;
    transition: height 0.3s ease;
  }

  &:hover,
  &:focus {
    color: black;
    text-decoration: none;

    &::before {
      height: 100%;
    }
  }
`;

const StyledGlassButton = styled.button`
  font-size: 1.2em;
  color: #000000bc;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before, &::after {
    content: '';
    display: block;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    position: absolute;
    border-radius: 50%;
    z-index: -1;
    background-color: #000000bc;
    transition: 1s ease;
  }

  &::before {
    top: -1em;
    left: -1em;
  }

  &::after {
    left: calc(100% + 1em);
    top: calc(100% + 1em);
  }

  &:hover::before, &:hover::after {
    height: 410px;
    width: 410px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: bold;
  }

  &:active {
    filter: brightness(0.8);
  }
`;

export default NavbarCustom;

