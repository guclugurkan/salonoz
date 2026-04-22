import "./Footer.css";
import { Phone, MapPin, Mail, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer__topLine" />

      <div className="footer__container">
        <div className="footer__grid">

          {/* Brand */}
          <div className="footer__brand">
            <h3 className="footer__logo">SALON OZ</h3>
            <div className="footer__brandLine" />
            <p className="footer__description">
              Stijl, vakmanschap en persoonlijke aandacht — voor elke klant,
              elke dag. Welkom bij Salon OZ in Drongen.
            </p>
          </div>

          {/* Contact */}
          <div className="footer__contact">
            <h4 className="footer__title">Contact</h4>
            <div className="footer__sectionLine" />

            <div className="footer__contactList">
              <div className="footer__contactItem">
                <MapPin className="footer__icon" />
                <span className="footer__contactText">
                  Vierhekkenstraat 3A<br />
                  Drongen BE-9031
                </span>
              </div>

              <div className="footer__contactItem">
                <Phone className="footer__icon" />
                <a href="tel:+32744414919" className="footer__contactLink">
                  0744.414.919
                </a>
              </div>

              <div className="footer__contactItem">
                <Mail className="footer__icon" />
                <a href="mailto:Salonoz@hotmail.com" className="footer__contactLink">
                  Salonoz@hotmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="footer__social">
            <h4 className="footer__title">Volg ons</h4>
            <div className="footer__sectionLine" />

            <div className="footer__socialList">
              <a
                href="https://www.instagram.com/salon.oz/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__socialLink"
                aria-label="Instagram"
              >
                <Instagram className="footer__socialIcon" />
                <span className="footer__socialLabel">@salon.oz</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2026 SALON OZ. Alle rechten voorbehouden.
          </p>
          <div className="footer__bottomLinks">
            <a href="#" className="footer__bottomLink">Privacybeleid</a>
            <a href="#" className="footer__bottomLink">Algemene voorwaarden</a>
          </div>
        </div>
      </div>
    </footer>
  );
}