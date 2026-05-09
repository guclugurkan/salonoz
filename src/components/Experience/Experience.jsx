import "./Experience.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";

const images = [
  {
    src: "/images/services/heren.jpeg",
    alt: "Heren",
    name: "Heren",
    sub: "Kapsalon",
  },
  {
    src: "/images/services/dames.jpeg",
    alt: "Dames",
    name: "Dames",
    sub: "Styling",
  },
  {
    src: "/images/services/kleuren.jpeg",
    alt: "Kleuren",
    name: "Kleuren",
    sub: "Techniek",
  },
  {
    src: "/images/services/balayage-higlights.jpeg",
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