import "./Experience.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";

const images = [
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
    alt: "Heren",
    name: "Heren",
    sub: "Kapsalon",
  },
  {
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    alt: "Dames",
    name: "Dames",
    sub: "Styling",
  },
  {
    src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
    alt: "Kleuren",
    name: "Kleuren",
    sub: "Techniek",
  },
  {
    src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80",
    alt: "Balayage",
    name: "Balayage",
    sub: "Highlights",
  },
];

export default function Experience() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section ref={ref} id="services" className="experience">
      <div className="experience__container">

        {/* Header */}
        <div className={`experience__header ${isVisible ? "is-visible" : ""}`}>
          <div className="experience__kicker">
            <span className="experience__kickerLine" />
            <span className="experience__kickerText">Diensten</span>
            <span className="experience__kickerLine" />
          </div>
          <h2 className="experience__title">Onze Expertises</h2>
        </div>

        {/* Images wall */}
        <div className="experience__wall">
          {images.map((img, i) => (
            <Link
              to="/services"
              key={i}
              className={`experience__item experience__item--${i + 1} ${isVisible ? "is-visible" : ""}`}
              style={{ transitionDelay: isVisible ? `${i * 120}ms` : "0ms" }}
            >
              {/* Image */}
              <div className="experience__img-wrap">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="experience__img"
                  loading="lazy"
                />
              </div>

              {/* Label — à côté de l'image */}
              <div className="experience__label">
                <span className="experience__label-sub">{img.sub}</span>
                <span className="experience__label-name">{img.name}</span>
                <span className="experience__label-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className={`experience__footer ${isVisible ? "is-visible" : ""}`}>
          <Link to="/services" className="experience__button">
            <span className="experience__buttonText">Alle services bekijken</span>
            <span className="experience__buttonFill" />
          </Link>
        </div>

      </div>
    </section>
  );
}