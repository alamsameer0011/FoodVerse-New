
import React, { useState } from 'react';
import './style.css';

const categories = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burger', emoji: '🍔' },
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Chinese', emoji: '🥡' },
  { name: 'Drinks', emoji: '🥤' },
];

const restaurants = [
  {
    id: 1,
    name: 'Royal Biryani House',
    cuisine: 'Indian • Biryani',
    rating: '4.8',
    time: '25-30 min',
    price: '₹250 for two',
    emoji: '🍛',
    category: 'Biryani',
  },
  {
    id: 2,
    name: 'Pizza Paradise',
    cuisine: 'Italian • Pizza',
    rating: '4.6',
    time: '30-35 min',
    price: '₹400 for two',
    emoji: '🍕',
    category: 'Pizza',
  },
  {
    id: 3,
    name: 'Burger Junction',
    cuisine: 'Fast Food • Burgers',
    rating: '4.5',
    time: '20-25 min',
    price: '₹200 for two',
    emoji: '🍔',
    category: 'Burger',
  },
  {
    id: 4,
    name: 'Sweet Treats',
    cuisine: 'Bakery • Desserts',
    rating: '4.7',
    time: '15-20 min',
    price: '₹180 for two',
    emoji: '🍰',
    category: 'Desserts',
  },
];

export default function App() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      restaurant.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="foodverse">
      <header className="navbar">
        <a href="#" className="logo">
          🍽️ Food<span>Verse</span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#restaurants">Restaurants</a>
        </nav>

        <button className="login-btn">
          Login
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="tagline">
              ✨ Discover your next favourite meal
            </span>

            <h1>
              Delicious Food,
              <br />
              Delivered with <span>Love.</span>
            </h1>

            <p>
              Explore amazing restaurants, discover delicious dishes,
              and enjoy every bite with FoodVerse.
            </p>

            <div className="search-box">
              <span>🔍</span>
              <input
                type="search"
                placeholder="Search food or restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <a href="#restaurants" className="explore-btn">
              Explore Food →
            </a>
          </div>

          <div className="hero-image">
            <div className="food-circle">🍕</div>
            <div className="floating-food food-one">🍔</div>
            <div className="floating-food food-two">🍰</div>
            <div className="floating-food food-three">🍜</div>
          </div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-heading">
            <div>
              <span className="small-heading">EXPLORE</span>
              <h2>Popular Categories</h2>
            </div>
            <button
              className="view-all"
              onClick={() => setSelectedCategory('All')}
            >
              View All →
            </button>
          </div>

          <div className="category-grid">
            <button
              className={`category-card ${
                selectedCategory === 'All' ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory('All')}
            >
              <span>🍽️</span>
              <strong>All Food</strong>
            </button>

            {categories.map((category) => (
              <button
                key={category.name}
                className={`category-card ${
                  selectedCategory === category.name ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <span>{category.emoji}</span>
                <strong>{category.name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="restaurants section" id="restaurants">
          <div className="section-heading">
            <div>
              <span className="small-heading">TASTY CHOICES</span>
              <h2>Popular Restaurants</h2>
            </div>
          </div>

          <div className="restaurant-grid">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant) => (
                <article className="restaurant-card" key={restaurant.id}>
                  <div className="restaurant-image">
                    <span>{restaurant.emoji}</span>
                    <span className="rating">⭐ {restaurant.rating}</span>
                  </div>

                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>

                    <div className="restaurant-meta">
                      <span>🕒 {restaurant.time}</span>
                      <span>{restaurant.price}</span>
                    </div>

                    <button
                      className="order-btn"
                      onClick={() =>
                        alert(`You selected ${restaurant.name}!`)
                      }
                    >
                      View Restaurant →
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="no-results">
                No restaurants found. Try another search!
              </p>
            )}
          </div>
        </section>

        <section className="cta-section">
          <h2>Good Food Makes Every Moment Better!</h2>
          <p>Discover something delicious today with FoodVerse.</p>
          <a href="#restaurants">Start Exploring →</a>
        </section>
      </main>

      <footer className="footer">
        <h2>🍽️ FoodVerse</h2>
        <p>Discover food. Explore flavours. Enjoy life.</p>
        <p>© 2026 FoodVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
