import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import StaggeredMenu from './components/menu/StaggeredMenu';
import Grainient from './components/background/Grainient';
import ScrollToTop from './components/navigation/ScrollToTop';
import { ToastProvider } from './components/toast/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import './components/background/Grainient.css';

// Pages
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
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
import TestModel from './pages/test/TestModel';
import RegisterEvent from './pages/competitions/RegisterEvent';
import UserSignup from './user/user-signup';
import AdminSignup from './admin/admin-signup';
import UserDashboard from './user/user-dashboard';
import AdminDashboard from './admin/admin-dashboard';
import ManageRegistrations from './admin/ManageRegistrations';
import CertificateVerification from './pages/CertificateVerification';
import NotFound from './pages/not-found/NotFound';

const socialItems = [
  { label: 'Instagram', link: 'https://instagram.com' },
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

function AppContent() {
  const { currentUser, isAdmin } = useAuth();

  const menuItems = [
    { label: 'Home', ariaLabel: 'Home', link: '/' },
    { label: 'About', ariaLabel: 'About', link: '/about' },
    { label: 'Competitions', ariaLabel: 'Competitions', link: '/competitions' },
    { label: 'Schedule', ariaLabel: 'Schedule', link: '/schedule' },
    { label: 'Contact', ariaLabel: 'Contact', link: '/contact' },
    { label: 'Gallery', ariaLabel: 'Gallery', link: '/gallery' },
    { 
      label: currentUser ? 'Dashboard' : 'Login', 
      ariaLabel: currentUser ? 'Dashboard' : 'Login', 
      link: currentUser ? (isAdmin ? '/admin-dashboard' : '/user-dashboard') : '/login' 
    }
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <StaggeredMenu 
        items={menuItems}
        socialItems={socialItems}
        accentColor="#ff0059"
        menuButtonColor="#ffffff"
      />

      <div className="grainient-background-wrapper">
        <Grainient
          color1="#ff0059" color2="#3600cc" color3="#ffc800"
          timeSpeed={0.25} warpStrength={1} warpFrequency={5}
          warpSpeed={2} warpAmplitude={50} grainAmount={0.15}
          contrast={1.5} zoom={0.9}
        />
        <div className="grainient-blur-overlay" />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:genre" element={<GenrePage />} />
        
        {/* Protected Registration/Dashboard Routes */}
        <Route path="/competitions/:genre/register" element={
          <ProtectedRoute><RegisterEvent /></ProtectedRoute>
        } />
        
        <Route path="/user-signup" element={
          <PublicRoute onlyForUnregistered={true}><UserSignup /></PublicRoute>
        } />
        <Route path="/admin-signup" element={
          <PublicRoute onlyForUnregistered={true}><AdminSignup /></PublicRoute>
        } />
        
        <Route path="/user-dashboard" element={
          <ProtectedRoute><UserDashboard /></ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>
        } />
        
        <Route path="/manage-registration" element={
          <ProtectedRoute requireAdmin={true}><ManageRegistrations /></ProtectedRoute>
        } />

        {/* Static Pages */}
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/team" element={<Team />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/test-model" element={<TestModel />} />
        
        {/* Public Verification */}
        <Route path="/verify/:certId" element={<CertificateVerification />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App;
