document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add animate class to elements
  const animateElements = document.querySelectorAll('.feature-card, .plant-card, .section-header, .care-card');
  animateElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // Smooth scrolling for anchor links (only if they start with hash and stay on same page)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- CART FUNCTIONALITY WITH LOCALSTORAGE ---
  let cart = [];
  
  // Load cart from localStorage
  const savedCart = localStorage.getItem('plantland_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      console.error('Error parsing cart from localStorage', e);
      cart = [];
    }
  }

  const saveCart = () => {
    localStorage.setItem('plantland_cart', JSON.stringify(cart));
  };
  
  const cartToggleBtn = document.getElementById('cart-toggle');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalPriceEl = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Toggle Cart
  const openCart = () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
  };

  const closeCart = () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
  };

  cartToggleBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Render Cart
  const renderCart = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    // Detect if we are in a subdirectory to adjust paths
    const isSubPage = window.location.pathname.includes('/products/') || window.location.pathname.includes('/info/');
    const baseDir = isSubPage ? '../' : '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-container">
          <p class="empty-cart-msg">Your cart is feeling a little empty.</p>
          <a href="${baseDir}shop.html" class="btn btn-primary explore-shop-btn">Explore Shop</a>
        </div>
      `;
    } else {
      cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        // Ensure image path is correct for the current page level
        let displayImage = item.image;
        if (baseDir && !displayImage.startsWith('http') && !displayImage.startsWith('../')) {
          displayImage = baseDir + displayImage;
        } else if (!baseDir && displayImage.startsWith('../')) {
          displayImage = displayImage.replace('../', '');
        }

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
          <img src="${displayImage}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>$${item.price}</p>
            <div class="cart-item-actions">
              <button class="qty-btn minus" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="qty-btn plus" data-id="${item.id}">+</button>
              <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(itemEl);
      });
    }

    if (count > 0) {
      cartCountEl.textContent = count;
      cartCountEl.style.display = 'flex';
    } else {
      cartCountEl.textContent = '0';
      cartCountEl.style.display = 'none';
    }
    
    cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;

    // Update Shipping Progress
    const shippingThreshold = 60;
    const shippingProgressContainer = document.getElementById('shipping-progress-container');
    
    if (shippingProgressContainer) {
      if (total === 0) {
        shippingProgressContainer.style.display = 'none';
      } else {
        shippingProgressContainer.style.display = 'block';
        const remaining = shippingThreshold - total;
        const progress = Math.min((total / shippingThreshold) * 100, 100);
        
        if (remaining > 0) {
          shippingProgressContainer.innerHTML = `
            <span class="shipping-progress-text">You're <span>$${remaining.toFixed(2)}</span> away from <strong>Free Shipping</strong>!</span>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
          `;
        } else {
          shippingProgressContainer.innerHTML = `
            <span class="shipping-unlocked">🎉 Free Shipping Unlocked!</span>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: 100%"></div>
            </div>
          `;
        }
      }
    }

    // Add event listeners to newly rendered buttons
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
    });
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
    });
  };

  // Add to Cart
  const addToCart = (id, name, price, image) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price: parseFloat(price), image, quantity: 1 });
    }
    saveCart();
    renderCart();
    openCart();
  };

  // Update Quantity
  const updateQuantity = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        removeFromCart(id);
      } else {
        saveCart();
        renderCart();
      }
    }
  };

  // Remove from Cart
  const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  };

  // Add click listeners to product buttons
  const addButtons = document.querySelectorAll('.add-to-cart');
  addButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const { id, name, price, image } = this.dataset;
      
      // Visual feedback
      const originalText = this.textContent;
      this.textContent = 'Added! 🌿';
      this.style.backgroundColor = 'var(--color-primary)';
      this.style.color = 'var(--color-on-primary)';
      
      setTimeout(() => {
        this.textContent = originalText;
        this.style.backgroundColor = '';
        this.style.color = '';
      }, 1500);

      addToCart(id, name, price, image);
    });
  });

  // Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert('Thank you for shopping at PlantLand! Your cool new plants will be shipped shortly. (This is a mock checkout)');
    cart = [];
    saveCart();
    renderCart();
    closeCart();
  });

  // Listen for storage events (if cart updated in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'plantland_cart') {
      try {
        cart = JSON.parse(e.newValue) || [];
        renderCart();
      } catch (err) {
        console.error(err);
      }
    }
  });

  // --- SEARCH FUNCTIONALITY ---
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    
    // Auto-fill the search input
    const searchInputs = document.querySelectorAll('.nav-search-input');
    searchInputs.forEach(input => {
      input.value = searchQuery;
    });

    // Filter plants if on a page with plant cards
    const plantCards = document.querySelectorAll('.plant-card');
    if (plantCards.length > 0) {
      let foundAny = false;
      plantCards.forEach(card => {
        const title = card.querySelector('h3');
        if (title && title.textContent.toLowerCase().includes(searchLower)) {
          card.style.display = '';
          foundAny = true;
        } else {
          card.style.display = 'none';
        }
      });

      // Show a message if nothing found
      const plantsGrid = document.querySelector('.plants-grid');
      if (!foundAny && plantsGrid) {
        const noResultsMsg = document.createElement('p');
        noResultsMsg.className = 'no-results-msg';
        noResultsMsg.style.gridColumn = '1 / -1';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.fontSize = '1.25rem';
        noResultsMsg.style.padding = '2rem 0';
        noResultsMsg.textContent = `No plants found matching "${searchQuery}".`;
        plantsGrid.appendChild(noResultsMsg);
      }
    }
  }

  // Mobile Search Toggle Logic
  const searchBtn = document.querySelector('.nav-search-btn');
  const searchForm = document.querySelector('.nav-search-form');
  const searchInput = document.querySelector('.nav-search-input');
  
  if (searchBtn && searchForm && searchInput) {
    searchBtn.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (!searchForm.classList.contains('active')) {
          e.preventDefault();
          searchForm.classList.add('active');
          searchInput.focus();
        } else if (searchInput.value.trim() === '') {
          e.preventDefault();
          searchForm.classList.remove('active');
        }
      }
    });

    // Close search form when clicking outside of it
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && searchForm.classList.contains('active')) {
        if (!searchForm.contains(e.target)) {
          searchForm.classList.remove('active');
        }
      }
    });
  }

  // Product Gallery Arrows Logic
  const productGallery = document.querySelector('.product-gallery');
  if (productGallery) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');

    let currentIndex = 0;

    const updateGallery = (index) => {
      thumbnails.forEach(t => t.classList.remove('active'));
      thumbnails[index].classList.add('active');
      mainImage.src = thumbnails[index].src;
      currentIndex = index;
    };

    if (prevBtn && nextBtn && thumbnails.length > 0) {
      prevBtn.addEventListener('click', () => {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = thumbnails.length - 1;
        updateGallery(newIndex);
      });

      nextBtn.addEventListener('click', () => {
        let newIndex = currentIndex + 1;
        if (newIndex >= thumbnails.length) newIndex = 0;
        updateGallery(newIndex);
      });
      
      // Update currentIndex if a thumbnail is clicked directly
      thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
          currentIndex = index;
        });
      });
    }
  }
  
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    
    // Auto-fill the search input
    const searchInputs = document.querySelectorAll('.nav-search-input');
    searchInputs.forEach(input => {
      input.value = searchQuery;
    });

    // Filter plants if on a page with plant cards
    const plantCards = document.querySelectorAll('.plant-card');
    if (plantCards.length > 0) {
      let foundAny = false;
      plantCards.forEach(card => {
        const title = card.querySelector('h3');
        if (title && title.textContent.toLowerCase().includes(searchLower)) {
          card.style.display = '';
          foundAny = true;
        } else {
          card.style.display = 'none';
        }
      });

      // Show a message if nothing found
      const plantsGrid = document.querySelector('.plants-grid');
      if (!foundAny && plantsGrid) {
        const noResultsMsg = document.createElement('p');
        noResultsMsg.className = 'no-results-msg';
        noResultsMsg.style.gridColumn = '1 / -1';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.fontSize = '1.25rem';
        noResultsMsg.style.padding = '2rem 0';
        noResultsMsg.textContent = `No plants found matching "${searchQuery}".`;
        plantsGrid.appendChild(noResultsMsg);
      }
    }
  }

  // Initial render
  renderCart();
});
