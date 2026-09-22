import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await api.get('/listings');
        setListings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div className="container notice">Loading listings...</div>;

  return (
    <div className="container" style={{ padding: '32px 0 60px' }}>
      <div className="button-row" style={{ marginBottom: 22 }}>
        <Link className="primary-btn" to="/">Back home</Link>
      </div>

      <h1 className="page-title">Available listings</h1>

      <div className="listings-grid">
        {listings.map((listing) => (
          <article key={listing._id} className="listing-card">
            <img
              src={listing.image?.url || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'}
              alt={listing.title}
            />
            <div className="listing-card-content">
              <div className="listing-card-header">
                <h3>{listing.title}</h3>
                <span className="tag">₹{listing.price}</span>
              </div>
              <p className="muted">{listing.location}</p>
              <p>{listing.description?.slice(0, 100)}...</p>
              <Link className="secondary-btn" to={`/listings/${listing._id}`}>
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
