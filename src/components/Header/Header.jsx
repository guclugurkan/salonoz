import { useState, useEffect } from "react";
import "./Header.css";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Ferme le menu quand on change de page
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Bloque le scroll quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Home",        to: "/" },
    { label: "About",       to: "/about" },
    { label: "Services",    to: "/services" },
    { label: "Pricing",     to: "/pricing" },
    { label: "Gallery",     to: "/gallery" },
    { label: "Contact",     to: "/contact" },
    { label: "Reviews",     to: "/reviews" },
  ];

  return (
    <>
      <header className="header">
        <div className="header__container">

          {/* Logo */}
          <Link to="/" className="header__logo">
            SALON OZ
          </Link>

          {/* Navigation — desktop */}
          <nav className="header__nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`header__link ${location.pathname === link.to ? "header__link--active" : ""}`}
              >
                {link.label}
                <span className="header__underline" />
              </Link>
            ))}
          </nav>

          {/* CTA — desktop */}
          <Link to="/reservation" className="header__button">
            <span className="header__buttonText">Book Online</span>
            <span className="header__buttonFill" />
          </Link>

          {/* Hamburger — mobile */}
          <button
            className={`header__hamburger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="header__hamburger-line" />
            <span className="header__hamburger-line" />
            <span className="header__hamburger-line" />
          </button>

        </div>
      </header>

      {/* Mobile menu overlay */}
      <div className={`header__mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <nav className="header__mobile-nav">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              to={link.to}
              className="header__mobile-link"
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/reservation"
          className="header__mobile-button"
          style={{ transitionDelay: menuOpen ? `${navLinks.length * 60}ms` : "0ms" }}
        >
          Book Online
        </Link>
      </div>
    </>
  );
}