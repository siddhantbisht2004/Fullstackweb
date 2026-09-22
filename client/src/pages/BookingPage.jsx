import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { useNavigate, useParams } from 'react-router-dom';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/listings/${id}/book`, form);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container notice">Loading booking form...</div>;
  if (!listing) return <div className="container notice">Listing not found.</div>;

  return (
    <div className="container">
      <div className="form-wrap">
        <h1>Book: {listing.title}</h1>
        <p className="muted">{listing.location}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="checkIn">Check-in date</label>
            <input
              id="checkIn"
              type="date"
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkOut">Check-out date</label>
            <input
              id="checkOut"
              type="date"
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="guests">Guests</label>
            <input
              id="guests"
              type="number"
              min="1"
              max="10"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">Special requests</label>
            <textarea
              id="specialRequests"
              rows="4"
              value={form.specialRequests}
              onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
            />
          </div>

          <button className="primary-btn" type="submit" disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Submitting...' : 'Submit booking request'}
          </button>
        </form>
      </div>
    </div>
  );
}
