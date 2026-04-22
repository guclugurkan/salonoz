import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Components
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Experience from "./components/Experience/Experience";
import Gallery from "./components/Gallery/Gallery";
import Pricing from "./components/Pricing/Pricing";
import Footer from "./components/Footer/Footer";
import PageTransition from "./components/PageTransition/PageTransition";
import Reservation from "./components/Reservation/Reservation";
import Reviews from "./components/Reviews/Reviews";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
// Pages
import AboutPage from "./pages/AboutPage/AboutPage";
import GalleryPage from "./pages/GalleryPage/GalleryPage";
import PricingPage from "./pages/PricingPage/PricingPage";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import ReviewsPage from "./pages/ReviewsPage/ReviewsPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import CancelPage from "./pages/CancelPage/CancelPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import { AuthProvider } from "./context/AuthContext";


export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <ScrollToTop />
      
      {/* Le main entoure AnimatePresence pour garder la structure, 
          mais AnimatePresence doit être le parent direct de Routes */}
      <main className="app__main">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* Home page */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <About />
                  <Experience />
                  <Gallery />
                  <Pricing />
                  <Reviews />
                </>
              }
            />

            {/* Autres pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard/>
                </ProtectedRoute>
              } 
            />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cancel" element={<CancelPage />} />

          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      </div>
    </AuthProvider>
  );
}