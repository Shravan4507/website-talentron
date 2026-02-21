import { useNavigate, Link } from 'react-router-dom';
import { assetPath } from '../../utils/assetPath';
import './Navbar.css';

const menuItems = [
  { label: 'Home', link: '/' },
  { label: 'About', link: '/about' },
  { label: 'Competitions', link: '/competitions' },
  { label: 'Schedule', link: '/schedule' },
  { label: 'Gallery', link: '/gallery' },
  { label: 'Sponsors', link: '/sponsors' }
];

const Navbar = () => {
  const navigate = useNavigate();
  const half = Math.floor(menuItems.length / 2);
  const leftLinks = menuItems.slice(0, half);
  const rightLinks = menuItems.slice(half);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={assetPath('/assets/logos/ZCOER-Logo-White.png')} alt="ZCOER Logo" className="navbar-logo" />
        <div className="desktop-links links-left">
          {leftLinks.map((item) => (
            <Link key={item.label} to={item.link} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="navbar-center">
        <img src={assetPath('/assets/logos/talentron-logo.jpg')} alt="Talentron Logo" className="navbar-brand-logo" />
      </div>

      <div className="navbar-right">
        <div className="desktop-links links-right">
          {rightLinks.map((item) => (
            <Link key={item.label} to={item.link} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
        <button className="navbar-login-btn" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
