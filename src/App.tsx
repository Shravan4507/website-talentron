import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import StaggeredMenu from './components/menu/StaggeredMenu';
import Grainient from './components/background/Grainient';
import ScrollToTop from './components/navigation/ScrollToTop';
import { ToastProvider } from './components/toast/Toast';
import './components/background/Grainient.css';

// Pages
import Home from './pages/home/Home';
import LoginPage from './pages/login/login';
import About from './pages/about/About';
import Competitions from './pages/competitions/Competitions';
import GenrePage from './pages/competitions/GenrePage';
import Schedule from './pages/schedule/Schedule';
import Contact from './pages/contact/Contact';
import Gallery from './pages/gallery/Gallery';
import Team from './pages/team/Team';
import Privacy from './pages/privacy/Privacy';
import Terms from './pages/terms/Terms';
import Cookies from './pages/cookies/Cookies';
import Sponsors from './pages/sponsors/Sponsors';
import UserSignup from './user/user-signup';
import AdminSignup from './admin/admin-signup';
import UserDashboard from './user/user-dashboard';
import AdminDashboard from './admin/admin-dashboard';
import NotFound from './pages/not-found/NotFound';

const menuItems = [
  { label: 'Home', ariaLabel: 'Home', link: '/' },
  { label: 'About', ariaLabel: 'About', link: '/about' },
  { label: 'Competitions', ariaLabel: 'Competitions', link: '/competitions' },
  { label: 'Schedule', ariaLabel: 'Schedule', link: '/schedule' },
  { label: 'Contact', ariaLabel: 'Contact', link: '/contact' },
  { label: 'Gallery', ariaLabel: 'Gallery', link: '/gallery' },
  { label: 'Login', ariaLabel: 'Login', link: '/login' }
];

const socialItems = [
  { label: 'Instagram', link: 'https://instagram.com' },
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

function AppContent() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <StaggeredMenu 
        items={menuItems}
        socialItems={socialItems}
        accentColor="#ff0059"
        menuButtonColor="#ffffff"
      />

      {/* Global Persistent Background */}
      <div className="grainient-background-wrapper">
        <Grainient
          color1="#ff0059"
          color2="#3600cc"
          color3="#ffc800"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.15}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
        <div className="grainient-blur-overlay" />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:genre" element={<GenrePage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/team" element={<Team />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <AppContent />
      </ToastProvider>
    </Router>
  )
}

export default App;
