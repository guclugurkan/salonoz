import "./Gallery.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";

const images = [
  { src: "/images/gallery/men/img2.jpg",   alt: "Herensnit",     label: "Herensnit"     },
  { src: "/images/gallery/women/img1.jpg", alt: "Dames Styling", label: "Dames Styling" },
  { src: "/images/gallery/men/img4.jpg",   alt: "Haar & Baard",  label: "Haar & Baard"  },
  { src: "/images/gallery/women/img3.jpg", alt: "Balayage",      label: "Balayage"      },
  { src: "/images/gallery/men/img7.jpg",   alt: "Herensnit",     label: "Herensnit"     },
  { src: "/images/gallery/women/img5.jpg", alt: "Kleuren",       label: "Kleuren"       },
];

const transforms = [
  { rotate: -4, translateY: 0   },
  { rotate:  2, translateY: 28  },
  { rotate: -2, translateY: 8   },
  { rotate:  5, translateY: -12 },
  { rotate: -3, translateY: 20  },
  { rotate:  1, translateY: -8  },
];

export default function Gallery() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section ref={ref} id="gallery" className="gallery">
      <div className="gallery__container">

        {/* Header */}
        <div className={`gallery__header ${isVisible ? "is-visible" : ""}`}>
          <div className="gallery__kicker">
            <span className="gallery__kickerLine" />
            <span className="gallery__kickerText">Portfolio</span>
            <span className="gallery__kickerLine" />
          </div>
          <h2 className="gallery__title">Ons Werk</h2>
        </div>

        {/* Polaroid wall */}
        <div className="gallery__wall">
          {images.map((image, index) => (
            <div
              key={index}
              className={`gallery__polaroid ${isVisible ? "is-visible" : ""}`}
              style={{
                "--rotate": `${transforms[index].rotate}deg`,
                "--ty": `${transforms[index].translateY}px`,
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              <div className="gallery__polaroid-img-wrapper">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="gallery__polaroid-img"
                  loading="lazy"
                />
              </div>
              <span className="gallery__polaroid-label">{image.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`gallery__footer ${isVisible ? "is-visible" : ""}`}>
          <Link to="/gallery" className="gallery__btn">
            <span className="gallery__btnText">Bekijk de Galerij</span>
            <span className="gallery__btnFill" />
          </Link>
        </div>

      </div>
    </section>
  );
}