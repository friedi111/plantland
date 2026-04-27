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
  const animateElements = document.querySelectorAll('.feature-card, .plant-card, .section-header');
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

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is feeling a little empty.</p>';
    } else {
      cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
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

    cartCountEl.textContent = count;
    cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;

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

  // Initial render
  renderCart();
});
