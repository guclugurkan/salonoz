import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./ServicesPage.css";
import useScrollReveal from "../../hooks/useScrollReveal";

export default function ServicesPage() {
  const { ref, isVisible } = useScrollReveal(0.1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      title: "Heren",
      desc: "Precisie-coupes en baardverzorging voor de moderne man. Van klassieke herenkapsels tot complete haar & baard combos.",
      icon: "✦",
      img: "/images/services/heren.jpeg",
      size: "large",
      tag: "Vanaf 20 €",
    },
    {
      title: "Dames Styling",
      desc: "Coupes op maat, brushings en losdrogen voor elke haartype en lengte.",
      icon: "✄",
      img: "/images/services/dames.jpeg",
      size: "large",
      tag: "Vanaf 35 €",
    },
    {
      title: "Kleuren",
      desc: "Egale kleurbehandelingen en uitgroei bijwerken — stralend resultaat gegarandeerd.",
      icon: "◈",
      img: "/images/services/kleuren.jpeg",
      size: "large",
      tag: "Vanaf 100 €",
    },
    {
      title: "Balayage & Highlights",
      desc: "Handgeschilderde balayage en foilyage technieken voor een diepte en gloedvol resultaat.",
      icon: "❋",
      img: "/images/services/balayage-higlights.jpeg",
      size: "large",
      tag: "Vanaf 60 €",
    },
    {
      title: "Kids",
      desc: "Zachte en kindvriendelijke knipbeurten voor meisjes en jongens van 0 tot 12 jaar.",
      icon: "◇",
      img: "/images/services/kids.jpeg",
      size: "large",
      tag: "Vanaf 20 €",
    },
    {
      title: "Keratine",
      desc: "Brazilian keratine behandelingen voor ultiem verzorgd en glad haar.",
      icon: "⟡",
      img: "/images/services/keratine.jpeg",
      size: "large",
      tag: "Vanaf 200 €",
    },
    {
      title: "Opsteken & Bruidskapsel",
      desc: "Elegante opsteekstijlen, vlechten en bruidskapsel inclusief proef voor de grote dag.",
      icon: "✿",
      img: "/images/services/opsteken.jpeg",
      size: "large",
      tag: "Vanaf 35 €",
    },
    {
      title: "Verzorging",
      desc: "Haarmasker en verzorgingen als de perfecte aanvulling voor gezond haar.",
      icon: "◉",
      img: "/images/services/verzorging.jpeg",
      size: "large",
      tag: "Vanaf 5 €",
    },
  ];

  return (
    <div className="sp-section">
      <div className="sp__container" ref={ref}>

        {/* HEADER */}
        <div className={`sp__header ${isVisible ? "is-visible" : ""}`}>
          <div className="sp__kicker">
            <span className="sp__kickerLine" />
            <span className="sp__kickerText">Salon OZ — Drongen</span>
            <span className="sp__kickerLine" />
          </div>
          <h1 className="sp__title">Onze Expertises</h1>
          <p className="sp__subtitle">Ontdek het volledige aanbod van Salon OZ — gecreëerd voor elke stijl, elk haar.</p>
        </div>

        {/* KERATINE EXTENSIONS */}
        <div className={`sp__extensions ${isVisible ? "is-visible" : ""}`}>
          <div className="sp__extensions-header">
            <span className="sp__card-icon">⟡</span>
            <h2 className="sp__extensions-title">Keratine Extensions</h2>
            <p className="sp__extensions-subtitle">
              Afspraken voor keratine extensions verlopen uitsluitend telefonisch.
            </p>
          </div>

          <div className="sp__extensions-list">
            {[
              { name: "Keratine extensions vanaf 50 stuks", price: "200 €" },
              { name: "Keratine extensions vanaf 100 stuks", price: "400 €" },
              { name: "Keratine extensions vanaf 150 stuks", price: "600 €" },
              { name: "Keratine extensions vanaf 200 stuks", price: "500 €" },
              { name: "Keratine extensions vanaf 250 stuks", price: "1000 €" },
              { name: "Extensions verwijderen", price: "100 €" },
            ].map((item, i) => (
              <div key={i} className="sp__extension-row">
                <div className="sp__extension-info">
                  <span className="sp__extension-name">{item.name}</span>
                  <span className="sp__extension-price">{item.price}</span>
                </div>
                <a href="tel:+320485550271" className="sp__extension-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  0485 55 02 71
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* MASONRY GRID */}
        <div className="sp__masonry">
          {services.map((service, index) => (
            <div
              key={index}
              className={`sp__card sp__card--${service.size} ${isVisible ? "is-visible" : ""}`}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : "0ms" }}
            >
              <div className="sp__card-image">
                <img src={service.img} alt={service.title} loading="lazy" />
                <div className="sp__card-overlay" />
                <span className="sp__card-tag">{service.tag}</span>
              </div>

              <div className="sp__card-content">
                <span className="sp__card-icon">{service.icon}</span>
                <h3 className="sp__card-title">{service.title}</h3>
                <p className="sp__card-desc">{service.desc}</p>
                <Link to="/pricing" className="sp__card-link">
                  <span className="sp__card-link-text">Bekijk tarieven</span>
                  <span className="sp__card-link-arrow">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}