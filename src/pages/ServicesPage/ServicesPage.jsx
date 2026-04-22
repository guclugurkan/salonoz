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
      img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
      size: "large",
      tag: "Vanaf 20 €",
    },
    {
      title: "Dames Styling",
      desc: "Coupes op maat, brushings en losdrogen voor elke haartype en lengte.",
      icon: "✄",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      size: "small",
      tag: "Vanaf 35 €",
    },
    {
      title: "Kleuren",
      desc: "Egale kleurbehandelingen en uitgroei bijwerken — stralend resultaat gegarandeerd.",
      icon: "◈",
      img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
      size: "small",
      tag: "Vanaf 100 €",
    },
    {
      title: "Balayage & Highlights",
      desc: "Handgeschilderde balayage en foilyage technieken voor een diepte en gloedvol resultaat.",
      icon: "❋",
      img: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80",
      size: "large",
      tag: "Vanaf 60 €",
    },
    {
      title: "Kids",
      desc: "Zachte en kindvriendelijke knipbeurten voor meisjes en jongens van 0 tot 12 jaar.",
      icon: "◇",
      img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
      size: "small",
      tag: "Vanaf 20 €",
    },
    {
      title: "Keratine",
      desc: "Brazilian keratine behandelingen voor ultiem verzorgd en glad haar.",
      icon: "⟡",
      img: "https://images.unsplash.com/photo-1560869713-da86a9ec0744?w=800&q=80",
      size: "small",
      tag: "Vanaf 200 €",
    },
    {
      title: "Opsteken & Bruidskapsel",
      desc: "Elegante opsteekstijlen, vlechten en bruidskapsel inclusief proef voor de grote dag.",
      icon: "✿",
      img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
      size: "large",
      tag: "Vanaf 35 €",
    },
    {
      title: "Verzorging",
      desc: "Haarmasker en verzorgingen als de perfecte aanvulling voor gezond haar.",
      icon: "◉",
      img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
      size: "small",
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