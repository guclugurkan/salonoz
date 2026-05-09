import { useEffect } from "react";
import "./AboutPage.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { GOOGLE_REVIEWS_URL } from "../../data/reviewsData";

const team = [
  { name: "OZ", role: "Men's & International Artist", initial: "O" },
  { name: "Elanur", role: "Color & Balayage", initial: "E" },
  { name: "Ashkan", role: "Color & Balayage Specialist", initial: "A" },
];

const stats = [
  { value: "2020", label: "Opgericht" },
  { value: "174+", label: "Beoordelingen" },
  { value: "4.9★", label: "Gemiddelde score" },
  { value: "3–5", label: "Professionals" },
];

function Section({ children, className = "" }) {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`ap__section ${isVisible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

export default function AboutPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="about-page">

      {/* ── HERO ── */}
      {/* ── HERO ── */}
      <div className="ap__hero">
        <img
          src="/images/salon_interior.webp"
          alt="Salon OZ Interior"
          className="ap__hero-img"
        />
        <div className="ap__hero-overlay" />
        <div className="ap__hero-content">
          <span className="ap__hero-accent" />
          <h1 className="ap__hero-title">Salon OZ</h1>
          <p className="ap__hero-sub">Since 2020</p>
        </div>
      </div>

      <div className="ap__container">

        {/* ── HISTOIRE ── */}
        <Section>
          <div className="ap__grid">
            {/* Image avec cadre offset */}
            <div className="ap__img-block">
              <div className="ap__img-frame" />
              <div className="ap__img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
                  alt="Tayyar Ozcan"
                  className="ap__img"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Texte */}
            <div className="ap__content">
              <div className="ap__kicker">
                <span className="ap__kickerLine" />
                <span className="ap__kickerText">Het verhaal</span>
                <span className="ap__kickerLine" />
              </div>
              <h2 className="ap__title">Van passie tot excellentie</h2>
              <div className="ap__divider" />
              <p className="ap__text">
                Bij Salon Oz staan passie, vakmanschap en een persoonlijke aanpak centraal. Oz wist al op jonge leeftijd dat het kappersvak zijn toekomst was. Vanuit die passie begon hij zich al vroeg te verdiepen in het vak en volgde hij verschillende opleidingen, waaronder gespecialiseerde trainingen in herenhaar en baardverzorging.
              </p>
              <p className="ap__text">
                Na jaren ervaring op te doen in verschillende salons en zich voortdurend bij te scholen, besloot Oz in 2020 zijn eigen weg uit te gaan en startte hij zelfstandig met Salon Oz. Sindsdien bouwde hij het salon uit tot een warme plek waar klanten zich welkom voelen en waar eerlijk advies en kwaliteit vooropstaan.
              </p>
              <p className="ap__text">
                Doorheen de jaren specialiseerde hij zich in metamorfoses, moderne snitten, kleuringen en hairextensions. Ook mannen kunnen bij hem terecht voor verzorgde herensnitten en professioneel gestylde baarden, telkens met oog voor detail en persoonlijkheid.
              </p>
              <p className="ap__text">
                Wat Salon Oz bijzonder maakt, is de sfeer die Oz samen met zijn team creëert: ontspannen, oprecht en professioneel. Zijn positieve energie, spontaniteit en liefde voor het vak zorgen ervoor dat klanten niet alleen buitenwandelen met een sterk kapsel, maar ook met een glimlach.
              </p>
            </div>
          </div>
        </Section>

        <div className="ap__separator" />

        {/* ── ÉQUIPE ── */}
        <Section>
          <div className="ap__section-header">
            <div className="ap__kicker">
              <span className="ap__kickerLine" />
              <span className="ap__kickerText">Ons team</span>
              <span className="ap__kickerLine" />
            </div>
            <h2 className="ap__title ap__title--center">Een Team, Een Universum</h2>
            <p className="ap__lead">
              Ons team bestaat uit gedreven professionals, elk expert in hun vakgebied.
              Samen staan wij voor één doel: jou op je allerbest laten voelen.
            </p>
          </div>

          <div className="ap__team-grid">
            {team.map((member, i) => (
              <div key={i} className="ap__team-card">
                <div className="ap__team-avatar">{member.initial}</div>
                <div className="ap__team-info">
                  <span className="ap__team-name">{member.name}</span>
                  <span className="ap__team-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* ── STATS BAND ── */}
      <Section className="ap__stats-section">
        <div className="ap__stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="ap__stat">
              <span className="ap__stat-value">{stat.value}</span>
              <span className="ap__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── REVIEWS BANNER ── */}
      <div className="ap__container">
        <Section>
          <div className="ap__reviews-banner">
            <div className="ap__reviews-img-block">
              <div className="ap__img-frame ap__img-frame--right" />
              <div className="ap__img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80"
                  alt="Tevreden klanten"
                  className="ap__img"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="ap__content">
              <div className="ap__kicker">
                <span className="ap__kickerLine" />
                <span className="ap__kickerText">Beoordelingen</span>
                <span className="ap__kickerLine" />
              </div>
              <h2 className="ap__title">Onze klanten spreken voor ons</h2>
              <div className="ap__divider" />
              <p className="ap__text">
                Onze klanten zijn onze beste ambassadeurs. Met meer dan <strong>174 geverifieerde
                  beoordelingen</strong> en een gemiddelde score van <strong>4.9 op 5</strong>,
                bewijzen zij elke dag dat kwaliteit en persoonlijke aandacht het verschil maken.
              </p>
              <p className="ap__text">
                Jouw tevredenheid is onze drijfveer — bij elk bezoek, voor elke behandeling.
              </p>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ap__button"
              >
                <span className="ap__buttonText">Laat een beoordeling achter</span>
                <span className="ap__buttonFill" />
              </a>
            </div>
          </div>
        </Section>
      </div>

    </div>
  );
}