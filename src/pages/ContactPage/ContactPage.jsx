import { useState, useEffect } from "react";
import "./ContactPage.css";
import useScrollReveal from "../../hooks/useScrollReveal";

const hours = [
  { day: "Maandag",          time: "09:00 — 18:00" },
  { day: "Dinsdag",          time: "Gesloten" },
  { day: "Woensdag",         time: "09:00 — 18:00" },
  { day: "Donderdag",        time: "09:00 — 20:00" },
  { day: "Vrijdag",          time: "09:00 — 18:00" },
  { day: "Zaterdag",         time: "09:00 — 16:00" },
  { day: "Zondag",           time: "09:00 — 16:00" },
];

export default function ContactPage() {
  const { ref, isVisible } = useScrollReveal(0.1);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Contact error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="cp-section">
      <div className="cp__container" ref={ref}>

        {/* HEADER */}
        <div className={`cp__header ${isVisible ? "is-visible" : ""}`}>
          <div className="cp__kicker">
            <span className="cp__kickerLine" />
            <span className="cp__kickerText">Contact</span>
            <span className="cp__kickerLine" />
          </div>
          <h1 className="cp__title">Neem Contact Op</h1>
          <p className="cp__subtitle">
            Een vraag? Een transformatieproject? Ons team staat voor u klaar.
          </p>
        </div>

        <div className={`cp__grid ${isVisible ? "is-visible" : ""}`}>

          {/* INFOS */}
          <div className="cp__info">

            <div className="cp__info-block">
              <h3 className="cp__info-label">Het Salon</h3>
              <p className="cp__info-text">
                Vierhekkenstraat 1A<br />
                Drongen BE-9031
              </p>
              <a
                href="https://www.google.com/maps/place/Salon+%C3%96z+%E2%9C%82/@51.0507623,3.6605012,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="cp__map-link"
              >
                Bekijken op Google Maps →
              </a>
            </div>

            <div className="cp__info-block">
              <h3 className="cp__info-label">Reservaties</h3>
              <a href="tel:+32485550271" className="cp__info-link">+32 485 55 02 71</a>
              <a href="mailto:Salonoz@hotmail.com" className="cp__info-link">Salonoz@hotmail.com</a>
            </div>

            <div className="cp__info-block">
              <h3 className="cp__info-label">Openingsuren</h3>
              <div className="cp__hours-list">
                {hours.map((h, i) => (
                  <div key={i} className={`cp__hours-row ${h.time === "Gesloten" ? "cp__hours-row--closed" : ""}`}>
                    <span>{h.day}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FORMULAIRE */}
          <div className="cp__form-wrap">
            <form className="cp__form" onSubmit={handleSubmit}>

              <div className="cp__form-group">
                <label className="cp__form-label">Volledige naam</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Uw volledige naam"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="cp__form-input"
                />
              </div>

              <div className="cp__form-group">
                <label className="cp__form-label">E-mailadres</label>
                <input
                  type="email"
                  name="email"
                  placeholder="uw@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="cp__form-input"
                />
              </div>

              <div className="cp__form-group">
                <label className="cp__form-label">Bericht</label>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Hoe kunnen wij u helpen?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="cp__form-input cp__form-textarea"
                />
              </div>

              {/* Feedback messages */}
              {status === "success" && (
                <p className="cp__feedback cp__feedback--success">
                  ✓ Uw bericht is succesvol verzonden. We nemen snel contact met u op.
                </p>
              )}
              {status === "error" && (
                <p className="cp__feedback cp__feedback--error">
                  Er is iets misgegaan. Probeer het opnieuw of contacteer ons telefonisch.
                </p>
              )}

              <button
                type="submit"
                className="cp__submit-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Verzenden..." : "Bericht Verzenden"}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}