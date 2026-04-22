import { useState, useEffect } from 'react'
import './Reservation.css'

const categories = [
  {
    id: 1,
    name: "Heren",
    icon: "✦",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80",
    services: [
      { id: 101, name: "Heren halflang/lang haar", price: 45 },
      { id: 102, name: "Herensnit", price: 35 },
      { id: 103, name: "Tondeuse", price: 20 },
      { id: 104, name: "Tondeuse met fade", price: 30 },
      { id: 105, name: "Herensnit met hoofdmassage", price: 55 },
      { id: 106, name: "Haar baard", price: 50 },
      { id: 107, name: "Baard trimmen/aflijnen", price: 25 },
    ]
  },
  {
    id: 2,
    name: "Dames Styling",
    icon: "✄",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    services: [
      { id: 201, name: "Snit & Losdrogen", price: "K: 45 € | H: 50 € | L: 55 €" },
      { id: 202, name: "Dames Brushing", price: "K: 35 € | H: 40 € | L: 45 €" },
      { id: 203, name: "Extensions", price: 55 },
      { id: 204, name: "Snit & Brushing", price: "K: 65 € | H: 70 € | L: 80 €" },
    ]
  },
  {
    id: 3,
    name: "Kleuren",
    icon: "◈",
    img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80",
    services: [
      { id: 301, name: "Kleuren uitgroei (max 3cm) met Brushing", price: "K: 100 € | H: 115 € | L: 120 €" },
      { id: 302, name: "Kleuren uitgroei + snit & brushing", price: "K: 135 € | H: 142 € | L: 148 €" },
      { id: 303, name: "Kleuren Uitgroei & Lengtes met Snit & Brushing", price: "K: 143 € | H: 158 € | L: 173 €" },
      { id: 304, name: "Kleuren uitgroei (max 3cm) met Snit & Losdrogen", price: "K: 115 € | H: 125 € | L: 130 €" },
      { id: 305, name: "Kleuren Uitgroei & Lengtes met Brushing", price: "K: 118 € | H: 133 € | L: 148 €" },
      { id: 306, name: "Kleuren Uitgroei & Lengtes met Snit & Losdrogen", price: "K: 128 € | H: 143 € | L: 158 €" },
    ]
  },
  {
    id: 4,
    name: "Balayage & Highlights",
    icon: "❋",
    img: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&q=80",
    services: [
      { id: 401, name: "Balayage & Foilyage met Brushing", price: "K: 170 € | H: 180 € | L: 190 €" },
      { id: 402, name: "Balayage & Foilyage met Snit & Brushing", price: "K: 195 € | H: 215 € | L: 230 €" },
      { id: 403, name: "Opfrissingstoner + Brushing", price: "K: 60 € | H: 75 € | L: 90 €" },
      { id: 404, name: "Opfrissingstoner met Snit & Brushing", price: "K: 100 € | H: 105 € | L: 115 €" },
    ]
  },
  {
    id: 5,
    name: "Kids",
    icon: "◇",
    img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
    services: [
      { id: 501, name: "Snit meisje tot 6 jaar", price: 20 },
      { id: 502, name: "Snit meisje tot 12 jaar", price: 30 },
      { id: 503, name: "Snit meisje tot 12 jaar (Met wassen)", price: 40 },
      { id: 504, name: "Snit meisje tot 12 jaar (Veel & lang haar)", price: 50 },
      { id: 505, name: "Snit jongen tot 6 jaar", price: 20 },
      { id: 506, name: "Snit jongen tot 12 jaar (Zonder wassen)", price: 25 },
      { id: 507, name: "Snit jongen tot 12 jaar (Met wassen)", price: 30 },
    ]
  },
  {
    id: 6,
    name: "Keratine Behandeling",
    icon: "⟡",
    img: "https://images.unsplash.com/photo-1634302086682-5c2bc7db8dc6?w=400&q=80",
    services: [
      { id: 601, name: "Brazilian keratine behandeling & brushing", price: "K: 200 € | H: 210 € | L: 220 €" },
      { id: 602, name: "Brazilian keratine behandeling Snit & brushing", price: "K: 230 € | H: 240 € | L: 260 €" },
    ]
  },
  {
    id: 7,
    name: "Opsteken",
    icon: "✿",
    img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80",
    services: [
      { id: 701, name: "Bruidskapsel (+ proef)", price: 165 },
      { id: 702, name: "Opsteken meisjes", price: 35 },
      { id: 703, name: "Opsteken dames (Normaal haar)", price: 55 },
      { id: 704, name: "Opsteken dames (Veel/lang haar)", price: 65 },
    ]
  },
  {
    id: 8,
    name: "Verzorging",
    icon: "◉",
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80",
    services: [
      { id: 801, name: "Verzorging", price: 5 },
      { id: 802, name: "Haarmasker", price: 10 },
    ]
  },
]

const staff = [
  { id: 1, name: "Oz", role: "Master Stylist" },
  { id: 2, name: "Sarah", role: "Senior Colorist" },
  { id: 3, name: "Alex", role: "Barber Specialist" },
]

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30"
]

const totalSteps = 7

export default function Reservation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorStatus, setErrorStatus] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [formData, setFormData] = useState({
    category: null,
    service: null,
    staff: null,
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
      }
    }
    fetchAppointments()
  }, [])

  const getBookedTimeSlots = () => {
    if (!formData.staff || !formData.date) return []
    return appointments
      .filter(a =>
        a.staff === formData.staff.name &&
        a.date === formData.date &&
        a.status !== 'cancelled' &&
        a.status !== 'rejected'
      )
      .map(a => a.time)
  }

  const bookedTimeSlots = getBookedTimeSlots()

  useEffect(() => {
    if (!isConfirmed && formData.time && bookedTimeSlots.includes(formData.time)) {
      setFormData(prev => ({ ...prev, time: '' }))
    }
  }, [formData.staff, formData.date, bookedTimeSlots, formData.time, isConfirmed])

  const validateStep6 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Voer een geldig e-mailadres in.";
    }
    const digitsOnly = formData.phone.replace(/\D/g, "");
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      return "Telefoonnummer moet tussen de 9 en 15 cijfers bevatten.";
    }
    return null;
  }

  const handleNext = () => {
    if (currentStep === 6) {
      const error = validateStep6();
      if (error) {
        setValidationError(error);
        return; // stop progression
      }
      setValidationError(null);
    } else {
      setValidationError(null);
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true)
    setErrorStatus(null)
    console.log("Submitting reservation:", formData)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: formData.service?.name,
          staff: formData.staff?.name,
          date: formData.date,
          time: formData.time,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
        }),
      })

      const result = await response.json()
      console.log("Server response received:", result)

      if (response.ok && result.success) {
        console.log("Success! Setting isConfirmed to true");
        setIsConfirmed(true)
        if (result.data) {
          setAppointments(prev => [...prev, result.data])
        }
      } else {
        setErrorStatus(result.error || "Reservatie mislukt")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      setErrorStatus("Kon geen verbinding maken met de server")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.category !== null
      case 2: return formData.service !== null
      case 3: return formData.staff !== null
      case 4: return formData.date !== ''
      case 5: return formData.time !== ''
      case 6: return formData.name && formData.email && formData.phone
      case 7: return termsAccepted
      default: return true
    }
  }

  const formatPrice = (service) => {
    if (typeof service.price === 'string' && service.price.includes('€')) {
      return service.price;
    }
    return service.fromPrice ? `v.a. ${service.price} €` : `${service.price} €`;
  }

  const stepLabels = ["Categorie", "Service", "Stylist", "Datum", "Tijdstip", "Gegevens", "Overzicht"]

  // Success screen
  if (isConfirmed) {
    const formattedDate = formData.date ? new Date(formData.date).toLocaleDateString('nl-BE', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }) : '';

    return (
      <div className="reservation-page">
        <div className="reservation-card success-card">
          <div className="success-header">
            <div className="success-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="success-title">Bedankt, {formData.name ? formData.name.split(' ')[0] : 'Klant'}!</h2>
            <p className="success-subtitle">Uw reservatie-aanvraag is succesvol verzonden.</p>
          </div>

          <div className="success-divider" />

          <div className="success-body">
            <h3 className="success-section-title">Afspraak Details</h3>
            <div className="success-info-grid">
              <div className="success-info-item">
                <span className="success-info-label">Service</span>
                <span className="success-info-value">{formData.service?.name}</span>
              </div>
              <div className="success-info-item">
                <span className="success-info-label">Stylist</span>
                <span className="success-info-value">{formData.staff?.name}</span>
              </div>
              <div className="success-info-item">
                <span className="success-info-label">Datum</span>
                <span className="success-info-value" style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
              </div>
              <div className="success-info-item">
                <span className="success-info-label">Tijdstip</span>
                <span className="success-info-value">{formData.time}</span>
              </div>
            </div>

            <div className="success-contact-box">
              <h3 className="success-section-title">Uw Gegevens</h3>
              <p><strong>E-mail:</strong> {formData.email}</p>
              <p><strong>Telefoon:</strong> {formData.phone}</p>
            </div>

            <div className="success-notice">
              <p>U ontvangt spoedig een bevestigingsmail. Controleer ook uw <strong>spam-folder</strong>.</p>
            </div>
          </div>

          <div className="success-footer">
            <button
              className="btn-primary success-btn"
              onClick={() => {
                setIsConfirmed(false);
                setCurrentStep(1);
                setTermsAccepted(false);
                setValidationError(null);
                setErrorStatus(null);
                setFormData({ category: null, service: null, staff: null, date: '', time: '', name: '', email: '', phone: '', notes: '' });
              }}
            >
              Nieuwe Reservatie Boeken
            </button>
            <a href="/" className="btn-secondary success-btn-home">Terug naar Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <div className="reservation-card">

        {/* Header */}
        <div className="reservation-header">
          <span className="header-label">Reservatie</span>
          <h1 className="header-title">SALON OZ</h1>
          <div className="header-divider" />
        </div>

        {/* Step labels */}
        <div className="step-labels">
          {stepLabels.map((label, i) => (
            <div key={i} className={`step-label-item ${currentStep === i + 1 ? 'active' : ''} ${currentStep > i + 1 ? 'done' : ''}`}>
              <div className="step-label-dot" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
          <span className="step-indicator">Stap {currentStep} / {totalSteps}</span>
        </div>

        {/* Step content */}
        <div className="step-content">

          {/* STEP 1 — Categorie */}
          {currentStep === 1 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Kies een Categorie</h2>
              <p className="step-subtitle">Selecteer het type behandeling dat u wenst</p>
              <div className="categories-grid">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-pill ${formData.category?.id === cat.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, category: cat, service: null })}
                  >
                    <span className="category-pill-name">{cat.name}</span>
                    <span className="category-pill-count">{cat.services.length} services</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Service */}
          {currentStep === 2 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Kies uw Service</h2>
              <p className="step-subtitle">
                <span className="step-category-badge">{formData.category?.icon} {formData.category?.name}</span>
              </p>
              <div className="options-list">
                {formData.category?.services.map(service => (
                  <button
                    key={service.id}
                    className={`option-card ${formData.service?.id === service.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, service })}
                  >
                    <span className="option-name">{service.name}</span>
                    <span className="option-price">{formatPrice(service)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Staff */}
          {currentStep === 3 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Kies uw Stylist</h2>
              <p className="step-subtitle">Selecteer uw voorkeursstylist</p>
              <div className="staff-grid">
                {staff.map(member => (
                  <button
                    key={member.id}
                    className={`staff-card ${formData.staff?.id === member.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, staff: member })}
                  >
                    <div className="staff-avatar">{member.name.charAt(0)}</div>
                    <span className="staff-name">{member.name}</span>
                    <span className="staff-role">{member.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Date */}
          {currentStep === 4 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Kies een Datum</h2>
              <p className="step-subtitle">Selecteer uw gewenste afspraakdatum</p>
              <div className="date-picker-wrapper">
                <input
                  type="date"
                  className="date-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {formData.date && (
                <p className="selected-date">
                  {new Date(formData.date).toLocaleDateString('nl-BE', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              )}
            </div>
          )}

          {/* STEP 5 — Time */}
          {currentStep === 5 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Kies een Tijdstip</h2>
              <p className="step-subtitle">Selecteer een beschikbaar tijdslot</p>
              <div className="time-grid">
                {timeSlots.map(time => {
                  const isBooked = bookedTimeSlots.includes(time)
                  return (
                    <button
                      key={time}
                      className={`time-slot ${formData.time === time ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                      onClick={() => { if (!isBooked) setFormData({ ...formData, time }) }}
                      disabled={isBooked}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 6 — Infos client */}
          {currentStep === 6 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Uw Gegevens</h2>
              <p className="step-subtitle">Vul uw contactgegevens in</p>
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Volledige naam</label>
                  <input type="text" className="form-input" placeholder="Uw volledige naam"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mailadres</label>
                  <input type="email" className="form-input" placeholder="Uw e-mailadres"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefoonnummer</label>
                  <input type="tel" className="form-input" placeholder="Uw telefoonnummer"
                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Opmerkingen <span className="optional">(optioneel)</span></label>
                  <textarea className="form-textarea" placeholder="Speciale wensen of opmerkingen"
                    value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                </div>
              </div>
              {validationError && (
                <p className="validation-error-text" style={{ color: '#b91c1c', fontSize: '13px', marginTop: '16px', fontWeight: '500' }}>
                  ⚠️ {validationError}
                </p>
              )}
            </div>
          )}

          {/* STEP 7 — Summary */}
          {currentStep === 7 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Overzicht</h2>
              <p className="step-subtitle">Controleer uw reservatiegegevens</p>
              <div className="summary-card">
                {[
                  { label: "Categorie", value: `${formData.category?.icon} ${formData.category?.name}` },
                  { label: "Service", value: formData.service?.name },
                  { label: "Prijs", value: formatPrice(formData.service) },
                  { label: "Stylist", value: formData.staff?.name },
                  { label: "Datum", value: new Date(formData.date).toLocaleDateString('nl-BE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                  { label: "Tijdstip", value: formData.time },
                  { label: "Naam", value: formData.name },
                  { label: "E-mail", value: formData.email },
                  { label: "Telefoon", value: formData.phone },
                  ...(formData.notes ? [{ label: "Opmerkingen", value: formData.notes }] : [])
                ].map((row, i) => (
                  <div key={i}>
                    {i > 0 && <div className="summary-divider" />}
                    <div className="summary-row">
                      <span className="summary-label">{row.label}</span>
                      <span className="summary-value">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Annulatievoorwaarden */}
              <div className="cancel-terms">
                <h3 className="cancel-terms__title">Annulatievoorwaarden</h3>
                <div className="cancel-terms__content">
                  <p>Een afspraak annuleren kan tot <strong>24u voor het ingeplande afspraak</strong> via de annulatielink in uw bevestigingsmail.</p>
                  <p>Bij grote behandelingen: telefonisch via <a href="tel:+320485550271">0485 55 02 71</a></p>
                  <p>Niet opdagen of te laat zonder verwittigen: het <strong>volledige bedrag wordt aangerekend</strong>.</p>
                  <p>Betaling: cash of Payconiq.</p>
                </div>
                <label className="cancel-terms__checkbox">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>Ik ga akkoord met de annulatievoorwaarden</span>
                </label>
              </div>

            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          {errorStatus && <p className="error-message" style={{ color: 'red', fontSize: '12px', marginRight: 'auto' }}>{errorStatus}</p>}

          {currentStep > 1 && (
            <button className="btn-secondary" onClick={handleBack} disabled={isLoading}>Terug</button>
          )}

          {currentStep < totalSteps ? (
            <button className="btn-primary" onClick={handleNext} disabled={!canProceed() || isLoading}>
              Doorgaan
            </button>
          ) : (
            <button type="button" className="btn-primary confirm-btn" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Bezig..." : "Afspraak Bevestigen"}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}