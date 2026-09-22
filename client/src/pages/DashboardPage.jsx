import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings');
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="container" style={{ padding: '32px 0 60px' }}>
      <div className="button-row" style={{ marginBottom: 22 }}>
        <a className="primary-btn" href="/listings">Browse listings</a>
        <button className="danger-btn" onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h1>Dashboard</h1>
        <p className="muted">Welcome, {user?.username || 'guest'}.</p>
      </div>

      {loading ? (
        <div className="notice" style={{ marginTop: 20 }}>Loading bookings...</div>
      ) : (
        <div style={{ marginTop: 24 }}>
          {bookings.length === 0 ? (
            <div className="notice">No bookings yet.</div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="card" style={{ marginBottom: 12 }}>
                <h3>{booking.listing?.title || 'Listing'}</h3>
                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
                <p>
                  <strong>Dates:</strong> {new Date(booking.checkIn).toLocaleDateString()} to{' '}
                  {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total:</strong> ₹{booking.totalAmount}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
