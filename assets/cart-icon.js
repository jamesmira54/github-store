class CartIcon extends HTMLElement {
  constructor() {
    super();
    this.countElement = this.querySelector('.cart-count');
    this.updateCartCount = this.updateCartCount.bind(this);
  }

  connectedCallback() {
    this.fetchCartCount();
    document.addEventListener('cart:updated', this.updateCartCount);
  }

  async fetchCartCount() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      this.setCount(cart.item_count);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }

  async updateCartCount() {
    this.fetchCartCount();
  }

  setCount(count) {
    if (this.countElement) {
      this.countElement.textContent = count;
      this.countElement.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }
}

customElements.define('cart-icon', CartIcon);
