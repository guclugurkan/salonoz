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
          {safeReviews.length > 0 ? safeReviews.map((review) => (
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