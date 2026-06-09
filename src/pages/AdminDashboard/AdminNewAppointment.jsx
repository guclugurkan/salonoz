import React, { useState, useEffect, useRef } from 'react';

const AdminNewAppointment = ({ token, showToast, onAppointmentCreated }) => {
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recherche client
  const [clientSearch, setClientSearch] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const searchTimeout = useRef(null);
  const [sendEmail, setSendEmail] = useState(false);

  const [formData, setFormData] = useState({
    category: null,
    service: null,
    variant: null,
    staff: null,
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      const [catRes, staffRes, apptRes, settingsRes] = await Promise.all([
        fetch(`${API}/api/categories`),
        fetch(`${API}/api/staff`),
        fetch(`${API}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/settings`),
      ]);
      const catData = await catRes.json();
      const staffData = await staffRes.json();
      const apptData = await apptRes.json();
      const settingsData = await settingsRes.json();

      if (catData.success) setCategories(catData.data);
      if (staffData.success) setStaff(staffData.data);
      if (apptData.success) setAppointments(apptData.data);
      if (settingsData.success) setSettings(settingsData.data);
    } catch (err) {
      console.error(err);
      showToast('Fout bij het laden van gegevens', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addMinutes = (timeStr, mins) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + mins);
    return date.toTimeString().substring(0, 5);
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const getEffectiveHours = (dateStr) => {
    if (!dateStr || !settings) return null;
    const override = settings.dateOverrides?.find(o => o.date === dateStr);
    if (override) return { open: override.open, close: override.close, isClosed: override.isClosed || false };
    const dayName = getDayName(dateStr);
    const daySettings = settings.workingHours?.[dayName];
    if (!daySettings || daySettings.closed) return { open: null, close: null, isClosed: true };
    return { open: daySettings.open, close: daySettings.close, isClosed: false };
  };

  const getOccupiedSlots = () => {
    if (!formData.staff || !formData.date) return [];
    return appointments
      .filter(a =>
        a.staff === formData.staff.name &&
        a.date === formData.date &&
        a.status !== 'cancelled' &&
        a.status !== 'rejected'
      )
      .flatMap(a => (a.bookedSlots && a.bookedSlots.length > 0) ? a.bookedSlots : [a.time]);
  };

  const calculateEndTime = (startTime) => {
    if (!startTime) return null;
    const targetService = formData.variant ? formData.variant : formData.service;
    const blocks = targetService?.blocks?.length > 0
      ? targetService.blocks
      : [{ duration: 30, type: 'work' }];
    let t = startTime;
    for (const block of blocks) {
      t = addMinutes(t, block.duration);
    }
    return t;
  };

  const isTimeValidForService = (startTime, occupiedSlots) => {
    // Si pas de service sélectionné, on bloque juste les créneaux occupés
    if (!formData.service) {
      return !occupiedSlots.includes(startTime);
    }

    if (occupiedSlots.includes(startTime)) return false;

    const targetService = formData.variant ? formData.variant : formData.service;
    const blocks = targetService.blocks && targetService.blocks.length > 0
      ? targetService.blocks
      : [{ duration: 30, type: 'work' }];

    let currentTime = startTime;
    for (const block of blocks) {
      const numIntervals = Math.ceil(block.duration / 15);
      for (let i = 0; i < numIntervals; i++) {
        if (block.type === 'work' && occupiedSlots.includes(currentTime)) return false;
        currentTime = addMinutes(currentTime, 15);
      }
    }

    // Vérifier que le service se termine avant l'heure de fermeture
    if (formData.date) {
      const hours = getEffectiveHours(formData.date);
      if (hours && !hours.isClosed && hours.close && currentTime > hours.close) return false;
    }

    return true;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recherche client avec debounce
  useEffect(() => {
    if (!clientSearch.trim()) {
      setClientSuggestions([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchingClients(true);
      try {
        const res = await fetch(
          `${API}/api/clients/search?q=${encodeURIComponent(clientSearch)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setClientSuggestions(data.data);
      } catch {
        setClientSuggestions([]);
      } finally {
        setSearchingClients(false);
      }
    }, 300);
  }, [clientSearch]);

  const selectClient = (client) => {
    setFormData(prev => ({ ...prev, name: client.name, email: client.email, phone: client.phone }));
    setClientSearch(client.name);
    setClientSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vul de naam van de klant in', 'error');
      return;
    }

    const appointmentData = {
      service: formData.service ? (formData.variant ? `${formData.service.name} (${formData.variant.name})` : formData.service.name) : '',
      staff: formData.staff?.name || '',
      date: formData.date,
      time: formData.time,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      status: 'confirmed',
      adminOverride: true,
      sendConfirmationEmail: sendEmail,
    };

    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Afspraak succesvol toegevoegd');
        setFormData({ category: null, service: null, variant: null, staff: null, date: '', time: '', name: '', email: '', phone: '', notes: '' });
        setClientSearch('');
        setSendEmail(false);
        if (onAppointmentCreated) onAppointmentCreated();
      } else {
        showToast(data.error || 'Fout bij het toevoegen', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Netwerkfout', 'error');
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="admin-new-appointment fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-card">
        <h2 className="admin-card-title">Nieuwe Afspraak Toevoegen</h2>
        <p className="admin-card-subtitle">Voeg handmatig een afspraak toe voor een klant.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="info-label">Categorie</label>
              <select
                className="appointments-filter-select"
                style={{ width: '100%', height: '45px' }}
                value={formData.category?.id || ''}
                onChange={e => {
                  const cat = categories.find(c => c.id === e.target.value);
                  setFormData({ ...formData, category: cat, service: null, variant: null });
                }}
              >
                <option value="">Selecteer categorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="info-label">Service</label>
              <select
                className="appointments-filter-select"
                style={{ width: '100%', height: '45px' }}
                disabled={!formData.category}
                value={formData.service?.id || ''}
                onChange={e => {
                  const srv = formData.category.services.find(s => s.id === e.target.value);
                  setFormData({ ...formData, service: srv, variant: null });
                }}
              >
                <option value="">Selecteer service</option>
                {formData.category?.services.map(srv => (
                  <option key={srv.id} value={srv.id}>{srv.name}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.service?.variants?.length > 0 && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="info-label">Lengte / Variant</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {formData.service.variants.map(v => (
                  <button
                    key={v.name}
                    type="button"
                    className={`cat-btn ${formData.variant?.name === v.name ? 'confirm' : 'edit'}`}
                    onClick={() => setFormData({ ...formData, variant: v })}
                    style={{ minWidth: '80px', padding: '8px 15px' }}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="info-label">Medewerker</label>
              <select
                className="appointments-filter-select"
                style={{ width: '100%', height: '45px' }}
                value={formData.staff?.name || ''}
                onChange={e => {
                  const m = staff.find(s => s.name === e.target.value);
                  setFormData({ ...formData, staff: m });
                }}
              >
                <option value="">Selecteer medewerker</option>
                {staff.map(m => (
                  <option key={m._id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="info-label">Datum</label>
              <input
                type="date"
                className="appointments-filter-input"
                style={{ width: '100%', height: '45px' }}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="info-label">Tijdstip</label>
            {(() => {
              const occupiedSlots = getOccupiedSlots();
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                  {(() => {
                    const slots = [];
                    for (let h = 8; h <= 21; h++) {
                      for (let m = 0; m < 60; m += 15) {
                        if (h === 21 && m > 0) break;
                        slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
                      }
                    }
                    return slots;
                  })().map(t => {
                    const isValid = isTimeValidForService(t, occupiedSlots);
                    const isSelected = formData.time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={!isValid}
                        onClick={() => isValid && setFormData({ ...formData, time: t })}
                        style={{
                          padding: '8px 5px',
                          fontSize: '12px',
                          border: `1px solid ${!isValid ? '#fecaca' : '#eee'}`,
                          borderRadius: '6px',
                          background: isSelected ? '#1a1a1a' : !isValid ? '#fef2f2' : '#fff',
                          color: isSelected ? '#fff' : !isValid ? '#ef4444' : '#1a1a1a',
                          cursor: !isValid ? 'not-allowed' : 'pointer',
                          textDecoration: !isValid ? 'line-through' : 'none',
                          opacity: !isValid ? 0.6 : 1,
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {formData.time && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#166534' }}>
              <span>🕐</span>
              <span><strong>{formData.time}</strong> → <strong>{calculateEndTime(formData.time)}</strong></span>
              {(formData.service || formData.variant) && (() => {
                const target = formData.variant || formData.service;
                const blocks = target?.blocks?.length > 0 ? target.blocks : [{ duration: 30, type: 'work' }];
                const total = blocks.reduce((sum, b) => sum + b.duration, 0);
                return <span style={{ color: '#4ade80', fontSize: '12px' }}>({total} min)</span>;
              })()}
            </div>
          )}

          <div className="form-divider" style={{ height: '1px', background: '#eee', margin: '30px 0' }}></div>

          {/* Recherche client existant */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="info-label">Bestaande klant zoeken</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="appointments-filter-input"
                style={{ width: '100%', height: '45px' }}
                placeholder="Zoek op naam, e-mail of telefoon..."
                value={clientSearch}
                onChange={e => {
                  setClientSearch(e.target.value);
                  if (!e.target.value) {
                    setFormData(prev => ({ ...prev, name: '', email: '', phone: '' }));
                  }
                }}
              />
              {searchingClients && (
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>
                  Zoeken...
                </span>
              )}
              {clientSuggestions.length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100,
                  listStyle: 'none', margin: '4px 0 0', padding: '4px 0', maxHeight: '220px', overflowY: 'auto'
                }}>
                  {clientSuggestions.map(c => (
                    <li
                      key={c._id}
                      onClick={() => selectClient(c)}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>{c.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{c.phone}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="info-label">Klant Naam</label>
              <input
                type="text"
                className="appointments-filter-input"
                style={{ width: '100%', height: '45px' }}
                placeholder="Naam van de klant"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="info-label">Telefoon</label>
              <input
                type="tel"
                className="appointments-filter-input"
                style={{ width: '100%', height: '45px' }}
                placeholder="Telefoonnummer"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="info-label">E-mail</label>
            <input
              type="email"
              className="appointments-filter-input"
              style={{ width: '100%', height: '45px' }}
              placeholder="e-mail adres"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="info-label">Opmerkingen</label>
            <textarea
              className="appointments-filter-input"
              style={{ width: '100%', minHeight: '80px', padding: '12px' }}
              placeholder="Eventuele opmerkingen..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={e => setSendEmail(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1a1a1a' }}
            />
            Stuur bevestigingsmail naar de klant
          </label>

          <button type="submit" className="action-button confirm" style={{ width: '100%', height: '50px', fontSize: '14px' }}>
            Afspraak Bevestigen & Toevoegen
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNewAppointment;
