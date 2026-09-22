import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="brand">ApnaGhar</div>
          <div className="nav-links">
            <Link to="/listings">Listings</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </nav>

      <main className="container hero">
        <section className="hero-card">
          <h1>Find a place that feels like home.</h1>
          <p>
            Browse verified rooms, apartments, and rentals near you. This starter React app is a
            frontend shell for the landlord and renter marketplace you already have on the backend.
          </p>

          <div className="button-row">
            <Link className="primary-btn" to="/listings">Explore listings</Link>
            <Link className="secondary-btn" to="/signup">Create account</Link>
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <h3>Search smart</h3>
            <p>Filter by location, rent, and room features using the backend listing API.</p>
          </div>
          <div className="card">
            <h3>Book quickly</h3>
            <p>Client bookings and owner dashboards can be connected to the existing backend workflow.</p>
          </div>
          <div className="card">
            <h3>Live updates</h3>
            <p>Socket.IO is already in the backend and can power notifications and live booking activity.</p>
          </div>
        </section>
      </main>
    </>
  );
}
