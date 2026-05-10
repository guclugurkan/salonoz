import { useEffect, useState, useRef } from "react";
import "./ReviewsPage.css";

const Stars = ({ count }) => (
  <span className="rp__stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < count ? "#D4AF37" : "#e0e0e0" }}>★</span>
    ))}
  </span>
);

const InteractiveStars = ({ rating, setRating }) => (
  <div className="rp__interactive-stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span 
        key={i} 
        className={`rp__star-btn ${i < rating ? 'active' : ''}`}
        onClick={() => setRating(i + 1)}
      >
        ★
      </span>
    ))}
  </div>
);

const GoogleIcon = () => (
  <svg className="rp__google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.4-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReviews();
    window.scrollTo(0, 0);
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews`);
      const result = await res.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !comment) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("rating", rating);
    formData.append("text", comment);
    formData.append("source", "site");
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      console.log("DEBUG: Submit Result:", result);
      if (result.success) {
        setSubmitSuccess(true);
        setName("");
        setComment("");
        setRating(5);
        setImage(null);
        setImagePreview(null);
        setTimeout(() => {
            setShowForm(false);
            setSubmitSuccess(false);
        }, 3000);
      } else {
        alert("Fout: " + (result.message || "Onbekende fout"));
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Er is een fout opgetreden bij het verzenden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rp-section">
        <div className="rp__container">
          <h1 className="rp__title">Chargement des avis...</h1>
        </div>
      </div>
    );
  }

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="rp-section">
      <div className="rp__container">

        {/* HEADER */}
        <div className="rp__header">
          <div className="rp__score">
            <span className="rp__score-number">5</span>
            <div className="rp__score-stars"><Stars count={5} /></div>
            <span className="rp__score-text">Gebaseerd op geverifieerde beoordelingen</span>
          </div>
          <h1 className="rp__title">Uw Getuigenissen</h1>
          <p className="rp__subtitle">Excellentie verteld door diegenen qui nous font confiance.</p>
          
          <button className="rp__leave-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Annuleren" : "Laat une beoordeling achter"}
          </button>
        </div>

        {/* REVIEW FORM */}
        {showForm && (
          <div className="rp__form-container fade-in">
            {submitSuccess ? (
              <div className="rp__success-msg">
                <h3>Bedankt!</h3>
                <p>Uw beoordeling is verzonden en zal worden gecontroleerd door ons team.</p>
              </div>
            ) : (
              <form className="rp__form" onSubmit={handleSubmit}>
                <div className="rp__form-grid">
                  <div className="rp__form-left">
                    <label>Uw Naam</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Naam" 
                      required 
                    />
                    
                    <label>Uw Beoordeling</label>
                    <InteractiveStars rating={rating} setRating={setRating} />
                    
                    <label>Uw Ervaring</label>
                    <textarea 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      placeholder="Deel uw ervaring..." 
                      rows="4"
                      required 
                    />
                  </div>
                  
                  <div className="rp__form-right">
                    <label>Foto toevoegen (optioneel)</label>
                    <div 
                        className="rp__upload-box" 
                        onClick={() => fileInputRef.current.click()}
                        style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none' }}
                    >
                      {!imagePreview && (
                        <>
                          <span className="rp__upload-icon">+</span>
                          <span className="rp__upload-text">Klik om une foto te uploaden</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    {imagePreview && (
                        <button type="button" className="rp__remove-img" onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}>
                            Verwijderen
                        </button>
                    )}
                  </div>
                </div>
                
                <button type="submit" className="rp__submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Verzenden..." : "Beoordeling Plaatsen"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* GRID */}
        <div className="rp__grid">
          {safeReviews.filter(r => r.source === 'site').length > 0 ? safeReviews.filter(r => r.source === 'site').map((review) => (
            <div key={review.id} className="rp__card">
              {review.imageUrl && (
                <div className="rp__card-img">
                  <img src={review.imageUrl} alt={`Review by ${review.name}`} />
                </div>
              )}
              <div className="rp__card-content">
                <div className="rp__card-top">
                  <div className="rp__avatar">{review.name?.charAt(0) || "?"}</div>
                  <div className="rp__meta">
                    <span className="rp__name">{review.name}</span>
                    <span className="rp__date">{review.date}</span>
                  </div>
                </div>
                <Stars count={review.rating} />
                <p className="rp__text">"{review.text}"</p>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px" }}>
              <p className="rp__subtitle">Nog geen beoordelingen. Wees de eerste!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}