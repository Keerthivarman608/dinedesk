import { Search, MapPin, Star, Clock } from 'lucide-react';
import { restaurants, categories } from './Data';

export default function HomeView({ onSelectRestaurant }) {
  return (
    <div className="home-view fade-in">
      {/* Header */}
      <header className="home-header">
        <div>
          <p className="text-caption">Current Location</p>
          <h2 className="text-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--primary)" />
            New York, NY
          </h2>
        </div>
        <div className="user-avatar">
          <img src="https://i.pravatar.cc/100?img=33" alt="User" />
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="input-group">
          <Search className="input-icon" size={20} />
          <input type="text" className="input-field" placeholder="Search for restaurants, cuisines..." />
        </div>
      </div>

      {/* Categories */}
      <section className="categories-section">
        <h3 className="section-title">Categories</h3>
        <div className="categories-list">
          {categories.map((cat, idx) => (
            <div className={`category-item ${idx === 0 ? 'active' : ''}`} key={cat.id}>
              <div className="category-icon-wrapper">
                {/* Simulated icon using emoji for simplicity, though we imported lucide */}
                <span className="category-emoji">
                  {cat.name === 'Sushi' ? '🍣' : cat.name === 'Italian' ? '🍕' : cat.name === 'American' ? '🍔' : cat.name === 'Indian' ? '🍛' : '🍽️'}
                </span>
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="restaurants-section">
        <div className="section-header">
          <h3 className="section-title">Popular Near You</h3>
          <button className="btn-text">See All</button>
        </div>
        
        <div className="restaurants-list">
          {restaurants.map(restaurant => (
            <div 
              key={restaurant.id} 
              className="restaurant-card"
              onClick={() => onSelectRestaurant(restaurant)}
            >
              <div className="restaurant-image-wrapper">
                <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
                <div className="restaurant-tag">{restaurant.distance}</div>
              </div>
              <div className="restaurant-info">
                <div className="restaurant-header-row">
                  <h4 className="restaurant-name">{restaurant.name}</h4>
                  <div className="restaurant-rating">
                    <Star size={14} fill="var(--primary)" color="var(--primary)" />
                    <span>{restaurant.rating}</span>
                  </div>
                </div>
                <p className="restaurant-cuisine">{restaurant.cuisine} • {restaurant.priceRange}</p>
                <div className="restaurant-details">
                  <div className="detail-item">
                    <Clock size={14} />
                    <span>Closes 10:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
