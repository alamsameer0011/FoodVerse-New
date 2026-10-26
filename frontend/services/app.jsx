          <Result value={results[toolKey]} />
        </div>
      </article>
    );
  }

  return (
    <div className="foodverse">
      <div className="announcement"><span>THE ART OF EATING WELL</span><span>Discover · Taste · Nourish</span></div>
      <header className="navbar">
        <a href="#home" className="logo" aria-label="FoodVerse home"><span className="logo-mark">F.</span><span>foodverse<small>GOOD FOOD, BEAUTIFULLY FOUND</small></span></a>
        <nav className="main-nav">
          <a href="#home">Home</a><a href="#categories">Explore</a><a href="#restaurants">Restaurants</a><a href="#ai-tools">Food AI</a>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button className="button button-outline button-small" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) alert(error.message); }}>Log out</button>
            </>
          ) : <button className="button button-dark button-small" onClick={() => setShowAuth(true)}>Sign in <span>↗</span></button>}
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR DAILY DOSE OF DELIGHT</span>
            <h1>Good food.<br /><em>Great stories.</em><br />Better living.</h1>
            <p className="hero-description">A thoughtful space to discover delicious places, understand what’s on your plate, and find inspiration for your next meal.</p>
            <form className="hero-search" onSubmit={(event) => { event.preventDefault(); document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="search-symbol">⌕</span>
              <input type="search" placeholder="Search dishes, cuisines or places…" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button type="submit" aria-label="Search restaurants">→</button>
            </form>
            <div className="hero-links"><a href="#restaurants">Explore the collection <span>↗</span></a><span className="hero-note">Curated for curious appetites</span></div>
            <div className="hero-stats"><div><strong>06</strong><span>Food categories</span></div><i /><div><strong>05</strong><span>AI experiences</span></div><i /><div><strong>∞</strong><span>Ways to savour</span></div></div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo-main"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=92" alt="Beautifully styled fresh food bowl" fetchPriority="high" /></div>
            <div className="hero-photo-small"><img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=650&q=90" alt="Fresh colourful salad" /></div>
            <div className="hero-stamp"><span>FRESH</span><strong>Food<br />for the<br /><em>soul.</em></strong><span className="stamp-star">✳</span></div>
            <div className="hero-caption"><span>01 / THE FOOD JOURNAL</span><span>Made for your appetite</span></div>
          </div>
        </section>

        <section className="category-section section-wrap" id="categories">
          <div className="section-topline"><span className="eyebrow">A WORLD OF FLAVOUR</span><span className="topline-note">Something wonderful is always on the menu.</span></div>
          <SectionIntro eyebrow="FIND YOUR CRAVING" title={<>Follow your <em>appetite.</em></>} text="From familiar favourites to something new, find the flavour that feels right today." />
          <div className="category-grid">
            <button className={`category-card category-all ${selectedCategory === 'All' ? 'is-active' : ''}`} onClick={() => setSelectedCategory('All')}>
              <span className="category-image"><img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=85" alt="" /></span><span className="category-meta"><strong>Everything</strong><small>Explore it all ↗</small></span>
            </button>
            {categories.map((category) => (
              <button key={category.name} className={`category-card ${selectedCategory === category.name ? 'is-active' : ''}`} onClick={() => setSelectedCategory(category.name)}>
                <span className="category-image"><img src={category.image} alt="" loading="lazy" /></span><span className="category-meta"><strong>{category.name}</strong><small>Discover ↗</small></span>
              </button>
            ))}
          </div>
        </section>

        <section className="restaurant-section section-wrap" id="restaurants">
          <div className="section-topline"><span className="eyebrow">THE NEIGHBOURHOOD EDIT</span><span className="topline-note">Good places. Memorable plates.</span></div>
          <SectionIntro eyebrow="WORTH A TASTE" title={<>Places to <em>fall for.</em></>} text="A little inspiration for the next time you’re deciding what sounds delicious." />
          <div className="restaurant-toolbar"><span>{filteredRestaurants.length} places in this edit</span><div className="filter-pills"><button className={selectedCategory === 'All' ? 'selected' : ''} onClick={() => setSelectedCategory('All')}>All</button>{categories.slice(0, 4).map((c) => <button key={c.name} className={selectedCategory === c.name ? 'selected' : ''} onClick={() => setSelectedCategory(c.name)}>{c.name}</button>)}</div></div>
          <div className="restaurant-grid">
            {filteredRestaurants.length ? filteredRestaurants.map((restaurant, index) => (
              <article className={`restaurant-card restaurant-card-${index + 1}`} key={restaurant.id}>
                <div className="restaurant-image"><img src={restaurant.image} alt={restaurant.name} loading="lazy" /><span className="restaurant-tag">{restaurant.tag}</span><span className="rating">★ {restaurant.rating}</span><span className="image-index">0{index + 1}</span></div>
                <div className="restaurant-info"><div className="restaurant-title-row"><div><span className="restaurant-kicker">{restaurant.cuisine}</span><h3>{restaurant.name}</h3></div><span className="restaurant-arrow">↗</span></div><div className="restaurant-meta"><span>◷ {restaurant.time}</span><span>{restaurant.price}</span></div><button className="restaurant-link" onClick={() => alert(`${restaurant.name} is a demo listing. Restaurant ordering is not connected yet.`)}>Discover restaurant <span>→</span></button></div>
              </article>
            )) : <div className="empty-state"><span>⌕</span><h3>No places found</h3><p>Try another search or choose a different category.</p><button className="button button-dark" onClick={() => { setSearch(''); setSelectedCategory('All'); }}>Clear filters</button></div>}
          </div>
        </section>

        <section className="editorial-banner">
          <img src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1800&q=90" alt="Fresh ingredients on a kitchen table" loading="lazy" />
          <div className="editorial-overlay" />
          <div className="editorial-content"><span className="eyebrow">EAT WITH CURIOSITY</span><h2>More than a meal.<br /><em>A whole feeling.</em></h2><p>Explore the little rituals, fresh ideas and flavours that make everyday eating special.</p><a href="#ai-tools" className="button button-cream">Meet your food companion <span>↗</span></a></div>
          <span className="editorial-vertical">THE FOODVERSE POINT OF VIEW · VOL. 01</span>
        </section>

        <section className="ai-section section-wrap" id="ai-tools">
          <div className="section-topline"><span className="eyebrow">A LITTLE HELP FROM TECHNOLOGY</span><span className="topline-note">Curiosity meets intelligence.</span></div>
          <SectionIntro eyebrow="YOUR FOOD, UNDERSTOOD" title={<>Meet your <em>food companion.</em></>} text="Thoughtful AI tools to help you learn more about your food, plan with intention and get inspired in the kitchen." />
          <div className="ai-intro-strip"><div className="ai-orbit"><span>F.</span><i>✳</i></div><div><strong>FoodVerse Intelligence</strong><p>Useful insights for everyday food decisions.</p></div><span className="ai-live"><i /> CONNECTED TO FOODVERSE API</span></div>

          <div className="image-tools-grid">
            <ImageTool toolKey="food" number="01" title="Nutrition, at a glance" description="Explore visible food items and estimated nutrition from a meal photo." endpoint="/api/food/analyze" icon="◉" image="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" />
            <ImageTool toolKey="freshness" number="02" title="A fresher perspective" description="Look for visible signs such as discolouration or mould in food." endpoint="/api/food/freshness" icon="✳" image="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85" />
            <ImageTool toolKey="hygiene" number="03" title="Kitchen clarity" description="Review visible cleanliness indicators in a food preparation space." endpoint="/api/hygiene/analyze" icon="⌁" image="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85" />
          </div>

          <div className="creation-grid">
            <article className="creation-card recipe-card">
              <div className="creation-card-heading"><span className="creation-icon">✳</span><span className="eyebrow">IDEAS FOR YOUR KITCHEN</span><span className="creation-number">04</span></div>
              <h3>What shall we <em>make today?</em></h3><p>Tell us what’s in your kitchen and let AI help you turn it into something delicious.</p>
              <form onSubmit={generateRecipe} className="editorial-form">
                <label>Dish or ingredients<input value={recipeQuery} onChange={(e) => setRecipeQuery(e.target.value)} placeholder="e.g. potato, tomato, rice" required /></label>
                <div className="form-two-col"><label>Servings<select value={servings} onChange={(e) => setServings(e.target.value)}>{[1,2,3,4,5,6,8].map((n) => <option key={n} value={n}>{n} people</option>)}</select></label><label>Food preference<select value={recipeDiet} onChange={(e) => setRecipeDiet(e.target.value)}><option value="">Anything</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="high protein">High protein</option><option value="low carb">Low carb</option></select></label></div>
                <button className="button button-dark button-full" disabled={Boolean(loading)}>{loading === 'recipe' ? 'Creating your recipe…' : 'Create a recipe →'}</button>
              </form>
              {errors.recipe && <p className="error-message" role="alert">{errors.recipe}</p>}<Result value={results.recipe} />
            </article>
            <article className="creation-card meal-card">
              <div className="creation-card-heading"><span className="creation-icon">⌁</span><span className="eyebrow">A PLAN THAT FITS YOU</span><span className="creation-number">05</span></div>
              <h3>Make room for <em>well-being.</em></h3><p>Build a general meal plan around your preferences, goals and the foods you enjoy.</p>
              <form onSubmit={generateMealPlan} className="editorial-form">
                <div className="form-three-col"><label>Age<input type="number" min="1" max="120" value={mealProfile.age} onChange={(e) => updateMeal('age', e.target.value)} required /></label><label>Weight (kg)<input type="number" min="1" max="500" value={mealProfile.weight_kg} onChange={(e) => updateMeal('weight_kg', e.target.value)} required /></label><label>Height (cm)<input type="number" min="30" max="280" value={mealProfile.height_cm} onChange={(e) => updateMeal('height_cm', e.target.value)} required /></label></div>
                <div className="form-two-col"><label>Personal goal<select value={mealProfile.goal} onChange={(e) => updateMeal('goal', e.target.value)}><option value="maintain">Maintain weight</option><option value="lose">Lose weight</option><option value="gain">Gain weight</option></select></label><label>Diet style<select value={mealProfile.diet} onChange={(e) => updateMeal('diet', e.target.value)}><option value="none">No preference</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="keto">Keto</option></select></label></div>
                <label>Allergies<input value={mealProfile.allergies} onChange={(e) => updateMeal('allergies', e.target.value)} placeholder="e.g. peanuts (optional)" /></label>
                <label>Foods to avoid<input value={mealProfile.dislikes} onChange={(e) => updateMeal('dislikes', e.target.value)} placeholder="e.g. mushrooms (optional)" /></label>
                <label>Plan length<select value={mealProfile.days} onChange={(e) => updateMeal('days', e.target.value)}>{[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>)}</select></label>
                <button className="button button-dark button-full" disabled={Boolean(loading)}>{loading === 'mealplan' ? 'Preparing your plan…' : 'Build my meal plan →'}</button>
              </form>
              {errors.mealplan && <p className="error-message" role="alert">{errors.mealplan}</p>}<Result value={results.mealplan} />
            </article>
          </div>
          <p className="safety-note"><span>ⓘ</span> Image analysis only assesses visible clues. It cannot guarantee food safety or confirm unseen hygiene conditions. Meal plans provide general information, not medical advice.</p>
        </section>

        <section className="closing-cta"><div className="closing-ornament">✳</div><span className="eyebrow">YOUR NEXT BITE OF INSPIRATION</span><h2>Life is too short<br />for <em>ordinary food.</em></h2><a href="#categories" className="button button-cream">Find your next favourite <span>↗</span></a></section>
      </main>

      <footer className="footer"><a href="#home" className="logo footer-logo"><span className="logo-mark">F.</span><span>foodverse<small>GOOD FOOD, BEAUTIFULLY FOUND</small></span></a><p>A little more flavour in every day.</p><div className="footer-links"><a href="#home">Home</a><a href="#restaurants">Explore</a><a href="#ai-tools">Food AI</a><button onClick={() => setShowAuth(true)}>{user ? 'Account' : 'Sign in'}</button></div><div className="footer-bottom"><span>© 2026 FoodVerse. Made for food lovers.</span><a href="#home">Back to top ↑</a></div></footer>
      {showAuth && <AuthPanel onClose={() => setShowAuth(false)} />}
    </div>
  );
