import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Reviews.css";
import { GOOGLE_REVIEWS_URL } from "../../data/reviewsData";

const Stars = ({ count }) => (
  <span className="reviews__stars">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i}>★</span>
    ))}
  </span>
);

const GoogleIcon = () => (
  <svg className="reviews__google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setReviews(result.data);
        }
      })
      .catch(err => console.error("Error fetching reviews:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="reviews" className="reviews">
        <div className="reviews__header is-visible" style={{ opacity: 1, transform: 'none' }}>
           <h2 className="reviews__title">Wat zij zeggen</h2>
           <p className="reviews__subtitle">Chargement des avis...</p>
        </div>
      </section>
    );
  }

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const tickerItems = safeReviews.length > 0 ? [...safeReviews, ...safeReviews, ...safeReviews] : [];

  return (
    <section id="reviews" className="reviews">

      <div className="reviews__header is-visible" style={{ opacity: 1, transform: 'none' }}>
        <div className="reviews__kicker">
          <span className="reviews__kickerLine" />
          <span className="reviews__kickerText">Klantbeoordelingen</span>
          <span className="reviews__kickerLine" />
        </div>
        <h2 className="reviews__title">Wat zij zeggen</h2>
        <p className="reviews__subtitle">
          Meer dan 174 geverifieerde beoordelingen — gemiddelde score 5 / 5
        </p>
      </div>

      {/* TICKER */}
      <div className="reviews__ticker-wrapper is-visible" style={{ opacity: 1, transform: 'none' }}>
        <div className="reviews__ticker">
          <div className="reviews__ticker-track">
            {tickerItems.length > 0 ? tickerItems.map((review, i) => (
              <div key={i} className="reviews__card">
                <div className="reviews__card-top">
                  <div className="reviews__avatar">{review.name?.charAt(0) || "?"}</div>
                  <div className="reviews__meta">
                    <span className="reviews__name">{review.name}</span>
                    <span className="reviews__date">{review.date}</span>
                  </div>
                  <GoogleIcon />
                </div>
                <Stars count={review.rating} />
                <p className="reviews__text">"{review.text}"</p>
              </div>
            )) : (
              <p className="reviews__subtitle" style={{ textAlign: 'center', width: '100%', opacity: 1 }}>
                Geen beoordelingen gevonden.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="reviews__footer is-visible" style={{ opacity: 1, transform: 'none' }}>
        <Link
          to="/reviews"
          className="reviews__button"
        >
          <span className="reviews__buttonText">Laat een beoordeling achter</span>
          <span className="reviews__buttonFill" />
        </Link>
      </div>

    </section>
  );
}