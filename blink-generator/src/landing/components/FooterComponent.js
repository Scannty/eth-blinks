// FooterComponent.jsx
import React from 'react';
import './footer.css'; // Ensure you have the CSS file in the correct path

const FooterComponent = () => {
    return (
        <footer className="footer-container">
            <div className="footer-logo">
                <img  style={{borderRadius:40, marginRight:20,marginLeft:10, width:50,height:50}} src="https://i.ibb.co/5BxBMjQ/aggrgator.png" alt="Logo" />
            </div>
            <div className="footer-links">
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="/mirror" >Mirror</a> {/* Assuming this is an internal link */}
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">Whitepaper</a>
                <a href="/roadmap">Roadmap</a>
                <a href="/overview">Overview</a>
            </div>
        </footer>
    );
};

export default FooterComponent;
