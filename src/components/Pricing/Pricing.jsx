import { useState, useEffect } from "react";
import "./Pricing.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";

const spotlight = [
  { category: "Heren", name: "Herensnit", price: "35 €" },
  { category: "Heren", name: "Herensnit met hoofdmassage", price: "55 €" },
  { category: "Dames Styling", name: "Snit & Brushing", price: "v.a. 65 €" },
  { category: "Kleuren", name: "Kleuren uitgroei + snit & brushing", price: "v.a. 135 €" },
  { category: "Balayage", name: "Balayage & Foilyage met Brushing", price: "v.a. 170 €" },
  { category: "Kids", name: "Snit meisje tot 6 jaar", price: "20 €" },
  { category: "Keratine", name: "Brazilian keratine & brushing", price: "v.a. 200 €" },
  { category: "Opsteken", name: "Bruidskapsel (+ proef)", price: "165 €" },
  { category: "Verzorging", name: "Haarmasker", price: "10 €" },
  { category: "Heren", name: "Baard trimmen/aflijnen", price: "25 €" },
];

const INTERVAL = 3000;

export default function Pricing() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    setProgress(0);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / (INTERVAL / 50));
      });
    }, 50);

    // Switch service
    const switchTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % spotlight.length);
        setProgress(0);
        setVisible(true);
      }, 400);
    }, INTERVAL);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(switchTimer);
    };
  }, [current, isVisible]);

  const service = spotlight[current];

  return (
    <section ref={ref} id="pricing" className="pricing">
      <div className="pricing__container">

        {/* HEADER */}
        <div className={`pricing__header ${isVisible ? "is-visible" : ""}`}>
          <div className="pricing__kicker">
            <span className="pricing__kickerLine" />
            <span className="pricing__kickerText">Tarieven</span>
            <span className="pricing__kickerLine" />
          </div>
          <h2 className="pricing__title">Onze Tarieven</h2>
          <p className="pricing__subtitle">
            Uitzonderlijke prestaties tegen transparante tarieven
          </p>
        </div>

        {/* SPOTLIGHT */}
        <div className={`pricing__spotlight ${isVisible ? "is-visible" : ""}`}>
          <div className={`pricing__spotlight-inner ${visible ? "fade-in" : "fade-out"}`}>
            <span className="pricing__spot-category">{service.category}</span>
            <h3 className="pricing__spot-name">{service.name}</h3>
            <span className="pricing__spot-price">{service.price}</span>
          </div>

          {/* Progress bar */}
          <div className="pricing__progress">
            <div
              className="pricing__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dots */}
          <div className="pricing__dots-nav">
            {spotlight.map((_, i) => (
              <button
                key={i}
                className={`pricing__dot ${i === current ? "active" : ""}`}
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => {
                    setCurrent(i);
                    setProgress(0);
                    setVisible(true);
                  }, 300);
                }}
              />
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className={`pricing__footer ${isVisible ? "is-visible" : ""}`}>
          <p className="pricing__note">
            Alle prijzen zijn vanafprijzen — het eindtarief varieert op basis van haarlengte.
          </p>
          <Link to="/pricing" className="pricing__button">
            <span className="pricing__buttonText">Alle tarieven bekijken</span>
            <span className="pricing__buttonFill" />
          </Link>
        </div>

      </div>
    </section>
  );
}