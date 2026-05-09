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