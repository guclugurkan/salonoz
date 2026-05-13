import { useState, useEffect } from 'react'
import './Reservation.css'

// Categories are now fetched dynamically from backend
// The hardcoded ones are removed.

// Staff is now fetched dynamically from backend
const staff_placeholder = [] 

const timeSlots = [
  "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45"
]

const totalSteps = 8

export default function Reservation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [categories, setCategories] = useState([])
  const [appointments, setAppointments] = useState([])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorStatus, setErrorStatus] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [settings, setSettings] = useState(null)
  const [staff, setStaff] = useState([])
  const [formData, setFormData] = useState({
    category: null,
    service: null,
    staff: null,
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
    subService: null,
    subServiceName: ''
  })

  function addMinutes(timeStr, mins) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + mins);
    return date.toTimeString().substring(0, 5);
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories`)
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments/public`)
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/settings`)
        if (response.ok) {
          const data = await response.json()
          setSettings(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff`)
        if (response.ok) {
          const data = await response.json()
          setStaff(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error)
      }
    }
    fetchStaff()
  }, [])

  const getFilteredStaff = () => {
    if (!formData.service) return staff;
    return staff.filter(member => {
      if (member.canDoAllServices) return true;
      if (!member.allowedServices) return false;
      
      // If a variant is selected, check for the specific variant key
      if (formData.variant) {
        const variantKey = `${formData.service.id}:${formData.variant.name}`;
        return member.allowedServices.includes(variantKey);
      }
      
      // Otherwise check the main service ID
      return member.allowedServices.includes(formData.service.id);
    });
  }

  const filteredStaff = getFilteredStaff();

  const getOccupiedSlots = () => {
    if (!formData.staff || !formData.date) return []
    return appointments
      .filter(a =>
        a.staff === formData.staff.name &&
        a.date === formData.date &&
        a.status !== 'cancelled' &&
        a.status !== 'rejected'
      )
      .flatMap(a => (a.bookedSlots && a.bookedSlots.length > 0) ? a.bookedSlots : [a.time])
  }

  const occupiedSlots = getOccupiedSlots()

  const isTimeValidForService = (startTime) => {
    if (!formData.service) return false;
    
    // Check if the actual start time is occupied
    if (occupiedSlots.includes(startTime)) return false;

    // Calculate required slots for blocks
    const targetService = formData.variant ? formData.variant : formData.service;
    const blocks = targetService.blocks && targetService.blocks.length > 0 
      ? targetService.blocks 
      : [{ duration: 30, type: 'work' }];
      
    let currentStartTime = startTime;
    
    for (const block of blocks) {
      const numIntervals = Math.ceil(block.duration / 15);
      for (let i = 0; i < numIntervals; i++) {
        if (block.type === 'work') {
          // Check if this required slot is occupied by another appointment
          if (occupiedSlots.includes(currentStartTime)) {
            return false;
          }
        }
        currentStartTime = addMinutes(currentStartTime, 15);
      }
    }

    // Check if the service ends before closing time
    if (settings) {
      const dayName = getDayName(formData.date);
      const daySettings = settings.workingHours[dayName];
      if (daySettings && currentStartTime > daySettings.close) {
        return false;
      }
    }

    return true;
  }

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  const getAvailableTimeSlots = () => {
    if (!formData.date || !settings) return timeSlots;
    
    // Check if date is in closedDays
    if (settings.closedDays && settings.closedDays.includes(formData.date)) return [];
    
    const dayName = getDayName(formData.date);
    const daySettings = settings.workingHours[dayName];
    
    if (!daySettings || daySettings.closed) return [];
    
    const { open, close } = daySettings;
    
    return timeSlots.filter(slot => {
      return slot >= open && slot < close;
    });
  }

  const dynamicTimeSlots = getAvailableTimeSlots();

  const getPauseInfo = () => {
    const target = formData.variant || formData.service;
    if (!target || !target.blocks) return null;
    
    let elapsed = 0;
    for (const block of target.blocks) {
      if (block.type === 'pause' && block.duration >= 15) {
        return {
          duration: block.duration,
          startTime: addMinutes(formData.time, elapsed)
        };
      }
      elapsed += block.duration;
    }
    return null;
  }

  const getSubServices = () => {
    const pauseInfo = getPauseInfo();
    if (!pauseInfo) return [];
    
    const available = [];
    categories.forEach(cat => {
      cat.services.forEach(s => {
        const duration = s.blocks ? s.blocks.reduce((acc, b) => acc + b.duration, 0) : 30;
        if (duration <= pauseInfo.duration && s.id !== formData.service?.id) {
          available.push({...s, categoryName: cat.name});
        }
      });
    });
    return available;
  }

  useEffect(() => {
    if (!isConfirmed && formData.time && !isTimeValidForService(formData.time)) {
      setFormData(prev => ({ ...prev, time: '' }))
    }
  }, [formData.staff, formData.date, occupiedSlots, formData.time, isConfirmed, formData.service])

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
    if (currentStep === 5 && !getPauseInfo()) {
      setCurrentStep(7); // Skip gap filling step if no pause
      return;
    }
    if (currentStep === 6) {
      setValidationError(null);
    }
    if (currentStep === 7) {
      const error = validateStep6();
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep === 7 && !getPauseInfo()) {
      setCurrentStep(5);
      return;
    }
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true)
    setErrorStatus(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // 1. Calculate full continuous blocks if Duo is selected
      let customBookedSlots = null;
      let duoNote = formData.notes;

      if (formData.subService) {
        const target = formData.variant || formData.service;
        if (target && target.blocks) {
          const totalDuration = target.blocks.reduce((acc, b) => acc + b.duration, 0);
          customBookedSlots = [];
          let curr = formData.time;
          const numSlots = Math.ceil(totalDuration / 15);
          for (let i = 0; i < numSlots; i++) {
            customBookedSlots.push(curr);
            curr = addMinutes(curr, 15);
          }
        }
        
        const startTime = getPauseInfo()?.startTime || "Tijdens de pauze";
        duoNote = `[DUO: ${formData.subService.name} voor ${formData.subServiceName || 'Partner'} - Tijd: ${startTime}] ${formData.notes}`;
      }

      // 2. Prepare main appointment data
      const appointmentData = {
        service: formData.variant ? `${formData.service?.name} (${formData.variant?.name})` : formData.service?.name,
        staff: formData.staff?.name,
        date: formData.date,
        time: formData.time,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: duoNote,
        bookedSlots: customBookedSlots,
      };

      // 3. Send combined request
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Reservatie mislukt");
      }

      setIsConfirmed(true)
      if (result.data) {
        setAppointments(prev => [...prev, result.data])
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      setErrorStatus(error.message || "Kon geen verbinding maken met de server")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.category !== null
      case 2: 
        if (!formData.service) return false;
        if (formData.service.variants && formData.service.variants.length > 0) return formData.variant !== null;
        return true;
      case 3: return formData.staff !== null
      case 4: return formData.date !== ''
      case 5: return formData.time !== ''
      case 6: return true // Gap filling is optional
      case 7: return formData.name && formData.email && formData.phone
      case 8: return true
      default: return true
    }
  }

  const formatPrice = (service) => {
    if (typeof service.price === 'string' && service.price.includes('€')) {
      return service.price;
    }
    return service.fromPrice ? `v.a. ${service.price} €` : `${service.price} €`;
  }

  const stepLabels = ["Cat.", "Serv.", "Styl.", "Dat.", "Tijd.", "Extra", "Gegevens", "Overz."]

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
              {formData.subService && (
                <div className="success-info-item" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span className="success-info-label" style={{ color: '#0f172a', fontWeight: 'bold' }}>Extra Duo Service</span>
                  <span className="success-info-value" style={{ display: 'block', marginTop: '4px' }}>
                    {formData.subService.name} voor {formData.subServiceName || 'Partner'}
                  </span>
                  <span className="success-info-label" style={{ marginTop: '8px', display: 'block' }}>Starttijd Duo</span>
                  <span className="success-info-value">{getPauseInfo()?.startTime}</span>
                </div>
              )}
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
              {formData.service && formData.service.variants && formData.service.variants.length > 0 ? (
                <>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                    <button onClick={() => setFormData({...formData, service: null, variant: null})} style={{marginRight: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9'}}>← Terug</button>
                    <h2 className="step-title" style={{margin: 0}}>Kies de lengte / variant</h2>
                  </div>
                  <p className="step-subtitle">
                    <span className="step-category-badge">{formData.service.name}</span>
                  </p>
                  {formData.category?.name === 'Kleuren' && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.5rem', textAlign: 'center' }}>
                      * De prijzen zijn vanaf, afhankelijk van de lengte en dikte van het haar.
                    </p>
                  )}
                  <div className="options-list">
                    {formData.service.variants.map(v => (
                      <button
                        key={v.name}
                        className={`option-card ${formData.variant?.name === v.name ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, variant: v })}
                      >
                        <span className="option-name">{v.name}</span>
                        <span className="option-price">{formatPrice(v)}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="step-title">Kies uw Service</h2>
                  <p className="step-subtitle">
                    <span className="step-category-badge">{formData.category?.icon} {formData.category?.name}</span>
                  </p>
                  {formData.category?.name === 'Kleuren' && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.5rem', textAlign: 'center' }}>
                      * De prijzen zijn vanaf, afhankelijk van de lengte en dikte van het haar.
                    </p>
                  )}
                  <div className="options-list">
                    {formData.category?.services.map(service => (
                      <button
                        key={service.id}
                        className={`option-card ${formData.service?.id === service.id ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, service, variant: null })}
                      >
                        <span className="option-name">{service.name}</span>
                        <span className="option-price">{formatPrice(service)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 — Staff */}
          {currentStep === 3 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Kies uw Stylist</h2>
              <p className="step-subtitle">Selecteer uw voorkeursstylist</p>
              <div className="staff-grid">
                {filteredStaff.length === 0 ? (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Geen medewerkers beschikbaar voor deze service.
                  </p>
                ) : filteredStaff.map(member => (
                  <button
                    key={member._id}
                    className={`staff-card ${formData.staff?._id === member._id ? 'selected' : ''}`}
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
                {dynamicTimeSlots.length === 0 ? (
                  <p className="no-slots-text" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Geen beschikbare tijdsloten voor deze dag.
                  </p>
                ) : dynamicTimeSlots.map(time => {
                  const isAvailable = isTimeValidForService(time)
                  return (
                    <button
                      key={time}
                      className={`time-slot ${formData.time === time ? 'selected' : ''} ${!isAvailable ? 'booked' : ''}`}
                      onClick={() => { if (isAvailable) setFormData({ ...formData, time }) }}
                      disabled={!isAvailable}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 6 — Gap Filling / Duo Option */}
          {currentStep === 6 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Duo Optie</h2>
              <p className="step-subtitle">
                U heeft een pauze van <strong>{getPauseInfo()?.duration} min</strong>. 
                Wilt u een extra service boeken voor iemand anders (of uzelf) tijdens deze tijd?
              </p>
              
              <div className="options-list" style={{ marginBottom: '20px' }}>
                <button 
                  className={`option-card ${!formData.subService ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, subService: null })}
                >
                  <span className="option-name">Nee, bedankt</span>
                </button>
                
                {getSubServices().map(s => (
                  <button
                    key={s.id}
                    className={`option-card ${formData.subService?.id === s.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, subService: s })}
                  >
                    <div>
                      <div className="option-name">{s.name}</div>
                      <div style={{fontSize: '10px', color: '#aaa'}}>{s.categoryName}</div>
                    </div>
                    <span className="option-price">{formatPrice(s)}</span>
                  </button>
                ))}
              </div>

              {formData.subService && (
                <div className="form-group fade-in">
                  <label className="form-label">Naam van de extra persoon</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Naam van uw partner / vriend(in)"
                    value={formData.subServiceName} 
                    onChange={(e) => setFormData({ ...formData, subServiceName: e.target.value })} 
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 7 — Infos client */}
          {currentStep === 7 && (
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

          {/* STEP 8 — Summary */}
          {currentStep === 8 && (
            <div className="step-section fade-in">
              <h2 className="step-title">Overzicht</h2>
              <p className="step-subtitle">Controleer uw reservatiegegevens</p>
              <div className="summary-card">
                {[
                  { label: "Categorie", value: `${formData.category?.icon} ${formData.category?.name}` },
                  { label: "Service", value: formData.variant ? `${formData.service?.name} (${formData.variant?.name})` : formData.service?.name },
                  { label: "Prijs", value: formatPrice(formData.variant ? formData.variant : formData.service) },
                  { label: "Stylist", value: formData.staff?.name },
                  { label: "Datum", value: new Date(formData.date).toLocaleDateString('nl-BE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                  { label: "Tijdstip", value: formData.time },
                  ...(formData.subService ? [
                    { label: "Extra Duo Service", value: formData.subService.name },
                    { label: "Naam Duo", value: formData.subServiceName || 'Duo' },
                    { label: "Starttijd Duo", value: getPauseInfo()?.startTime }
                  ] : []),
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
                  <p style={{ marginTop: '15px', fontSize: '12px', fontStyle: 'italic', color: '#64748b' }}>
                    Door uw afspraak te bevestigen, gaat u akkoord met deze voorwaarden.
                  </p>
                </div>
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