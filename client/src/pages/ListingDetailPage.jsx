import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="container notice">Loading listing...</div>;
  if (!listing) return <div className="container notice">Listing not found.</div>;

  return (
    <div className="container detail-page">
      <div className="button-row" style={{ marginBottom: 22 }}>
        <Link className="primary-btn" to="/listings">Back to listings</Link>
        <button className="secondary-btn" onClick={() => navigate(`/bookings/new/${id}`)}>
          Book this place
        </button>
      </div>

      <div className="detail-layout">
        <div className="image-box">
          <img
            src={listing.image?.url || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'}
            alt={listing.title}
          />
        </div>

        <aside className="meta-box">
          <span className="tag">₹{listing.price}</span>
          <h1 className="page-title">{listing.title}</h1>
          <p className="muted">{listing.location}</p>
          <p>{listing.description}</p>

          <ul className="listing-list">
            <li><strong>Country:</strong> {listing.country}</li>
            <li><strong>Features:</strong> {listing.features?.join(', ') || 'Not specified'}</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
