import { useState, useEffect, useRef } from "react";
import "./PricingPage.css";
import useScrollReveal from "../../hooks/useScrollReveal";

const pricingData = [
  {
    category: "Heren",
    sub: "Kapsalon",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
    services: [
      { name: "Heren halflang/lang haar", price: "45 €" },
      { name: "Herensnit", price: "35 €" },
      { name: "Tondeuse", price: "20 €" },
      { name: "Tondeuse met fade", price: "30 €" },
      { name: "Herensnit met hoofdmassage", price: "55 €" },
      { name: "Haar baard", price: "50 €" },
      { name: "Baard trimmen/aflijnen", price: "25 €" },
    ],
  },
  {
    category: "Dames Styling",
    sub: "Styling",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    services: [
      { name: "Snit & Losdrogen", price: "K: 45 € | H: 50 € | L: 55 €" },
      { name: "Dames Brushing", price: "K: 35 € | H: 40 € | L: 45 €" },
      { name: "Extensions", price: "55 €" },
      { name: "Snit & Brushing", price: "K: 65 € | H: 70 € | L: 80 €" },
    ],
  },
  {
    category: "Kleuren",
    sub: "Techniek",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
    services: [
      { name: "Kleuren uitgroei (max 3cm) met Brushing", price: "K: 100 € | H: 115 € | L: 120 €" },
      { name: "Kleuren uitgroei + snit & brushing", price: "K: 135 € | H: 142 € | L: 148 €" },
      { name: "Kleuren Uitgroei & Lengtes met Snit & Brushing", price: "K: 143 € | H: 158 € | L: 173 €" },
      { name: "Kleuren uitgroei (max 3cm) met Snit & Losdrogen", price: "K: 115 € | H: 125 € | L: 130 €" },
      { name: "Kleuren Uitgroei & Lengtes met Brushing", price: "K: 118 € | H: 133 € | L: 148 €" },
      { name: "Kleuren Uitgroei & Lengtes met Snit & Losdrogen", price: "K: 128 € | H: 143 € | L: 158 €" },
    ],
  },
  {
    category: "Balayage & Highlights",
    sub: "Techniek",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80",
    services: [
      { name: "Balayage & Foilyage met Brushing", price: "K: 170 € | H: 180 € | L: 190 €" },
      { name: "Balayage & Foilyage met Snit & Brushing", price: "K: 195 € | H: 215 € | L: 230 €" },
      { name: "Opfrissingstoner + Brushing", price: "K: 60 € | H: 75 € | L: 90 €" },
      { name: "Opfrissingstoner met Snit & Brushing", price: "K: 100 € | H: 105 € | L: 115 €" },
    ],
  },
  {
    category: "Kids",
    sub: "Kinderen",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    services: [
      { name: "Snit meisje tot 6 jaar", price: "20 €" },
      { name: "Snit meisje tot 12 jaar", price: "30 €" },
      { name: "Snit meisje tot 12 jaar (Met wassen)", price: "40 €" },
      { name: "Snit meisje tot 12 jaar (Veel & lang haar)", price: "50 €" },
      { name: "Snit jongen tot 6 jaar", price: "20 €" },
      { name: "Snit jongen tot 12 jaar (Zonder wassen)", price: "25 €" },
      { name: "Snit jongen tot 12 jaar (Met wassen)", price: "30 €" },
    ],
  },
  {
    category: "Keratine Behandeling",
    sub: "Behandeling",
    image: "https://images.unsplash.com/photo-1634302086682-5c2bc7db8dc6?w=800&q=80",
    services: [
      { name: "Brazilian keratine behandeling & brushing", price: "K: 200 € | H: 210 € | L: 220 €" },
      { name: "Brazilian keratine behandeling Snit & brushing", price: "K: 230 € | H: 240 € | L: 260 €" },
    ],
  },
  {
    category: "Opsteken",
    sub: "Styling",
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    services: [
      { name: "Bruidskapsel (+ proef)", price: "165 €" },
      { name: "Opsteken meisjes", price: "35 €" },
      { name: "Opsteken dames (Normaal haar)", price: "55 €" },
      { name: "Opsteken dames (Veel/lang haar)", price: "65 €" },
    ],
  },
  {
    category: "Verzorging",
    sub: "Extra",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    services: [
      { name: "Verzorging", price: "5 €" },
      { name: "Haarmasker", price: "10 €" },
    ],
  },
];

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
            <span className="pp__accordion-sub">{item.sub}</span>
            <span className="pp__accordion-name">{item.category}</span>
          </div>
        </div>
        <div className="pp__accordion-right">
          <span className="pp__accordion-count">
            {item.services.length} services
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
              src={item.image}
              alt={item.category}
              className="pp__accordion-img"
              loading="lazy"
            />
          </div>

          {/* Services list */}
          <ul className="pp__accordion-list">
            {item.services.map((service, i) => (
              <li key={i} className="pp__accordion-service">
                <span className="pp__accordion-service-name">
                  {service.name}
                </span>
                <span className="pp__accordion-dots" />
                <span className="pp__accordion-price">{service.price}</span>
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

  useEffect(() => {
    window.scrollTo(0, 0);
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
          <h1 className="pp__title">De Kaart van Salon OZ</h1>
          <p className="pp__subtitle">
            Uitzonderlijke prestaties om jouw identiteit te sublimeren.
          </p>
        </div>

        {/* Accordion */}
        <div className={`pp__accordion ${isVisible ? "is-visible" : ""}`}>
          {pricingData.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
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