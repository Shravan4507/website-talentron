import { Link } from 'react-router-dom';
import { assetPath } from '../../utils/assetPath';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column">
            <img src={assetPath('/assets/logos/talentron-logo.jpg')} alt="Talentron Logo" className="footer-brand-logo" />
            <p>Empowering the next generation of digital talent through innovation and technology.</p>
          </div>
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/competitions">Competitions</Link></li>
              <li><Link to="/schedule">Schedule</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Organization</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/team">Our Team</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="https://zcoer.in" target="_blank" rel="noopener noreferrer">ZCOER</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Location</h4>
            <p>
              <a 
                href="https://maps.app.goo.gl/RXpzvbPwm4s2CqDW6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="location-link"
              >
                Zeal College of Engineering and Research, Narhe, Pune, Maharashtra 411041
              </a>
            </p>
          </div>
        </div>

        <div className="footer-initiative">
          <div className="initiative-logo">
            <img src={assetPath('/assets/logos/ZCOER-Logo-White.png')} alt="ZCOER Logo" />
          </div>
          <div className="initiative-text">
            OFFICIAL STUDENT INITIATIVE OF ZCOER PUNE
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 Talentron. All rights reserved.
            <span className="dev-signature">
              Handcrafted by <a href="https://www.instagram.com/069.f5/" target="_blank" rel="noopener noreferrer">Shrvan</a>
            </span>
          </div>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
