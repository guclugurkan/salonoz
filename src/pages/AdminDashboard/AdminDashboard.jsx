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

  const startText = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const endText = endDate.toLocaleDateString('en-US', {
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
        alert(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (src) => {
    if (!window.confirm('Verwijder cette photo définitivement ?')) return;

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
        alert(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Error deleting image');
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
          date: newReview.date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
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
    if (!window.confirm('Verwijder deze beoordeling?')) return;
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
      alert('Rejection reason is required!');
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

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    console.log('Rejection Reason:', rejectionReason);

    await updateAppointmentStatus(rejectModal.appointmentId, 'rejected', rejectionReason);
    closeRejectModal();
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCreatedAt = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
        <p className="header-subtitle">View and manage SALON OZ activity</p>

        <div className="admin-nav">
          <button
            className={`admin-nav-btn ${activeSection === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveSection('appointments')}
          >
            Appointments
          </button>
          <button
            className={`admin-nav-btn ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            Customer Reviews
          </button>
          <button
            className={`admin-nav-btn ${activeSection === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveSection('gallery')}
          >
            Gallery
          </button>
          <button
            className="admin-nav-btn logout"
            onClick={logout}
          >
            Déconnexion
          </button>
        </div>
        {activeSection === 'appointments' && (
          <div className="calendar-toolbar">
            <div className="staff-filter">
              <label htmlFor="staff-select" className="staff-filter-label">
                Employee
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
                Previous week
              </button>
              <span className="week-label">{weekLabel}</span>
              <button className="week-nav-button" onClick={goToNextWeek}>
                Next week
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
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </header>

      <main className="admin-content">

        {activeSection === 'appointments' && (
          <>
            {!loading && !error && (
              <section className="weekly-calendar">
                <div className="weekly-calendar-header">
                  <h2 className="weekly-calendar-title">Weekly Calendar</h2>
                  <p className="weekly-calendar-subtitle">
                    {selectedStaff} · {filteredAppointments.length} active appointment(s) this week
                  </p>
                </div>

                <div className="weekly-calendar-grid-wrapper">
                  <div
                    className="weekly-calendar-grid"
                    style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)` }}
                  >
                    <div className="calendar-cell calendar-time-header">Time</div>

                    {weekDays.map((day, index) => (
                      <div
                        key={formatDateToYMD(day)}
                        className={`calendar-cell calendar-day-header ${selectedDayIndex === index ? 'mobile-active-day' : 'mobile-hidden-day'}`}
                      >
                        <span className="calendar-day-name">
                          {day.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className="calendar-day-date">
                          {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}

                    {timeSlots.map((time) => (
                      <div key={`row-${time}`} className="calendar-row-wrapper">
                        <div key={`time-${time}`} className="calendar-cell calendar-time-cell">
                          {time}
                        </div>

                        {weekDays.map((day, index) => {
                          const appointment = getAppointmentForCell(day, time);

                          return (
                            <div
                              key={`${formatDateToYMD(day)}-${time}`}
                              className={`calendar-cell calendar-slot-cell ${selectedDayIndex === index ? 'mobile-active-day' : 'mobile-hidden-day'}`}
                            >
                              {appointment ? (
                                <div className={`calendar-appointment status-${appointment.status || 'pending'}`}>
                                  <span className="calendar-appointment-client">
                                    {appointment.name}
                                  </span>
                                  <span className="calendar-appointment-service">
                                    {appointment.service}
                                  </span>
                                  <span className="calendar-appointment-status">
                                    {appointment.status}
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

                {/* Day selector for Mobile View */}
                <div className="mobile-day-selector">
                  {weekDays.map((day, index) => (
                    <button
                      key={`select-${index}`}
                      className={`day-select-btn ${selectedDayIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedDayIndex(index)}
                    >
                      <span className="day-initial">{day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                      <span className="day-number">{day.getDate()}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {loading && (
              <div className="state-container">
                <div className="loading-spinner"></div>
                <p className="state-text">Loading appointments...</p>
              </div>
            )}

            {error && !loading && (
              <div className="state-container error">
                <p className="state-title">Unable to load appointments</p>
                <p className="state-text">{error}</p>
                <button className="retry-button" onClick={fetchAppointments}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && appointments.length > 0 && (
              <section className="appointments-filters">
                <div className="appointments-filters-header">
                  <h2 className="appointments-filters-title">Appointment Filters</h2>
                  <p className="appointments-filters-subtitle">
                    {filteredCardAppointments.length} result(s)
                  </p>
                </div>

                <div className="appointments-filters-grid">
                  <div className="appointments-filter-group">
                    <label htmlFor="card-staff-filter" className="appointments-filter-label">
                      Employee
                    </label>
                    <select
                      id="card-staff-filter"
                      className="appointments-filter-select"
                      value={cardStaffFilter}
                      onChange={(e) => setCardStaffFilter(e.target.value)}
                    >
                      <option value="all">All employees</option>
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
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="appointments-filter-group">
                    <label htmlFor="card-search-filter" className="appointments-filter-label">
                      Search Client
                    </label>
                    <input
                      id="card-search-filter"
                      type="text"
                      className="appointments-filter-input"
                      placeholder="Search by name..."
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
                      <span>Current week only</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {!loading && !error && appointments.length > 0 && filteredCardAppointments.length === 0 && (
              <div className="state-container">
                <p className="state-title">No matching appointments</p>
                <p className="state-text">
                  Try changing your filters to see more results.
                </p>
              </div>
            )}

            {!loading && !error && appointments.length === 0 && (
              <div className="state-container">
                <p className="state-title">No appointments yet</p>
                <p className="state-text">
                  When clients book appointments, they will appear here.
                </p>
              </div>
            )}

            {!loading && !error && filteredCardAppointments.length > 0 && (
              <div className="appointments-grid">
                {filteredCardAppointments.map((appointment) => (
                  <article key={appointment.id} className="appointment-card">
                    <div className="card-header">
                      <div className="card-header-left">
                        <h2 className="client-name">{appointment.name}</h2>
                        <span className={`status-badge status-${appointment.status || 'pending'}`}>
                          {appointment.status || 'pending'}
                        </span>
                      </div>
                      <span className="appointment-id">#{appointment.id}</span>
                    </div>

                    <div className="card-divider"></div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Service</span>
                        <span className="info-value">{appointment.service}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Stylist</span>
                        <span className="info-value">{appointment.staff}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Date</span>
                        <span className="info-value">{formatDate(appointment.date)}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Time</span>
                        <span className="info-value">{appointment.time}</span>
                      </div>

                      <div className="card-divider subtle"></div>

                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">{appointment.email}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Phone</span>
                        <span className="info-value">{appointment.phone}</span>
                      </div>

                      {appointment.notes && (
                        <>
                          <div className="card-divider subtle"></div>
                          <div className="info-row notes">
                            <span className="info-label">Notes</span>
                            <span className="info-value">{appointment.notes}</span>
                          </div>
                        </>
                      )}

                      {appointment.status === 'rejected' && appointment.rejectionReason && (
                        <>
                          <div className="card-divider subtle"></div>
                          <div className="info-row notes rejection">
                            <span className="info-label">Rejection Reason</span>
                            <span className="info-value">{appointment.rejectionReason}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="card-footer">
                      <span className="created-at">
                        Booked on {formatCreatedAt(appointment.createdAt)}
                      </span>

                      <div className="card-actions">
                        {(appointment.status === 'pending' || !appointment.status) && (
                          <>
                            <button
                              className="action-button confirm"
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            >
                              Confirm
                            </button>
                            <button
                              className="action-button reject"
                              onClick={() => openRejectModal(appointment.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            className="action-button cancel"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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
              <h2 className="section-title">Manage Customer Reviews</h2>
              <p className="section-subtitle">Add or remove reviews displayed on the website</p>
            </div>

            <form className="add-review-form" onSubmit={handleReviewSubmit}>
              <h3>Add New Review</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah M."
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Mar 2026"
                    value={newReview.date}
                    onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Review Text</label>
                <textarea
                  rows="3"
                  placeholder="What did the client say?"
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-review-btn">Add Review</button>
            </form>

            <div className="admin-reviews-list">
              <h3>Existing Reviews ({reviews.length})</h3>
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
                        Delete
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
              <h2 className="section-title">Manage Gallery Images</h2>
              <p className="section-subtitle">Add or remove photos from your website showcase</p>
            </div>

            <div className="gallery-upload-card">
              <h3>Upload New Photo</h3>
              <form className="upload-form" onSubmit={handleImageUpload}>
                <div className="upload-grid">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <option value="heren">Men (Heren)</option>
                      <option value="dames">Women (Dames)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImageFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="upload-button" disabled={uploading || !selectedImageFile}>
                  {uploading ? 'Uploading...' : 'Add to Gallery'}
                </button>
              </form>
            </div>

            {imageLoading ? (
              <div className="state-container">
                <div className="loading-spinner"></div>
                <p>Loading gallery...</p>
              </div>
            ) : (
              <div className="admin-gallery-list">
                {['heren', 'dames'].map(cat => (
                  <div key={cat} className="category-section">
                    <h3 className="category-title">{cat === 'heren' ? 'Men (Heren)' : 'Women (Dames)'}</h3>
                    <div className="gallery-admin-grid">
                      {images[cat] && images[cat].length > 0 ? (
                        images[cat].map(img => (
                          <div key={img.src} className="admin-image-card">
                            <div className="image-wrapper">
                              <img src={img.src} alt={img.alt} />
                              <button
                                className="delete-image-overlay"
                                onClick={() => handleDeleteImage(img.src)}
                                title="Supprimer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="empty-category">No images in this category.</p>
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
            <h3 className="modal-title">Reject Appointment</h3>
            <p className="modal-subtitle">Please provide a reason for rejection</p>

            <textarea
              className="modal-textarea"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />

            <div className="modal-actions">
              <button className="modal-button cancel" onClick={closeRejectModal}>
                Cancel
              </button>
              <button
                className="modal-button submit"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
              >
                Reject Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;