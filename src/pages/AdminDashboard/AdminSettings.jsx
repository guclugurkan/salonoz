import React, { useState, useEffect } from 'react';

const daysOfWeek = [
  { key: 'monday', label: 'Maandag' },
  { key: 'tuesday', label: 'Dinsdag' },
  { key: 'wednesday', label: 'Woensdag' },
  { key: 'thursday', label: 'Donderdag' },
  { key: 'friday', label: 'Vrijdag' },
  { key: 'saturday', label: 'Zaterdag' },
  { key: 'sunday', label: 'Zondag' },
];

function buildDateRange(start, end) {
  const dates = [];
  let current = new Date(start + 'T00:00:00');
  const endDate = new Date((end || start) + 'T00:00:00');
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

const AdminSettings = ({ settings, onUpdate, isSaving }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  // Salon closed days
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Staff vacation
  const [staffList, setStaffList] = useState([]);
  const [vacStaff, setVacStaff] = useState('');
  const [vacStart, setVacStart] = useState('');
  const [vacEnd, setVacEnd] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff`)
      .then(r => r.json())
      .then(d => setStaffList(d.data || []))
      .catch(() => {});
  }, []);

  const handleHourChange = (day, field, value) => {
    setLocalSettings({
      ...localSettings,
      workingHours: {
        ...localSettings.workingHours,
        [day]: { ...localSettings.workingHours[day], [field]: value }
      }
    });
  };

  const toggleClosed = (day) => {
    setLocalSettings({
      ...localSettings,
      workingHours: {
        ...localSettings.workingHours,
        [day]: { ...localSettings.workingHours[day], closed: !localSettings.workingHours[day].closed }
      }
    });
  };

  // --- Salon closed days ---
  const addClosedRange = () => {
    if (!rangeStart) return;
    const newDates = buildDateRange(rangeStart, rangeEnd).filter(
      d => !(localSettings.closedDays || []).includes(d)
    );
    if (newDates.length === 0) return;
    const newClosedDays = [...(localSettings.closedDays || []), ...newDates].sort();
    // Strip any dateOverrides that conflict with the newly closed dates
    const filteredOverrides = (localSettings.dateOverrides || []).filter(
      o => !newDates.includes(o.date)
    );
    setLocalSettings({
      ...localSettings,
      closedDays: newClosedDays,
      dateOverrides: filteredOverrides,
    });
    setRangeStart('');
    setRangeEnd('');
  };

  const removeClosedDate = (date) => {
    setLocalSettings({
      ...localSettings,
      closedDays: localSettings.closedDays.filter(d => d !== date)
    });
  };

  // --- Staff vacations ---
  const addStaffVacation = () => {
    if (!vacStaff || !vacStart) return;
    const member = staffList.find(s => s._id === vacStaff);
    if (!member) return;

    const newDates = buildDateRange(vacStart, vacEnd);
    const existing = (localSettings.staffVacations || []).find(v => v.staffId === vacStaff);
    let updatedVacations;

    if (existing) {
      const merged = [...new Set([...existing.dates, ...newDates])].sort();
      updatedVacations = (localSettings.staffVacations || []).map(v =>
        v.staffId === vacStaff ? { ...v, dates: merged } : v
      );
    } else {
      updatedVacations = [
        ...(localSettings.staffVacations || []),
        { staffId: vacStaff, staffName: member.name, dates: newDates.sort() }
      ];
    }

    setLocalSettings({ ...localSettings, staffVacations: updatedVacations });
    setVacStaff('');
    setVacStart('');
    setVacEnd('');
  };

  const removeStaffVacationDate = (staffId, date) => {
    const updatedVacations = (localSettings.staffVacations || [])
      .map(v => v.staffId === staffId ? { ...v, dates: v.dates.filter(d => d !== date) } : v)
      .filter(v => v.dates.length > 0);
    setLocalSettings({ ...localSettings, staffVacations: updatedVacations });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(localSettings);
  };

  if (!localSettings) return <div>Laden...</div>;

  const today = new Date().toISOString().split('T')[0];

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

          {/* === SALON CLOSED DAYS === */}
          <div className="admin-card-header" style={{ marginTop: '2rem' }}>
            <h2 className="admin-card-title">Uitzonderlijke Sluitingsdagen</h2>
            <p className="admin-card-subtitle">Voeg datums toe waarop het salon volledig gesloten is. Je kunt een enkele dag of een periode selecteren.</p>
          </div>

          <div className="closed-days-section">
            <div className="add-closed-day add-closed-day--range">
              <div className="date-range-inputs">
                <div className="input-group">
                  <label>Van</label>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    min={today}
                  />
                </div>
                <div className="input-group">
                  <label>Tot (optioneel)</label>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    min={rangeStart || today}
                  />
                </div>
              </div>
              <button type="button" className="btn-secondary" onClick={addClosedRange}>
                Toevoegen
              </button>
            </div>

            <div className="closed-days-tags">
              {(localSettings.closedDays || []).length === 0 && (
                <p className="no-data-text">Geen uitzonderlijke sluitingsdagen ingesteld.</p>
              )}
              {(localSettings.closedDays || []).map(date => (
                <div key={date} className="closed-day-tag">
                  <span>{formatDate(date)}</span>
                  <button type="button" onClick={() => removeClosedDate(date)}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card-divider" />

          {/* === STAFF VACATIONS === */}
          <div className="admin-card-header" style={{ marginTop: '2rem' }}>
            <h2 className="admin-card-title">Verlof per Medewerker</h2>
            <p className="admin-card-subtitle">Markeer een medewerker als afwezig op specifieke datums. Het salon blijft open maar die medewerker is niet beschikbaar.</p>
          </div>

          <div className="closed-days-section">
            <div className="add-closed-day add-closed-day--range">
              <div className="date-range-inputs" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div className="input-group">
                  <label>Medewerker</label>
                  <select
                    value={vacStaff}
                    onChange={(e) => setVacStaff(e.target.value)}
                    className="settings-select"
                  >
                    <option value="">Kies medewerker…</option>
                    {staffList.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Van</label>
                  <input
                    type="date"
                    value={vacStart}
                    onChange={(e) => setVacStart(e.target.value)}
                    min={today}
                  />
                </div>
                <div className="input-group">
                  <label>Tot (optioneel)</label>
                  <input
                    type="date"
                    value={vacEnd}
                    onChange={(e) => setVacEnd(e.target.value)}
                    min={vacStart || today}
                  />
                </div>
              </div>
              <button type="button" className="btn-secondary" onClick={addStaffVacation}>
                Toevoegen
              </button>
            </div>

            {(localSettings.staffVacations || []).length === 0 && (
              <p className="no-data-text">Geen verlof ingesteld per medewerker.</p>
            )}

            {(localSettings.staffVacations || []).map(vac => (
              <div key={vac.staffId} className="staff-vacation-group">
                <div className="staff-vacation-name">{vac.staffName}</div>
                <div className="closed-days-tags" style={{ marginTop: '0.5rem' }}>
                  {vac.dates.map(date => (
                    <div key={date} className="closed-day-tag closed-day-tag--staff">
                      <span>{formatDate(date)}</span>
                      <button type="button" onClick={() => removeStaffVacationDate(vac.staffId, date)}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
