import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const staffMembers = ['Oz', 'Sarah', 'Alex'];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30'
];

function getStartOfWeek(date) {
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  currentDate.setDate(currentDate.getDate() + diff);
  currentDate.setHours(0, 0, 0, 0);

  return currentDate;
}

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function formatWeekRange(startDate) {
  const endDate = addDays(startDate, 6);

  const startText = startDate.toLocaleDateString('nl-NL', {
    month: 'long',
    day: 'numeric',
  });

  const endText = endDate.toLocaleDateString('nl-NL', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `${startText} - ${endText}`;
}


function formatDateToYMD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isDateInCurrentWeek(dateString, weekStart) {
  const [year, month, day] = dateString.split('-').map(Number);
  const appointmentDate = new Date(year, month - 1, day);
  appointmentDate.setHours(0, 0, 0, 0);

  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);

  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);

  return appointmentDate >= start && appointmentDate <= end;
}

function AdminDashboard() {
  const { token, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('appointments'); // 'appointments', 'reviews', or 'gallery'

  // Gallery States
  const [images, setImages] = useState({ heren: [], dames: [] });
  const [imageLoading, setImageLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('heren');
  // Day selection for Mobile View
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  // Existing Appointment States
  const [rejectModal, setRejectModal] = useState({ isOpen: false, appointmentId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Oz');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [cardStaffFilter, setCardStaffFilter] = useState('all');
  const [cardStatusFilter, setCardStatusFilter] = useState('all');
  const [cardSearchTerm, setCardSearchTerm] = useState('');
  const [showOnlyCurrentWeek, setShowOnlyCurrentWeek] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', date: '', rating: 5, text: '' });

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const result = await response.json();
      setAppointments(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews`);
      const result = await response.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchImages = async () => {
    setImageLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/images`);
      const result = await response.json();
      if (result.success) {
        setImages(result.data);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedImageFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('category', uploadCategory);
    formData.append('image', selectedImageFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setSelectedImageFile(null);
        // Clear input file
        e.target.reset();
        await fetchImages();
      } else {
        alert(result.message || 'Uploaden mislukt');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Fout bij het uploaden van de afbeelding');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (src) => {
    if (!window.confirm('Weet u zeker dat u deze foto definitief wilt verwijderen?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ src })
      });

      const result = await response.json();
      if (result.success) {
        await fetchImages();
      } else {
        alert(result.message || 'Verwijderen mislukt');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Fout bij het verwijderen van de afbeelding');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newReview,
          date: newReview.date || new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
        })
      });
      const result = await response.json();
      if (result.success) {
        setReviews([result.data, ...reviews]);
        setNewReview({ name: '', date: '', rating: 5, text: '' });
      }
    } catch (err) {
      console.error('Error adding review:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Weet u zeker dat u deze beoordeling wilt verwijderen?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchReviews();
    fetchImages();
  }, []);

  const updateAppointmentStatus = async (id, newStatus, reason = null) => {
    if (newStatus === 'rejected' && !reason.trim()) {
      alert('Reden voor weigering is verplicht!');
      return;
    }

    try {
      const body = { status: newStatus };
      if (reason) {
        body.rejectionReason = reason;
      }

      console.log('Request Body:', body);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      await fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const openRejectModal = (appointmentId) => {
    setRejectModal({ isOpen: true, appointmentId });
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setRejectModal({ isOpen: false, appointmentId: null });
    setRejectionReason('');
  };

  const getAppointmentCountForDay = (dayDate) => {
    const dayKey = formatDateToYMD(dayDate);
    return filteredAppointments.filter(a => a.date === dayKey).length;
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Geef alsjeblieft een reden voor weigering op');
      return;
    }

    console.log('Rejection Reason:', rejectionReason);

    await updateAppointmentStatus(rejectModal.appointmentId, 'rejected', rejectionReason);
    closeRejectModal();
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const formatCreatedAt = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const weekLabel = useMemo(() => {
    return formatWeekRange(currentWeekStart);
  }, [currentWeekStart]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(currentWeekStart, index));
  }, [currentWeekStart]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStaff = appointment.staff === selectedStaff;
      const matchesWeek = isDateInCurrentWeek(appointment.date, currentWeekStart);
      const isVisibleInCalendar =
        appointment.status !== 'cancelled' && appointment.status !== 'rejected';

      return matchesStaff && matchesWeek && isVisibleInCalendar;
    });
  }, [appointments, selectedStaff, currentWeekStart]);

  const filteredCardAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStaff =
        cardStaffFilter === 'all' || appointment.staff === cardStaffFilter;

      const matchesStatus =
        cardStatusFilter === 'all' || appointment.status === cardStatusFilter;

      const matchesSearch =
        appointment.name?.toLowerCase().includes(cardSearchTerm.toLowerCase());

      const matchesWeek =
        !showOnlyCurrentWeek || isDateInCurrentWeek(appointment.date, currentWeekStart);

      return matchesStaff && matchesStatus && matchesSearch && matchesWeek;
    });
  }, [
    appointments,
    cardStaffFilter,
    cardStatusFilter,
    cardSearchTerm,
    showOnlyCurrentWeek,
    currentWeekStart,
  ]);


  const getAppointmentForCell = (dayDate, time) => {
    const dayKey = formatDateToYMD(dayDate);

    return filteredAppointments.find(
      (appointment) =>
        appointment.date === dayKey &&
        appointment.time === time
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-label">
          <span className="label-line"></span>
          <span className="label-text">Admin</span>
          <span className="label-line"></span>
        </div>
        <p className="header-subtitle">Bekijk en beheer SALON OZ activiteiten</p>

        <div className="admin-nav">
          <button
            className={`admin-nav-btn ${activeSection === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveSection('appointments')}
          >
            Afspraken
          </button>
          <button
            className={`admin-nav-btn ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            Klantbeoordelingen
          </button>
          <button
            className={`admin-nav-btn ${activeSection === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveSection('gallery')}
          >
            Gallerij
          </button>
          <button
            className="admin-nav-btn logout"
            onClick={logout}
          >
            Uitloggen
          </button>
        </div>
        {activeSection === 'appointments' && (
          <div className="calendar-toolbar">
            <div className="staff-filter">
              <label htmlFor="staff-select" className="staff-filter-label">
                Medewerker
              </label>
              <select
                id="staff-select"
                className="staff-filter-select"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
              >
                {staffMembers.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <div className="week-navigation">
              <button className="week-nav-button" onClick={goToPreviousWeek}>
                Vorige week
              </button>
              <span className="week-label">{weekLabel}</span>
              <button className="week-nav-button" onClick={goToNextWeek}>
                Volgende week
              </button>
            </div>
          </div>
        )}

        {activeSection === 'appointments' && (
          <button
            className="refresh-button"
            onClick={fetchAppointments}
            disabled={loading}
          >
            {loading ? 'Vernieuwen...' : 'Vernieuwen'}
          </button>
        )}
      </header>

      <main className="admin-content">

        {activeSection === 'appointments' && (
          <>
            {!loading && !error && (
              <section className="calendar-section">
                {/* Desktop Weekly Calendar (Hidden < 600px via CSS) */}
                <div className="desktop-calendar-view">
                  <div className="weekly-calendar-header">
                    <h2 className="weekly-calendar-title">Weekkalender</h2>
                    <p className="weekly-calendar-subtitle">
                      {selectedStaff} · {filteredAppointments.length} actieve afspraak/afspraken
                    </p>
                  </div>

                  <div className="weekly-calendar-grid-wrapper">
                    <div
                      className="weekly-calendar-grid"
                      style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)` }}
                    >
                      <div className="calendar-cell calendar-time-header">Tijd</div>
                      {weekDays.map((day) => (
                        <div key={formatDateToYMD(day)} className="calendar-cell calendar-day-header">
                          <span className="calendar-day-name">{day.toLocaleDateString('nl-NL', { weekday: 'short' })}</span>
                          <span className="calendar-day-date">{day.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      ))}

                      {timeSlots.map((time) => (
                        <div key={`row-${time}`} className="calendar-row-wrapper">
                          <div className="calendar-cell calendar-time-cell">{time}</div>
                          {weekDays.map((day) => {
                            const appointment = getAppointmentForCell(day, time);
                            return (
                              <div key={`${formatDateToYMD(day)}-${time}`} className="calendar-cell calendar-slot-cell">
                                {appointment ? (
                                  <div className={`calendar-appointment status-${appointment.status || 'pending'}`}>
                                    <span className="calendar-appointment-client">{appointment.name}</span>
                                    <span className="calendar-appointment-service">{appointment.service}</span>
                                    <span className="calendar-appointment-status">
                                      {appointment.status === 'pending' ? 'In afwachting' :
                                       appointment.status === 'confirmed' ? 'Bevestigd' :
                                       appointment.status === 'rejected' ? 'Geweigerd' :
                                       appointment.status === 'cancelled' ? 'Geannuleerd' : appointment.status}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="calendar-slot-empty">—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Daily Calendar (Hidden > 600px via CSS) */}
                <div className="mobile-calendar-view">
                  <div className="mobile-day-tabs">
                    {weekDays.map((day, index) => (
                      <button
                        key={`day-tab-${index}`}
                        className={`day-tab ${selectedDayIndex === index ? 'active' : ''}`}
                        onClick={() => setSelectedDayIndex(index)}
                      >
                        <span className="tab-name">{day.toLocaleDateString('nl-NL', { weekday: 'short' }).charAt(0)}</span>
                        <span className="tab-date">{day.getDate()}</span>
                      </button>
                    ))}
                  </div>

                  <div className="daily-schedule">
                    <div className="daily-schedule-info">
                      <h3>{weekDays[selectedDayIndex].toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                      <p>{getAppointmentCountForDay(weekDays[selectedDayIndex])} afspraak/afspraken</p>
                    </div>
                    
                    <div className="timeline">
                      {timeSlots.map((time) => {
                        const appointment = getAppointmentForCell(weekDays[selectedDayIndex], time);
                        return (
                          <div key={`timeline-${time}`} className="timeline-slot">
                            <div className="slot-time">{time}</div>
                            <div className="slot-content">
                              {appointment ? (
                                <div className={`mini-card status-${appointment.status}`}>
                                  <div className="mini-card-header">
                                    <span className="mini-card-client">{appointment.name}</span>
                                    <span className="mini-card-status">
                                      {appointment.status === 'pending' ? 'In afwachting' :
                                       appointment.status === 'confirmed' ? 'Bevestigd' :
                                       appointment.status === 'rejected' ? 'Geweigerd' :
                                       appointment.status === 'cancelled' ? 'Geannuleerd' : appointment.status}
                                    </span>
                                  </div>
                                  <div className="mini-card-service">{appointment.service}</div>
                                </div>
                              ) : (
                                <div className="slot-empty">Beschikbaar</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {loading && (
              <div className="state-container">
                <div className="loading-spinner"></div>
                <p className="state-text">Afspraken laden...</p>
              </div>
            )}

            {error && !loading && (
              <div className="state-container error">
                <p className="state-title">Afspraken laden mislukt</p>
                <p className="state-text">{error}</p>
                <button className="retry-button" onClick={fetchAppointments}>
                  Opnieuw proberen
                </button>
              </div>
            )}

            {!loading && !error && appointments.length > 0 && (
              <section className="appointments-filters">
                <div className="appointments-filters-header">
                  <h2 className="appointments-filters-title">Afspraakfilters</h2>
                  <p className="appointments-filters-subtitle">
                    {filteredCardAppointments.length} result(aat/aten)
                  </p>
                </div>

                <div className="appointments-filters-grid">
                  <div className="appointments-filter-group">
                    <label htmlFor="card-staff-filter" className="appointments-filter-label">
                      Medewerker
                    </label>
                    <select
                      id="card-staff-filter"
                      className="appointments-filter-select"
                      value={cardStaffFilter}
                      onChange={(e) => setCardStaffFilter(e.target.value)}
                    >
                      <option value="all">Alle medewerkers</option>
                      {staffMembers.map((staff) => (
                        <option key={staff} value={staff}>
                          {staff}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="appointments-filter-group">
                    <label htmlFor="card-status-filter" className="appointments-filter-label">
                      Status
                    </label>
                    <select
                      id="card-status-filter"
                      className="appointments-filter-select"
                      value={cardStatusFilter}
                      onChange={(e) => setCardStatusFilter(e.target.value)}
                    >
                      <option value="all">Alle statussen</option>
                      <option value="pending">In afwachting</option>
                      <option value="confirmed">Bevestigd</option>
                      <option value="cancelled">Geannuleerd</option>
                      <option value="rejected">Geweigerd</option>
                    </select>
                  </div>

                  <div className="appointments-filter-group">
                    <label htmlFor="card-search-filter" className="appointments-filter-label">
                      Zoek Klant
                    </label>
                    <input
                      id="card-search-filter"
                      type="text"
                      className="appointments-filter-input"
                      placeholder="Zoeken op naam..."
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="appointments-filter-group appointments-filter-checkbox-group">
                    <label className="appointments-filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={showOnlyCurrentWeek}
                        onChange={(e) => setShowOnlyCurrentWeek(e.target.checked)}
                      />
                      <span>Alleen huidige week</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {!loading && !error && appointments.length > 0 && filteredCardAppointments.length === 0 && (
              <div className="state-container">
                <p className="state-title">Geen overeenkomende afspraken</p>
                <p className="state-text">
                  Probeer uw filters te wijzigen om meer resultaten te zien.
                </p>
              </div>
            )}

            {!loading && !error && appointments.length === 0 && (
              <div className="state-container">
                <p className="state-title">Nog geen afspraken</p>
                <p className="state-text">
                  Wanneer klanten afspraken boeken, verschijnen deze hier.
                </p>
              </div>
            )}

            {!loading && !error && filteredCardAppointments.length > 0 && (
              <div className="appointments-grid">
                {filteredCardAppointments.map((appointment) => (
                  <article key={appointment.id} className="appointment-card">
                    <div className="card-header">
                      <div className="card-header-top">
                        <div className="card-header-left">
                          <h2 className="client-name">{appointment.name}</h2>
                          <span className={`status-badge status-${appointment.status || 'pending'}`}>
                            {appointment.status || 'pending'}
                          </span>
                        </div>
                        <span className="appointment-id-tech">#{appointment.id}</span>
                      </div>

                      {appointment.status === 'pending' && (
                        <div className="card-actions-top">
                          <button
                            className="action-button confirm"
                            onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                          >
                            Bevestigen
                          </button>
                          <button
                            className="action-button reject"
                            onClick={() => setRejectModal({ isOpen: true, appointmentId: appointment.id })}
                          >
                            Weigeren
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="card-divider"></div>

                    <div className="card-body">
                      {/* ... reste du contenu ... */}
                      <div className="info-row">
                        <span className="info-label">Dienst</span>
                        <span className="info-value">{appointment.service}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Medewerker</span>
                        <span className="info-value">{appointment.staff}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Datum</span>
                        <span className="info-value">{formatDate(appointment.date)}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Tijd</span>
                        <span className="info-value">{appointment.time}</span>
                      </div>

                      <div className="card-divider subtle"></div>

                      <div className="info-row">
                        <span className="info-label">E-mail</span>
                        <span className="info-value">{appointment.email}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Telefoon</span>
                        <span className="info-value">{appointment.phone}</span>
                      </div>

                      {appointment.notes && (
                        <>
                          <div className="card-divider subtle"></div>
                          <div className="info-row notes">
                            <span className="info-label">Notities</span>
                            <span className="info-value">{appointment.notes}</span>
                          </div>
                        </>
                      )}

                      {appointment.status === 'rejected' && appointment.rejectionReason && (
                        <>
                          <div className="card-divider subtle"></div>
                          <div className="info-row notes rejection">
                            <span className="info-label">Reden van weigering</span>
                            <span className="info-value">{appointment.rejectionReason}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="card-footer">
                      <span className="created-at">
                        Geboekt op {formatCreatedAt(appointment.createdAt)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* REVIEWS SECTION */}
        {activeSection === 'reviews' && (
          <section className="admin-reviews-manager">
            <div className="reviews-manager-header">
              <h2 className="section-title">Klantbeoordelingen Beheren</h2>
              <p className="section-subtitle">Beoordelingen toevoegen of verwijderen op de website</p>
            </div>

            <form className="add-review-form" onSubmit={handleReviewSubmit}>
              <h3>Nieuwe Beoordeling Toevoegen</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Klantnaam</label>
                  <input
                    type="text"
                    placeholder="bijv. Sarah M."
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Datum</label>
                  <input
                    type="text"
                    placeholder="bijv. 12 Mrt 2026"
                    value={newReview.date}
                    onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Beoordeling (1-5)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Sterren</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Beoordelingstekst</label>
                <textarea
                  rows="3"
                  placeholder="Wat zei de klant?"
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-review-btn">Beoordeling Toevoegen</button>
            </form>

            <div className="admin-reviews-list">
              <h3>Bestaande Beoordelingen ({reviews.length})</h3>
              <div className="admin-reviews-grid">
                {reviews.map(review => (
                  <div key={review.id} className="admin-review-card">
                    <div className="admin-review-header">
                      <span className="admin-review-author">{review.name}</span>
                      <span className="admin-review-rating">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="admin-review-text">"{review.text}"</p>
                    <div className="admin-review-footer">
                      <span className="admin-review-date">{review.date}</span>
                      <button
                        className="delete-review-btn"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* GALLERY SECTION */}
        {activeSection === 'gallery' && (
          <section className="admin-gallery-manager">
            <div className="section-header">
              <h2 className="section-title">Gallerij Afbeeldingen Beheren</h2>
              <p className="section-subtitle">Foto's toevoegen of verwijderen van uw website</p>
            </div>

            <div className="gallery-upload-card">
              <h3>Nieuwe Foto Uploaden</h3>
              <form className="upload-form" onSubmit={handleImageUpload}>
                <div className="upload-grid">
                  <div className="form-group">
                    <label>Categorie</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <option value="heren">Heren</option>
                      <option value="dames">Dames</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Afbeeldingsbestand</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImageFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="upload-button" disabled={uploading || !selectedImageFile}>
                  {uploading ? 'Uploaden...' : 'Toevoegen aan Gallerij'}
                </button>
              </form>
            </div>

            {imageLoading ? (
              <div className="state-container">
                <div className="loading-spinner"></div>
                <p>Gallerij laden...</p>
              </div>
            ) : (
              <div className="admin-gallery-list">
                {['heren', 'dames'].map(cat => (
                  <div key={cat} className="category-section">
                    <h3 className="category-title">{cat === 'heren' ? 'Heren' : 'Dames'}</h3>
                    <div className="gallery-admin-grid">
                      {images[cat] && images[cat].length > 0 ? (
                        images[cat].map(img => (
                          <div key={img.src} className="admin-image-card">
                            <div className="image-wrapper">
                              <img src={img.src} alt={img.alt} />
                              <button
                                className="delete-image-overlay"
                                onClick={() => handleDeleteImage(img.src)}
                                title="Verwijderen"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="empty-category">Geen afbeeldingen in deze categorie.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {rejectModal.isOpen && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Afspraak Weigeren</h3>
            <p className="modal-subtitle">Geef een reden voor weigering op</p>

            <textarea
              className="modal-textarea"
              placeholder="Voer de reden voor weigering in..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />

            <div className="modal-actions">
              <button className="modal-button cancel" onClick={closeRejectModal}>
                Annuleren
              </button>
              <button
                className="modal-button submit"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
              >
                Weigeren Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;