class CartNotification extends HTMLElement {
    constructor() {
      super();
      this.sectionId = this.getAttribute('section-id') || 'cart-notification';
    }

    renderLoading() {
        this.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-xl max-w-sm w-full">
            <p class="text-sm text-gray-500">Adding to cart...</p>
        </div>
        `;
    }

     async showNotification(key) {

        this.cartItemKey = key;

        // Fetch updated section HTML
        const sectionRes = await fetch(`/?sections=cart-notification,cart-notification-product,cart-icon-bubble`);
        const sections = await sectionRes.json();

        // Update the cart notification HTML
        this.renderCartNotification(sections);

        // Update the cart notification product section
        this.updateCartNotificationProductSection(sections);

        this.updateCartBubble(sections);
       
    }

    renderCartNotification(sections) {
        this.innerHTML = sections['cart-notification'];
        this.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        this.classList.add('opacity-100', 'translate-y-0');
        
        const closeButton = this.querySelector('.cart-notification__close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideNotification());
        }
    }

    updateCartNotificationProductSection(sections) {
        const htmlString = sections['cart-notification-product'];
        const container = document.getElementById('cart-notification-product');

        if (!container) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        const fragment = tempDiv.querySelector(`[id="cart-notification-product-${this.cartItemKey}"]`);

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    updateCartBubble(sections) {
        const cartBubble = document.getElementById('cart-icon-bubble');
        if (cartBubble && sections['cart-icon-bubble']) {
            cartBubble.innerHTML = sections['cart-icon-bubble'];
        }
    }

    hideNotification() {
        this.classList.remove('opacity-100', 'translate-y-0');
        this.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            this.classList.add('hidden');
        }, 300); 
    }
}

customElements.define('cart-notification', CartNotification);
