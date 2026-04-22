import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./CancelPage.css";

export default function CancelPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | expired | invalid | error
  const [appointment, setAppointment] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = searchParams.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    const cancelAppointment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments/cancel?token=${token}`
        );
        const data = await response.json();

        if (data.success) {
          setAppointment(data.data);
          setStatus("success");
        } else {
          setErrorMsg(data.error || "Er is een fout opgetreden.");
          if (response.status === 403) {
            setStatus("expired");
          } else if (response.status === 404) {
            setStatus("invalid");
          } else {
            setStatus("error");
          }
        }
      } catch (error) {
        console.error("Cancel error:", error);
        setStatus("error");
        setErrorMsg("Verbindingsfout. Probeer het later opnieuw.");
      }
    };

    cancelAppointment();
  }, []);

  return (
    <div className="cancel-page">
      <div className="cancel-page__card">

        {/* Loading */}
        {status === "loading" && (
          <div className="cancel-page__state">
            <div className="cancel-page__spinner" />
            <p className="cancel-page__msg">Annulatie verwerken...</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="cancel-page__state">
            <div className="cancel-page__icon cancel-page__icon--success">✓</div>
            <h1 className="cancel-page__title">Afspraak Geannuleerd</h1>
            <p className="cancel-page__msg">
              Uw afspraak is succesvol geannuleerd. Het tijdslot is opnieuw beschikbaar.
            </p>
            {appointment && (
              <div className="cancel-page__details">
                <div className="cancel-page__detail-row">
                  <span className="cancel-page__detail-label">Service</span>
                  <span className="cancel-page__detail-value">{appointment.service}</span>
                </div>
                <div className="cancel-page__detail-row">
                  <span className="cancel-page__detail-label">Datum</span>
                  <span className="cancel-page__detail-value">
                    {new Date(appointment.date).toLocaleDateString("nl-BE", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })}
                  </span>
                </div>
                <div className="cancel-page__detail-row">
                  <span className="cancel-page__detail-label">Tijdstip</span>
                  <span className="cancel-page__detail-value">{appointment.time}</span>
                </div>
              </div>
            )}
            <Link to="/reservation" className="cancel-page__btn">
              Nieuwe afspraak maken
            </Link>
          </div>
        )}

        {/* Expired — within 24h */}
        {status === "expired" && (
          <div className="cancel-page__state">
            <div className="cancel-page__icon cancel-page__icon--warning">!</div>
            <h1 className="cancel-page__title">Annulatie Niet Mogelijk</h1>
            <p className="cancel-page__msg">
              De annulatieperiode van 24u voor de afspraak is verstreken.
              Neem telefonisch contact op:
            </p>
            <a href="tel:+320485550271" className="cancel-page__phone">
              0485 55 02 71
            </a>
            <Link to="/" className="cancel-page__btn cancel-page__btn--secondary">
              Terug naar de startpagina
            </Link>
          </div>
        )}

        {/* Invalid token */}
        {status === "invalid" && (
          <div className="cancel-page__state">
            <div className="cancel-page__icon cancel-page__icon--error">✕</div>
            <h1 className="cancel-page__title">Ongeldige Link</h1>
            <p className="cancel-page__msg">
              Deze annulatielink is ongeldig of al gebruikt.
              Neem contact op als u hulp nodig heeft.
            </p>
            <a href="tel:+320485550271" className="cancel-page__phone">
              0485 55 02 71
            </a>
            <Link to="/" className="cancel-page__btn cancel-page__btn--secondary">
              Terug naar de startpagina
            </Link>
          </div>
        )}

        {/* Generic error */}
        {status === "error" && (
          <div className="cancel-page__state">
            <div className="cancel-page__icon cancel-page__icon--error">✕</div>
            <h1 className="cancel-page__title">Er is iets misgegaan</h1>
            <p className="cancel-page__msg">{errorMsg}</p>
            <Link to="/" className="cancel-page__btn cancel-page__btn--secondary">
              Terug naar de startpagina
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}