
import React, { useState, useEffect } from 'react';
import './style.css';
import AuthPanel from './AuthPanel';
import { supabase } from './supabaseClient';

const API = 'https://foodverse-backend-project.onrender.com';

const categories = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burger', emoji: '🍔' },
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Chinese', emoji: '🥡' },
  { name: 'Drinks', emoji: '🥤' },
];

const restaurants = [
  { id: 1, name: 'Royal Biryani House', cuisine: 'Indian • Biryani', rating: '4.8', time: '25-30 min', price: '₹250 for two', emoji: '🍛', category: 'Biryani' },
  { id: 2, name: 'Pizza Paradise', cuisine: 'Italian • Pizza', rating: '4.6', time: '30-35 min', price: '₹400 for two', emoji: '🍕', category: 'Pizza' },
  { id: 3, name: 'Burger Junction', cuisine: 'Fast Food • Burgers', rating: '4.5', time: '20-25 min', price: '₹200 for two', emoji: '🍔', category: 'Burger' },
  { id: 4, name: 'Sweet Treats', cuisine: 'Bakery • Desserts', rating: '4.7', time: '15-20 min', price: '₹180 for two', emoji: '🍰', category: 'Desserts' },
];

const panelStyle = {
  background: '#fff',
  border: '1px solid #f5e7d8',
  borderRadius: 16,
  padding: 20,
  minWidth: 0,
};

const fieldStyle = {
  display: 'block',
  width: '100%',
  padding: 11,
  marginTop: 7,
  marginBottom: 14,
  border: '1px solid #e7d9cc',
  borderRadius: 9,
  background: '#fff',
  color: '#292524',
};

const buttonStyle = {
  padding: '11px 16px',
  border: 0,
  borderRadius: 9,
  background: '#f97316',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

function Result({ value }) {
  if (!value) return null;

  return (
    <pre
      style={{
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        background: '#fff7ed',
        borderRadius: 10,
        padding: 14,
        fontSize: 13,
        lineHeight: 1.6,
        color: '#44403c',
        maxHeight: 420,
        overflow: 'auto',
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function App() { 
  
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [images, setImages] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState('');
  const [errors, setErrors] = useState({});

  const [recipeQuery, setRecipeQuery] = useState('');
  const [servings, setServings] = useState(2);
  const [recipeDiet, setRecipeDiet] = useState('');
  const [mealProfile, setMealProfile] = useState({
    age: 25,
    weight_kg: 65,
    height_cm: 165,
    goal: 'maintain',
    diet: 'none',
    allergies: '',
    dislikes: '',
    days: 3,
  });

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const q = search.toLowerCase();

    return (
      (restaurant.name.toLowerCase().includes(q) ||
        restaurant.cuisine.toLowerCase().includes(q)) &&
      (selectedCategory === 'All' ||
        restaurant.category === selectedCategory)
    );
  });

  async function requestApi(key, endpoint, options) {
    setLoading(key);
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setResults((prev) => ({ ...prev, [key]: null }));

    try {
      const response = await fetch(`${API}${endpoint}`, options);
      const text = await response.text();

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text || 'Unexpected server response.' };
      }

      if (!response.ok) {
        const detail =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail || data);

        throw new Error(detail || `Request failed (${response.status})`);
      }

      setResults((prev) => ({ ...prev, [key]: data }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [key]:
          error.message === 'Failed to fetch'
            ? 'Backend se connection nahi ho paaya. Backend status aur CORS settings check karein.'
            : error.message,
      }));
    } finally {
      setLoading('');
    }
  }

  function analyzeImage(key, endpoint) {
    const file = images[key];

    if (!file) {
      setErrors((prev) => ({
        ...prev,
        [key]: 'Pehle ek image select karo.',
      }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        [key]: 'Please select a valid image.',
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [key]: 'Image 10 MB se chhoti honi chahiye.',
      }));
      return;
    }

    const form = new FormData();
    form.append('file', file);

    requestApi(key, endpoint, {
      method: 'POST',
      body: form,
    });
  }

  function generateRecipe(event) {
    event.preventDefault();

    if (!recipeQuery.trim()) {
      setErrors((prev) => ({
        ...prev,
        recipe: 'Dish ya ingredients ka naam likho.',
      }));
      return;
    }

    requestApi('recipe', '/api/cook/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: recipeQuery.trim(),
        servings: Number(servings),
        diet: recipeDiet,
      }),
    });
  }

  function generateMealPlan(event) {
    event.preventDefault();

    requestApi('mealplan', '/api/cook/mealplan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...mealProfile,
        age: Number(mealProfile.age),
        weight_kg: Number(mealProfile.weight_kg),
        height_cm: Number(mealProfile.height_cm),
        days: Number(mealProfile.days),
      }),
    });
  }

  function updateMeal(field, value) {
    setMealProfile((prev) => ({ ...prev, [field]: value }));
  }

  function ImageTool({ toolKey, title, description, endpoint, emoji }) {
    return (
      <article style={panelStyle}>
        <div style={{ fontSize: 32 }}>{emoji}</div>
        <h3>{title}</h3>
        <p style={{ color: '#78716c', lineHeight: 1.6 }}>{description}</p>

        <label style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>
          Choose image
          <input
            style={fieldStyle}
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setImages((prev) => ({ ...prev, [toolKey]: file }));
                setResults((prev) => ({ ...prev, [toolKey]: null }));
                setErrors((prev) => ({ ...prev, [toolKey]: '' }));
              }
            }}
          />
        </label>

        {images[toolKey] && (
          <p style={{ fontSize: 12, color: '#78716c' }}>
            Selected: {images[toolKey].name}
          </p>
        )}

        <button
          style={buttonStyle}
          disabled={Boolean(loading)}
          onClick={() => analyzeImage(toolKey, endpoint)}
        >
          {loading === toolKey ? 'Analyzing...' : 'Analyze Image'}
        </button>

        {errors[toolKey] && (
          <p role="alert" style={{ color: '#b91c1c', lineHeight: 1.5 }}>
            {errors[toolKey]}
          </p>
        )}

        <Result value={results[toolKey]} />
      </article>
    );
  }

  return (
    <div className="foodverse">

<header className="navbar">
  <a href="#home" className="logo">
    🍽️ Food<span>Verse</span>
  </a>

  <nav>
    <a href="#home">Home</a>
    <a href="#categories">Categories</a>
    <a href="#restaurants">Restaurants</a>
    <a href="#ai-tools">AI Tools</a>
  </nav>

  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    {user ? (
      <>
        <span style={{ fontSize: 13, color: '#44403c' }}>
          {user.email}
        </span>
        <button
          className="login-btn"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) alert(error.message);
          }}
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <button
          className="login-btn"
          onClick={() => setShowAuth(true)}
        >
          Login / Sign Up
        </button>
        <a className="login-btn" href="#ai-tools">
          Try AI Tools
        </a>
      </>
    )}
  </div>
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
              Explore food, analyze nutrition, check visible freshness,
              and discover recipes with FoodVerse AI.
            </p>

            <div className="search-box">
              <span>🔍</span>
              <input
                type="search"
                placeholder="Search food or restaurants..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <a href="#ai-tools" className="explore-btn">
              Explore AI Tools →
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

        <section className="section" id="ai-tools" style={{ background: '#fffaf5' }}>
          <div className="section-heading">
            <div>
              <span className="small-heading">POWERED BY GEMINI</span>
              <h2>FoodVerse AI Tools</h2>
              <p style={{ color: '#78716c', lineHeight: 1.7 }}>
                Upload a photo or enter your details to try the live backend.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
              gap: 20,
            }}
          >
            <ImageTool
              toolKey="food"
              title="Food Nutrition Analysis"
              description="Upload a meal photo to estimate visible food items, nutrition, and a health score."
              endpoint="/api/food/analyze"
              emoji="🥗"
            />

            <ImageTool
              toolKey="freshness"
              title="Food Freshness Check"
              description="Check visible signs such as discoloration or mold in a food image."
              endpoint="/api/food/freshness"
              emoji="🍎"
            />

            <ImageTool
              toolKey="hygiene"
              title="Kitchen Hygiene Analysis"
              description="Analyze visible cleanliness indicators in a kitchen or food preparation area."
              endpoint="/api/hygiene/analyze"
              emoji="🧼"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 20,
              marginTop: 24,
            }}
          >
            <article style={panelStyle}>
              <div style={{ fontSize: 32 }}>👨‍🍳</div>
              <h3>AI Recipe Generator</h3>
              <p style={{ color: '#78716c', lineHeight: 1.6 }}>
                Enter a dish name, cooking question, or available ingredients.
              </p>

              <form onSubmit={generateRecipe}>
                <label>
                  Dish or ingredients
                  <input
                    style={fieldStyle}
                    value={recipeQuery}
                    onChange={(event) => setRecipeQuery(event.target.value)}
                    placeholder="e.g. potato, tomato, rice"
                    required
                  />
                </label>

                <label>
                  Servings
                  <select
                    style={fieldStyle}
                    value={servings}
                    onChange={(event) => setServings(event.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                      <option key={n} value={n}>{n} people</option>
                    ))}
                  </select>
                </label>

                <label>
                  Dietary preference
                  <select
                    style={fieldStyle}
                    value={recipeDiet}
                    onChange={(event) => setRecipeDiet(event.target.value)}
                  >
                    <option value="">No preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="high protein">High protein</option>
                    <option value="low carb">Low carb</option>
                  </select>
                </label>

                <button style={buttonStyle} disabled={Boolean(loading)}>
                  {loading === 'recipe' ? 'Generating...' : 'Generate Recipe'}
                </button>
              </form>

              {errors.recipe && (
                <p role="alert" style={{ color: '#b91c1c' }}>{errors.recipe}</p>
              )}
              <Result value={results.recipe} />
            </article>

            <article style={panelStyle}>
              <div style={{ fontSize: 32 }}>📅</div>
              <h3>Personalized Meal Plan</h3>
              <p style={{ color: '#78716c', lineHeight: 1.6 }}>
                Create a meal plan using your entered preferences. Estimates
                are general guidance, not medical advice.
              </p>

              <form onSubmit={generateMealPlan}>
                <label>
                  Age
                  <input
                    style={fieldStyle}
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={mealProfile.age}
                    onChange={(event) => updateMeal('age', event.target.value)}
                  />
                </label>

                <label>
                  Weight (kg)
                  <input
                    style={fieldStyle}
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={mealProfile.weight_kg}
                    onChange={(event) => updateMeal('weight_kg', event.target.value)}
                  />
                </label>

                <label>
                  Height (cm)
                  <input
                    style={fieldStyle}
                    type="number"
                    min="30"
                    max="280"
                    required
                    value={mealProfile.height_cm}
                    onChange={(event) => updateMeal('height_cm', event.target.value)}
                  />
                </label>

                <label>
                  Goal
                  <select
                    style={fieldStyle}
                    value={mealProfile.goal}
                    onChange={(event) => updateMeal('goal', event.target.value)}
                  >
                    <option value="maintain">Maintain weight</option>
                    <option value="lose">Lose weight</option>
                    <option value="gain">Gain weight</option>
                  </select>
                </label>

                <label>
                  Diet
                  <select
                    style={fieldStyle}
                    value={mealProfile.diet}
                    onChange={(event) => updateMeal('diet', event.target.value)}
                  >
                    <option value="none">No preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                  </select>
                </label>

                <label>
                  Allergies (optional)
                  <input
                    style={fieldStyle}
                    value={mealProfile.allergies}
                    onChange={(event) => updateMeal('allergies', event.target.value)}
                    placeholder="e.g. peanuts"
                  />
                </label>

                <label>
                  Foods to avoid (optional)
                  <input
                    style={fieldStyle}
                    value={mealProfile.dislikes}
                    onChange={(event) => updateMeal('dislikes', event.target.value)}
                    placeholder="e.g. mushrooms"
                  />
                </label>

                <label>
                  Plan length
                  <select
                    style={fieldStyle}
                    value={mealProfile.days}
                    onChange={(event) => updateMeal('days', event.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>{n} day(s)</option>
                    ))}
                  </select>
                </label>

                <button style={buttonStyle} disabled={Boolean(loading)}>
                  {loading === 'mealplan' ? 'Creating plan...' : 'Generate Meal Plan'}
                </button>
              </form>

              {errors.mealplan && (
                <p role="alert" style={{ color: '#b91c1c' }}>{errors.mealplan}</p>
              )}
              <Result value={results.mealplan} />
            </article>
          </div>

          <p style={{ color: '#78716c', fontSize: 13, lineHeight: 1.7, marginTop: 20 }}>
            Note: Image analysis can only assess visible clues. It cannot
            guarantee food safety or confirm unseen hygiene conditions.
          </p>
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
                      onClick={() => alert(`${restaurant.name} is a demo listing. Restaurant ordering is not connected yet.`)}
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
          <a href="#ai-tools">Try FoodVerse AI →</a>
        </section>
      </main>

      <footer className="footer">
        <h2>🍽️ FoodVerse</h2>
        <p>Discover food. Explore flavours. Enjoy life.</p>
        <p>© 2026 FoodVerse. All rights reserved.</p>
      </footer>
       {showAuth && (
        <AuthPanel onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
