import React, { useState } from 'react';

const daysOfWeek = [
  { key: 'monday', label: 'Maandag' },
  { key: 'tuesday', label: 'Dinsdag' },
  { key: 'wednesday', label: 'Woensdag' },
  { key: 'thursday', label: 'Donderdag' },
  { key: 'friday', label: 'Vrijdag' },
  { key: 'saturday', label: 'Zaterdag' },
  { key: 'sunday', label: 'Zondag' },
];

const AdminSettings = ({ settings, onUpdate, isSaving }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [newClosedDate, setNewClosedDate] = useState('');

  const handleHourChange = (day, field, value) => {
    setLocalSettings({
      ...localSettings,
      workingHours: {
        ...localSettings.workingHours,
        [day]: {
          ...localSettings.workingHours[day],
          [field]: value
        }
      }
    });
  };

  const toggleClosed = (day) => {
    setLocalSettings({
      ...localSettings,
      workingHours: {
        ...localSettings.workingHours,
        [day]: {
          ...localSettings.workingHours[day],
          closed: !localSettings.workingHours[day].closed
        }
      }
    });
  };

  const addClosedDate = () => {
    if (newClosedDate && !localSettings.closedDays.includes(newClosedDate)) {
      setLocalSettings({
        ...localSettings,
        closedDays: [...localSettings.closedDays, newClosedDate].sort()
      });
      setNewClosedDate('');
    }
  };

  const removeClosedDate = (date) => {
    setLocalSettings({
      ...localSettings,
      closedDays: localSettings.closedDays.filter(d => d !== date)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(localSettings);
  };

  if (!localSettings) return <div>Laden...</div>;

  return (
    <div className="admin-settings-container fade-in">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Openingsuren Beheren</h2>
          <p className="admin-card-subtitle">Stel de dagelijkse werkuren van het salon in.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="settings-hours-list">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key} className={`settings-hour-row ${localSettings.workingHours[key].closed ? 'is-closed' : ''}`}>
                <div className="day-name">{label}</div>
                
                <div className="hour-inputs">
                  <div className="input-group">
                    <label>Open</label>
                    <input 
                      type="time" 
                      value={localSettings.workingHours[key].open}
                      onChange={(e) => handleHourChange(key, 'open', e.target.value)}
                      disabled={localSettings.workingHours[key].closed}
                    />
                  </div>
                  <div className="input-group">
                    <label>Sluit</label>
                    <input 
                      type="time" 
                      value={localSettings.workingHours[key].close}
                      onChange={(e) => handleHourChange(key, 'close', e.target.value)}
                      disabled={localSettings.workingHours[key].closed}
                    />
                  </div>
                </div>

                <div className="toggle-group">
                  <label className="switch-label">
                    <input 
                      type="checkbox" 
                      checked={localSettings.workingHours[key].closed}
                      onChange={() => toggleClosed(key)}
                    />
                    <span className="switch-text">{localSettings.workingHours[key].closed ? 'Gesloten' : 'Open'}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-card-divider" />

          <div className="admin-card-header" style={{ marginTop: '2rem' }}>
            <h2 className="admin-card-title">Uitzonderlijke Sluitingsdagen</h2>
            <p className="admin-card-subtitle">Voeg specifieke datums toe waarop het salon gesloten is (bijv. feestdagen, vakantie).</p>
          </div>

          <div className="closed-days-section">
            <div className="add-closed-day">
              <input 
                type="date" 
                value={newClosedDate}
                onChange={(e) => setNewClosedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <button type="button" className="btn-secondary" onClick={addClosedDate}>Toevoegen</button>
            </div>

            <div className="closed-days-tags">
              {localSettings.closedDays.length === 0 && <p className="no-data-text">Geen uitzonderlijke sluitingsdagen ingesteld.</p>}
              {localSettings.closedDays.map(date => (
                <div key={date} className="closed-day-tag">
                  <span>{new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <button type="button" onClick={() => removeClosedDate(date)}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-footer">
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Bezig met opslaan...' : 'Wijzigingen Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
