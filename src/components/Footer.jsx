import React from 'react';
import '../styles/Home/Footer.css';
const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Gemukore. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
