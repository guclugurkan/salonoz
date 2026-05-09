import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

export default function AdminServices() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSrvModalOpen, setIsSrvModalOpen] = useState(false);
  
  const [currentCategory, setCurrentCategory] = useState({ name: '', subTitle: '', icon: '', img: '', order: 0 });
  const [currentService, setCurrentService] = useState({ 
    name: '', price: '', displayPrice: '', categoryId: '', blocks: [], variants: [] 
  });
  
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingSrvId, setEditingSrvId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async () => {
    const url = editingCatId 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories/${editingCatId}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories`;
    const method = editingCatId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentCategory)
      });
      if (res.ok) {
        setIsCatModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveCategory = async (id, direction) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ direction })
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const moveService = async (id, direction) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/services/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ direction })
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category and all its services?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveService = async () => {
    const url = editingSrvId 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/services/${editingSrvId}`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/services`;
    const method = editingSrvId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentService)
      });
      if (res.ok) {
        setIsSrvModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const addBlock = (type) => {
    setCurrentService(prev => ({
      ...prev,
      blocks: [...prev.blocks, { duration: 15, type }]
    }));
  };

  const updateBlockDuration = (index, duration) => {
    setCurrentService(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks[index].duration = parseInt(duration, 10);
      return { ...prev, blocks: newBlocks };
    });
  };

  const removeBlock = (index) => {
    setCurrentService(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index, 1);
      return { ...prev, blocks: newBlocks };
    });
  };

  // Variants handlers
  const addVariant = () => {
    setCurrentService(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { name: '', price: '', blocks: [{ duration: 30, type: 'work' }] }]
    }));
  };

  const updateVariant = (vIndex, field, value) => {
    setCurrentService(prev => {
      const newVariants = [...prev.variants];
      newVariants[vIndex][field] = value;
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariant = (vIndex) => {
    setCurrentService(prev => {
      const newVariants = [...prev.variants];
      newVariants.splice(vIndex, 1);
      return { ...prev, variants: newVariants };
    });
  };

  const addVariantBlock = (vIndex, type) => {
    setCurrentService(prev => {
      const newVariants = [...prev.variants];
      newVariants[vIndex].blocks.push({ duration: 15, type });
      return { ...prev, variants: newVariants };
    });
  };

  const updateVariantBlock = (vIndex, bIndex, duration) => {
    setCurrentService(prev => {
      const newVariants = [...prev.variants];
      newVariants[vIndex].blocks[bIndex].duration = parseInt(duration, 10);
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariantBlock = (vIndex, bIndex) => {
    setCurrentService(prev => {
      const newVariants = [...prev.variants];
      newVariants[vIndex].blocks.splice(bIndex, 1);
      return { ...prev, variants: newVariants };
    });
  };

  return (
    <div className="admin-services">
      <div className="admin-services-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="section-title">Service Beheer</h2>
          <p className="section-subtitle">Beheer categorieën, prijzen en bloktijden</p>
        </div>
        <button className="action-button confirm" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={() => {
          setEditingCatId(null);
          setCurrentCategory({ name: '', subTitle: '', icon: '', img: '', order: categories.length });
          setIsCatModalOpen(true);
        }}>+ Nieuwe Categorie</button>
      </div>

      {loading ? (
        <div className="state-container">
          <div className="loading-spinner"></div>
          <p>Laden...</p>
        </div>
      ) : (
        <div className="categories-list">
          {categories.map((cat, catIdx) => (
            <div key={cat.id} className="category-card">
              <div className="category-header">
                <div className="category-title-group">
                  <div className="reorder-btns">
                    <button className="reorder-btn" disabled={catIdx === 0} onClick={() => moveCategory(cat.id, 'up')}>▲</button>
                    <button className="reorder-btn" disabled={catIdx === categories.length - 1} onClick={() => moveCategory(cat.id, 'down')}>▼</button>
                  </div>
                  <span className="category-icon">{cat.icon}</span>
                  <h3 className="category-name">{cat.name}</h3>
                </div>
                <div className="category-actions">
                  <button className="cat-btn edit" onClick={() => {
                    setEditingCatId(cat.id);
                    setCurrentCategory(cat);
                    setIsCatModalOpen(true);
                  }}>Bewerken</button>
                  <button className="cat-btn delete" onClick={() => handleDeleteCategory(cat.id)}>Verwijderen</button>
                </div>
              </div>

              <div className="services-table-wrapper">
                <table className="services-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Detail Prijs (Reservering)</th>
                      <th>Display Prijs (Pricing Page)</th>
                      <th>Tijdsblokken / Varianten</th>
                      <th style={{ textAlign: 'right' }}>Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.services.map((srv, srvIdx) => (
                      <tr key={srv.id}>
                        <td className="service-name-cell">
                          <div className="reorder-btns">
                            <button className="reorder-btn" disabled={srvIdx === 0} onClick={() => moveService(srv.id, 'up')}>▲</button>
                            <button className="reorder-btn" disabled={srvIdx === cat.services.length - 1} onClick={() => moveService(srv.id, 'down')}>▼</button>
                          </div>
                          <span className="service-name">{srv.name}</span>
                        </td>
                        <td><span className="service-price">{srv.price}</span></td>
                        <td><span className="service-price" style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{srv.displayPrice || srv.price}</span></td>
                        <td>
                          {srv.variants && srv.variants.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Heeft {srv.variants.length} varianten</span>
                            </div>
                          ) : (
                            <div className="duration-blocks">
                              {srv.blocks.map((b, i) => (
                                <span key={i} className={`duration-block-tag ${b.type}`}>
                                  <span className="block-icon">{b.type === 'work' ? '✂️' : '☕'}</span>
                                  {b.duration}m
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="cat-btn edit" style={{ marginRight: '8px' }} onClick={() => {
                            setEditingSrvId(srv.id);
                            setCurrentService({ ...srv, variants: srv.variants || [] });
                            setIsSrvModalOpen(true);
                          }}>Bewerken</button>
                          <button className="cat-btn delete" onClick={() => handleDeleteService(srv.id)}>Verwijderen</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="add-service-btn" onClick={() => {
                setEditingSrvId(null);
                setCurrentService({ name: '', price: '', categoryId: cat.id, blocks: [], variants: [], order: cat.services.length });
                setIsSrvModalOpen(true);
              }}>
                <span>+</span> Service toevoegen aan {cat.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCatModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingCatId ? 'Categorie Bewerken' : 'Nieuwe Categorie'}</h3>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="appointments-filter-label">Naam</label>
              <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentCategory.name} onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="appointments-filter-label">Ondertitel (Subtitel)</label>
              <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentCategory.subTitle} onChange={e => setCurrentCategory({...currentCategory, subTitle: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="appointments-filter-label">Icoon (Emoji)</label>
              <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentCategory.icon} onChange={e => setCurrentCategory({...currentCategory, icon: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="appointments-filter-label">Afbeelding URL</label>
              <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentCategory.img} onChange={e => setCurrentCategory({...currentCategory, img: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={() => setIsCatModalOpen(false)}>Annuleren</button>
              <button className="action-button confirm" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={handleSaveCategory}>Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isSrvModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSrvModalOpen(false)}>
          <div className="modal-content" style={{ width: '650px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingSrvId ? 'Service Bewerken' : 'Nieuwe Service'}</h3>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="appointments-filter-label">Naam van de service</label>
              <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentService.name} onChange={e => setCurrentService({...currentService, name: e.target.value})} />
            </div>

            <div className="srv-modal-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="appointments-filter-label">Standaard Prijs (Indien geen varianten, of als fallback)</label>
                <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentService.price} onChange={e => setCurrentService({...currentService, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="appointments-filter-label">Display Prijs (Pricing Page - ex: vanaf 45€)</label>
                <input type="text" className="appointments-filter-input" style={{ width: '100%' }} value={currentService.displayPrice} onChange={e => setCurrentService({...currentService, displayPrice: e.target.value})} />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#1e293b' }}>Varianten (Optioneel)</h4>
                <button type="button" className="cat-btn edit" onClick={addVariant}>+ Variant toevoegen (Kort, Halflang...)</button>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Als je varianten toevoegt, zal de klant eerst een lengte/optie moeten kiezen. De standaard tijdsblokken en prijs worden dan genegeerd.</p>
            </div>

            {currentService.variants && currentService.variants.length > 0 ? (
              <div className="variants-editor">
                {currentService.variants.map((variant, vIndex) => (
                  <div key={vIndex} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h5 style={{ margin: 0 }}>Variant {vIndex + 1}</h5>
                      <button onClick={() => removeVariant(vIndex)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Verwijderen</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                      <div>
                        <label className="appointments-filter-label" style={{ fontSize: '12px' }}>Naam (ex: Kort)</label>
                        <input type="text" className="appointments-filter-input" style={{ width: '100%', padding: '6px' }} value={variant.name} onChange={e => updateVariant(vIndex, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label className="appointments-filter-label" style={{ fontSize: '12px' }}>Prijs (ex: 45 €)</label>
                        <input type="text" className="appointments-filter-input" style={{ width: '100%', padding: '6px' }} value={variant.price} onChange={e => updateVariant(vIndex, 'price', e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <label className="appointments-filter-label" style={{ fontSize: '12px' }}>Tijdsblokken voor deze variant:</label>
                      {variant.blocks.map((block, bIndex) => (
                        <div key={bIndex} className="srv-block-item" style={{ padding: '5px 10px', marginBottom: '5px' }}>
                          <span className={`block-type-badge ${block.type}`}>{block.type === 'work' ? 'Werk' : 'Pauze'}</span>
                          <select 
                            className="appointments-filter-select"
                            style={{ flex: 1, padding: '4px' }}
                            value={block.duration} 
                            onChange={e => updateVariantBlock(vIndex, bIndex, e.target.value)}
                          >
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">1 uur</option>
                            <option value="75">1u 15m</option>
                            <option value="90">1u 30m</option>
                            <option value="105">1u 45m</option>
                            <option value="120">2 uur</option>
                          </select>
                          <button onClick={() => removeVariantBlock(vIndex, bIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" className="cat-btn edit" style={{ flex: 1, background: '#f0fdf4', borderColor: '#dcfce7', color: '#166534', padding: '4px', fontSize: '12px' }} onClick={() => addVariantBlock(vIndex, 'work')}>+ Werkstap</button>
                        <button type="button" className="cat-btn edit" style={{ flex: 1, background: '#fffbeb', borderColor: '#fef3c7', color: '#92400e', padding: '4px', fontSize: '12px' }} onClick={() => addVariantBlock(vIndex, 'pause')}>+ Pauze</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="srv-block-editor" style={{ marginTop: '0' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: '#1e293b' }}>Standaard Stappen & Tijdsduur</label>
                {currentService.blocks.map((block, index) => (
                  <div key={index} className="srv-block-item">
                    <span className={`block-type-badge ${block.type}`}>{block.type === 'work' ? 'Werk' : 'Pauze'}</span>
                    <select 
                      className="appointments-filter-select"
                      style={{ flex: 1 }}
                      value={block.duration} 
                      onChange={e => updateBlockDuration(index, e.target.value)}
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 uur</option>
                      <option value="75">1u 15m</option>
                      <option value="90">1u 30m</option>
                      <option value="105">1u 45m</option>
                      <option value="120">2 uur</option>
                    </select>
                    <button onClick={() => removeBlock(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                  <button type="button" className="cat-btn edit" style={{ flex: 1, background: '#f0fdf4', borderColor: '#dcfce7', color: '#166534' }} onClick={() => addBlock('work')}>+ Werkstap</button>
                  <button type="button" className="cat-btn edit" style={{ flex: 1, background: '#fffbeb', borderColor: '#fef3c7', color: '#92400e' }} onClick={() => addBlock('pause')}>+ Pauze/Wachten</button>
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="modal-button cancel" onClick={() => setIsSrvModalOpen(false)}>Annuleren</button>
              <button className="action-button confirm" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={handleSaveService}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
