import React, { useState, useEffect } from 'react';

const AdminStaff = ({ token, showToast }) => {
  const [staffList, setStaffList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    canDoAllServices: true,
    allowedServices: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, catRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories`)
      ]);
      const staffData = await staffRes.json();
      const catData = await catRes.json();
      if (staffData.success) setStaffList(staffData.data);
      if (catData.success) setCategories(catData.data);
    } catch (err) {
      console.error('Error fetching staff data:', err);
      showToast('Fout bij het laden van gegevens', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        role: staff.role,
        canDoAllServices: staff.canDoAllServices,
        allowedServices: staff.allowedServices || []
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: '',
        canDoAllServices: true,
        allowedServices: []
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleService = (serviceId) => {
    setFormData(prev => {
      const allowed = [...prev.allowedServices];
      const index = allowed.indexOf(serviceId);
      if (index > -1) {
        allowed.splice(index, 1);
      } else {
        allowed.push(serviceId);
      }
      return { ...prev, allowedServices: allowed };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingStaff 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff/${editingStaff._id}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff`;
    const method = editingStaff ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast(editingStaff ? 'Medewerker bijgewerkt' : 'Medewerker toegevoegd');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      showToast('Fout bij het opslaan', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Weet u zeker dat u deze medewerker wilt verwijderen?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Medewerker verwijderd');
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  const moveStaff = async (id, direction) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/staff/${id}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ direction })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCategory = (categoryServices) => {
    const serviceIds = categoryServices.map(s => s.id);
    const allSelected = serviceIds.every(id => formData.allowedServices.includes(id));

    setFormData(prev => {
      let allowed = [...prev.allowedServices];
      if (allSelected) {
        // Unselect all in this category
        allowed = allowed.filter(id => !serviceIds.includes(id));
      } else {
        // Select all in this category (without duplicates)
        const newIds = serviceIds.filter(id => !allowed.includes(id));
        allowed = [...allowed, ...newIds];
      }
      return { ...prev, allowedServices: allowed };
    });
  };

  return (
    <div className="admin-staff-container fade-in">
      <div className="admin-services-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="admin-card-title">Team Beheer</h2>
          <p className="admin-card-subtitle">Beheer uw medewerkers en hun toegewezen services.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Nieuwe Medewerker</button>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="staff-grid">
          {staffList.map((staff, idx) => (
            <div key={staff._id} className="admin-card staff-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{staff.name}</h3>
                  <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 12px' }}>{staff.role}</p>
                </div>
                <div className="reorder-btns">
                  <button className="reorder-btn" disabled={idx === 0} onClick={() => moveStaff(staff._id, 'up')}>▲</button>
                  <button className="reorder-btn" disabled={idx === staffList.length - 1} onClick={() => moveStaff(staff._id, 'down')}>▼</button>
                </div>
              </div>
              
              <div className="staff-status">
                <span className={`status-badge ${staff.canDoAllServices ? 'all' : 'limited'}`}>
                  {staff.canDoAllServices ? 'Alle services' : `${staff.allowedServices.length} specifieke services`}
                </span>
              </div>

              <div className="card-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button className="cat-btn edit" onClick={() => handleOpenModal(staff)}>Bewerken</button>
                <button className="cat-btn delete" onClick={() => handleDelete(staff._id)}>Verwijderen</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content staff-modal" onClick={e => e.stopPropagation()} style={{ width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{editingStaff ? 'Medewerker Bewerken' : 'Nieuwe Medewerker'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="info-label">Naam</label>
                <input 
                  type="text" 
                  className="appointments-filter-input" 
                  style={{ width: '100%' }} 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="info-label">Rol / Functie</label>
                <input 
                  type="text" 
                  className="appointments-filter-input" 
                  style={{ width: '100%' }} 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="switch-label">
                  <input 
                    type="checkbox" 
                    checked={formData.canDoAllServices} 
                    onChange={e => setFormData({...formData, canDoAllServices: e.target.checked})} 
                  />
                  <span className="switch-text">Kan alle services uitvoeren</span>
                </label>
              </div>

              {!formData.canDoAllServices && (
                <div className="allowed-services-picker">
                  <label className="info-label" style={{ display: 'block', marginBottom: '15px' }}>Toegestane Services</label>
                  {categories.map(cat => {
                    const isAllCatSelected = cat.services.every(s => formData.allowedServices.includes(s.id));
                    return (
                      <div key={cat.id} className="service-category-group" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>
                          <h4 style={{ fontSize: '13px', color: '#1a1a1a', margin: 0 }}>{cat.name}</h4>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: '#64748b' }}>
                            <input 
                              type="checkbox" 
                              checked={isAllCatSelected} 
                              onChange={() => handleToggleCategory(cat.services)}
                            />
                            Alles selecteren
                          </label>
                        </div>
                        <div className="services-checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                          {cat.services.map(srv => (
                            <label key={srv.id} className="service-checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={formData.allowedServices.includes(srv.id)} 
                                onChange={() => handleToggleService(srv.id)}
                              />
                              <span>{srv.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '30px' }}>
                <button type="button" className="modal-button cancel" onClick={() => setIsModalOpen(false)}>Annuleren</button>
                <button type="submit" className="action-button confirm">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
