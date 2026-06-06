import { useState, useEffect } from 'react';

const AdminClients = ({ token, showToast }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch {
      showToast('Fout bij het laden van klanten', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const openEdit = (client) => {
    setEditingClient(client);
    setEditForm({ name: client.name, email: client.email, phone: client.phone, notes: client.notes || '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/clients/${editingClient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Client bijgewerkt');
        setClients(prev => prev.map(c => c._id === editingClient._id ? data.data : c));
        setEditingClient(null);
      } else {
        showToast(data.error || 'Fout bij opslaan', 'error');
      }
    } catch {
      showToast('Netwerkfout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!confirm(`Klant "${client.name}" verwijderen?`)) return;
    try {
      const res = await fetch(`${API}/api/clients/${client._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Client verwijderd');
        setClients(prev => prev.filter(c => c._id !== client._id));
      } else {
        showToast(data.error || 'Fout bij verwijderen', 'error');
      }
    } catch {
      showToast('Netwerkfout', 'error');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 className="admin-card-title">Klanten</h2>
            <p className="admin-card-subtitle">{clients.length} klant{clients.length !== 1 ? 'en' : ''} in de database</p>
          </div>
          <button className="action-button confirm" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={fetchClients}>
            Vernieuwen
          </button>
        </div>

        <input
          type="text"
          className="appointments-filter-input"
          placeholder="Zoeken op naam, e-mail of telefoon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', height: '42px', marginBottom: '20px' }}
        />

        {loading ? (
          <div className="loading-spinner" />
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
            {search ? 'Geen klanten gevonden.' : 'Nog geen klanten in de database.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={thStyle}>Naam</th>
                  <th style={thStyle}>E-mail</th>
                  <th style={thStyle}>Telefoon</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>RDV</th>
                  <th style={thStyle}>Klant sinds</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}><strong>{client.name}</strong></td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{client.email}</td>
                    <td style={tdStyle}>{client.phone}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        background: '#f0fdf4', color: '#166534',
                        borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {client.appointmentCount}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '13px' }}>{formatDate(client.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        className="cat-btn edit"
                        style={{ marginRight: '8px', padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => openEdit(client)}
                      >
                        Bewerken
                      </button>
                      <button
                        className="cat-btn delete"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => handleDelete(client)}
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal édition */}
      {editingClient && (
        <div style={modalOverlay} onClick={() => setEditingClient(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Client bewerken</h3>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="info-label">Naam</label>
              <input type="text" className="appointments-filter-input" style={{ width: '100%', height: '40px' }}
                value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="info-label">E-mail</label>
              <input type="email" className="appointments-filter-input" style={{ width: '100%', height: '40px' }}
                value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="info-label">Telefoon</label>
              <input type="tel" className="appointments-filter-input" style={{ width: '100%', height: '40px' }}
                value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="info-label">Notities</label>
              <textarea className="appointments-filter-input" style={{ width: '100%', minHeight: '70px', padding: '10px' }}
                value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="cat-btn edit" style={{ padding: '8px 18px' }} onClick={() => setEditingClient(null)}>
                Annuleren
              </button>
              <button className="action-button confirm" style={{ padding: '8px 18px', fontSize: '13px' }}
                onClick={handleSave} disabled={saving}>
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '12px 12px',
  verticalAlign: 'middle',
};

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};

const modalBox = {
  background: '#fff', borderRadius: '12px', padding: '28px',
  width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
};

export default AdminClients;
