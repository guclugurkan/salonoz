import { useState, useEffect, useMemo } from "react";
import "./GalleryPage.css";
import useScrollReveal from "../../hooks/useScrollReveal";

const filters = ["All", "Heren", "Dames"];

export default function GalleryPage() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/images`);
        const data = await response.json();

        if (data.success) {
          const images = [
            ...data.data.heren,
            ...data.data.dames,
          ].map((img, index) => ({ ...img, id: index + 1 }));
          setAllImages(images);
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") setLightboxIndex(i => Math.min(i + 1, filteredData.length - 1));
      if (e.key === "ArrowLeft")  setLightboxIndex(i => Math.max(i - 1, 0));
      if (e.key === "Escape")     setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex]);

  const filteredData = useMemo(() =>
    activeFilter === "All"
      ? allImages
      : allImages.filter(img => img.category === activeFilter),
    [activeFilter, allImages]
  );

  const displayedImages = filteredData.slice(0, visibleCount);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(8);
  };

  const lightboxImage = lightboxIndex !== null ? filteredData[lightboxIndex] : null;

  return (
    <div className="gp-section">
      <div className="gp__container" ref={ref}>

        {/* HEADER */}
        <div className={`gp__header ${isVisible ? "is-visible" : ""}`}>
          <div className="gp__kicker">
            <span className="gp__kickerLine" />
            <span className="gp__kickerText">Portfolio</span>
            <span className="gp__kickerLine" />
          </div>
          <h1 className="gp__title">Onze Signatuur</h1>
          <p className="gp__subtitle">De excellentie van Salon OZ vastgelegd in beelden.</p>
          {!loading && (
            <p className="gp__count">{allImages.length} realisaties</p>
          )}
        </div>

        {/* FILTRES */}
        <div className={`gp__filters ${isVisible ? "is-visible" : ""}`}>
          {filters.map(filter => (
            <button
              key={filter}
              className={`gp__filter-btn ${activeFilter === filter ? "active" : ""}`}
              onClick={() => handleFilterChange(filter)}
            >
              {filter}
              {!loading && (
                <span className="gp__filter-count">
                  {filter === "All"
                    ? allImages.length
                    : allImages.filter(i => i.category === filter).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="gp__loading">
            <span>Realisaties worden geladen...</span>
          </div>
        )}

        {/* GRILLE */}
        {!loading && (
          <div className={`gp__grid ${isVisible ? "is-visible" : ""}`}>
            {displayedImages.map((item, index) => (
              <div
                key={item.id}
                className="gp__item"
                onClick={() => setLightboxIndex(index)}
              >
                <img src={item.src} alt={item.alt} className="gp__img" loading="lazy" />
                <div className="gp__overlay" />
                <div className="gp__viewWrap">
                  <span className="gp__viewPill">Vergroten</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOAD MORE */}
        {!loading && visibleCount < filteredData.length && (
          <div className="gp__load-more-wrap">
            <button className="gp__load-more-btn" onClick={() => setVisibleCount(p => p + 8)}>
              <span>Meer realisaties bekijken</span>
              <span className="gp__load-more-line" />
            </button>
          </div>
        )}

      </div>

      {/* LIGHTBOX */}
      {lightboxImage && (
        <div className="gp__lightbox" onClick={() => setLightboxIndex(null)}>
          {lightboxIndex > 0 && (
            <button
              className="gp__lightbox-nav gp__lightbox-nav--prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i - 1); }}
            >←</button>
          )}

          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="gp__lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < filteredData.length - 1 && (
            <button
              className="gp__lightbox-nav gp__lightbox-nav--next"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i + 1); }}
            >→</button>
          )}

          <button className="gp__lightbox-close" onClick={() => setLightboxIndex(null)}>✕</button>

          <span className="gp__lightbox-counter">
            {lightboxIndex + 1} / {filteredData.length}
          </span>
        </div>
      )}
    </div>
  );
}