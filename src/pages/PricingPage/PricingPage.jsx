import { useState, useEffect, useRef } from "react";
import "./PricingPage.css";
import useScrollReveal from "../../hooks/useScrollReveal";

function AccordionItem({ item, isOpen, onToggle, index }) {
  const contentRef = useRef(null);

  return (
    <div className={`pp__accordion-item ${isOpen ? "is-open" : ""}`}>
      {/* Header */}
      <button className="pp__accordion-header" onClick={onToggle}>
        <div className="pp__accordion-left">
          <span className="pp__accordion-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="pp__accordion-titles">
            <span className="pp__accordion-sub">{item.subTitle || "Service"}</span>
            <span className="pp__accordion-name">{item.name}</span>
          </div>
        </div>
        <div className="pp__accordion-right">
          <span className="pp__accordion-count">
            {item.services?.length || 0} services
          </span>
          <span className={`pp__accordion-arrow ${isOpen ? "is-open" : ""}`}>
            →
          </span>
        </div>
      </button>

      {/* Panel */}
      <div
        className="pp__accordion-panel"
        ref={contentRef}
        style={{
          maxHeight: isOpen
            ? `${contentRef.current?.scrollHeight}px`
            : "0px",
        }}
      >
        <div className="pp__accordion-inner">
          {/* Image */}
          <div className="pp__accordion-img-wrap">
            <img
              src={item.img || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"}
              alt={item.name}
              className="pp__accordion-img"
              loading="lazy"
            />
          </div>

          {/* Services list */}
          <ul className="pp__accordion-list">
            {item.services?.map((service, i) => (
              <li key={i} className="pp__accordion-service">
                <span className="pp__accordion-service-name">
                  {service.name}
                </span>
                <span className="pp__accordion-dots" />
                <span className="pp__accordion-price">{service.displayPrice || service.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { ref, isVisible } = useScrollReveal(0.05);
  const [openIndex, setOpenIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pp-section">
      <div className="pp__container" ref={ref}>

        {/* Header */}
        <div className={`pp__header ${isVisible ? "is-visible" : ""}`}>
          <div className="pp__kicker">
            <span className="pp__kickerLine" />
            <span className="pp__kickerText">Ervaringen & Tarieven</span>
            <span className="pp__kickerLine" />
          </div>
          <h1 className="pp__title">Diensten</h1>
        </div>

        {/* Pricing info sections */}
        <div className={`pp__info-sections ${isVisible ? "is-visible" : ""}`}>
          <div className="pp__info-section">
            <h2 className="pp__info-title">Tarieven & Prijsinformatie</h2>
            <p>Onze prijzen zijn richtprijzen <strong>vanaf</strong> en kunnen variëren afhankelijk van de gekozen techniek, de haarlengte, haardikte en het benodigde productverbruik.</p>
            <p>Wenst u vooraf een exacte prijsinschatting? Neem gerust contact met ons op via sociale media, telefonisch of kom vrijblijvend langs voor een <strong>gratis consultatie</strong>.</p>
          </div>

          <div className="pp__info-section">
            <h2 className="pp__info-title">Kleuringen & technische behandelingen</h2>
            <p>Behandelingen zoals balayage, ombre, sombre en babylights zijn maatwerk. De uiteindelijke prijs is afhankelijk van:</p>
            <ul className="pp__info-list">
              <li>Haarlengte en haardikte</li>
              <li>Hoeveelheid product die nodig is</li>
              <li>Eventuele extra toners of nabehandelingen</li>
              <li>Gewenste oplichting en eindresultaat</li>
            </ul>
            <p className="pp__info-note">Kleurproducten worden nauwkeurig afgewogen op basis van het effectief gebruikte product. Bij langer of dikker haar kan een supplement aangerekend worden.</p>
          </div>

          <div className="pp__info-section">
            <h2 className="pp__info-title">Inbegrepen in de prijs</h2>
            <p>Volgende zaken zijn <strong>steeds inbegrepen</strong>:</p>
            <ul className="pp__info-list pp__info-list--inline">
              <li>Wassen</li>
              <li>Standaard verzorging</li>
              <li>Stylingproducten</li>
              <li>Basisafwerking / styling</li>
            </ul>
            <p className="pp__info-note">Extra verzorgingen of bijkomende stylingdiensten worden afzonderlijk aangerekend.</p>
          </div>
        </div>

        {/* Accordion */}
        {loading ? (
          <div className="state-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className={`pp__accordion ${isVisible ? "is-visible" : ""}`}>
            {categories.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        )}

        {/* Keratine Extensions */}
        <div className={`pp__extensions ${isVisible ? "is-visible" : ""}`}>
          <div className="pp__extensions-header">
            <span className="pp__accordion-index" style={{ fontSize: '1.2rem' }}>⟡</span>
            <div>
              <span className="pp__accordion-sub">Telefonisch reserveren</span>
              <h2 className="pp__extensions-title">Keratine Extensions</h2>
            </div>
          </div>

          <div className="pp__extensions-list">
            {[
              { name: "Keratine extensions vanaf 50 stuks", price: "200 €" },
              { name: "Keratine extensions vanaf 100 stuks", price: "400 €" },
              { name: "Keratine extensions vanaf 150 stuks", price: "600 €" },
              { name: "Keratine extensions vanaf 200 stuks", price: "500 €" },
              { name: "Keratine extensions vanaf 250 stuks", price: "1000 €" },
              { name: "Extensions verwijderen", price: "100 €" },
            ].map((item, i) => (
              <div key={i} className="pp__extension-row">
                <div className="pp__extension-info">
                  <span className="pp__extension-name">{item.name}</span>
                </div>
                <a href="tel:+320485550271" className="pp__extension-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  0485 55 02 71
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`pp__footer ${isVisible ? "is-visible" : ""}`}>
          <p>
            * Tarieven zijn vanafprijzen. Het eindtarief kan variëren op basis
            van haarlengte en complexiteit. Een persoonlijke offerte wordt
            opgesteld vóór elke behandeling.
          </p>
        </div>

      </div>
    </div>
  );
}