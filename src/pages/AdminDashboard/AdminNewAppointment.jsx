import React, { useState, useEffect } from 'react';

const AdminNewAppointment = ({ token, showToast, onAppointmentCreated }) => {
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const fetchData = async () => {
    try {
      const [catRes, staffRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff`)
      ]);
      const catData = await catRes.json();
      const staffData = await staffRes.json();
      
      if (catData.success) setCategories(catData.data);
      if (staffData.success) setStaff(staffData.data);
    } catch (err) {
      console.error(err);
      showToast('Fout bij het laden van gegevens', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service || !formData.staff || !formData.date || !formData.time) {
      showToast('Vul alle verplichte velden in', 'error');
      return;
    }

    const appointmentData = {
      service: formData.variant ? `${formData.service.name} (${formData.variant.name})` : formData.service.name,
      staff: formData.staff.name,
      date: formData.date,
      time: formData.time,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      status: 'confirmed' // Admin appointments are confirmed by default
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments`, {
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
        setFormData({
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
              {[
                '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45',
                '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45',
                '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
                '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45'
              ].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`time-slot ${formData.time === t ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, time: t })}
                  style={{ 
                    padding: '8px 5px', 
                    fontSize: '12px', 
                    border: '1px solid #eee', 
                    borderRadius: '6px',
                    background: formData.time === t ? '#1a1a1a' : '#fff',
                    color: formData.time === t ? '#fff' : '#1a1a1a',
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-divider" style={{ height: '1px', background: '#eee', margin: '30px 0' }}></div>

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
                required
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
                required
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

          <button type="submit" className="action-button confirm" style={{ width: '100%', height: '50px', fontSize: '14px' }}>
            Afspraak Bevestigen & Toevoegen
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNewAppointment;
