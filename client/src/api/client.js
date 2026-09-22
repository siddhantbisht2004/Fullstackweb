body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f6f7fb;
  color: #1f2937;
}

* {
  box-sizing: border-box;
}

img {
  max-width: 100%;
  display: block;
}

button, input, select, textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

.container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.navbar {
  background: #0f172a;
  color: white;
  padding: 16px 0;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.nav-links a, .nav-links button {
  background: transparent;
  border: none;
  color: white;
  opacity: 0.9;
}

.hero {
  padding: 64px 0 32px;
}

.hero-card {
  background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
  border-radius: 28px;
  padding: 48px;
  border: 1px solid #e5e7eb;
}

.hero h1 {
  margin: 0 0 16px;
  font-size: clamp(2.3rem, 5vw, 4rem);
  line-height: 1.1;
}

.hero p {
  margin: 0 0 24px;
  font-size: 1.08rem;
  color: #374151;
  max-width: 680px;
}

.button-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn, .danger-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 700;
}

.primary-btn {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
}

.secondary-btn {
  background: white;
  color: #111827;
  border: 1px solid #d1d5db;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.card h3, .card h2 {
  margin-top: 0;
}

.form-wrap {
  max-width: 520px;
  margin: 60px auto;
  background: white;
  border-radius: 22px;
  border: 1px solid #e5e7eb;
  padding: 32px;
}

.form-wrap h1 {
  margin-top: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.form-group label {
  font-weight: 600;
}

.form-group input, .form-group select, .form-group textarea {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  margin-top: 24px;
}

.listing-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
}

.listing-card img {
  width: 100%;
  height: 210px;
  object-fit: cover;
}

.listing-card-content {
  padding: 16px;
}

.listing-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.tag {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 0.8rem;
  font-weight: 700;
}

.detail-page {
  padding: 32px 0 64px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 28px;
}

.image-box {
  border-radius: 24px;
  overflow: hidden;
  height: 420px;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta-box {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
}

.page-title {
  margin: 0 0 14px;
}

.muted {
  color: #6b7280;
}

.listing-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 8px;
}

.notice {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  margin-bottom: 18px;
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .hero-card {
    padding: 28px 20px;
  }
}
