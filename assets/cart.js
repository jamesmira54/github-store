class CartPage extends HTMLElement {
    constructor() {
        super();
        this.sectionId = this.getAttribute('section-id');
    }

    connectedCallback() {
        this.addEventListener('click', (event) => {
            if (event.target.closest('.qty-btn')) this.onQuantityClick(event);
            if (event.target.closest('[data-action="remove"]')) this.onRemoveItem(event);
            if (event.target.closest('[data-action="clear"]')) this.onClearCart(event);
        });
    }

    async fetchUpdatedSections() {
        const response = await fetch('/?sections=cart,cart-icon-bubble');
        return await response.json();
    }


    async onQuantityClick(event) {
        const button = event.target.closest('.qty-btn');
        const row = button.closest('[data-item-key]');
        const input = row?.querySelector('.qty-input');

        if (!row || !input) {
            console.warn('Missing row or quantity input');
            return;
        }

        const itemKey = row.dataset.itemKey;
        let quantity = parseInt(input.value);

        if (button.dataset.action === 'plus') quantity++;
        if (button.dataset.action === 'minus') quantity = Math.max(0, quantity - 1);

        input.value = quantity;


        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemKey, quantity }),
            });

            const sections = await this.fetchUpdatedSections();
            this.updateCartContents(sections);
        } catch (error) {
            console.error('Cart update failed:', error);
        }
    }

    updateCartContents(sections) {
        const newHTML = sections['cart'];
        if (!newHTML) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(newHTML, 'text/html');
        const newCart = doc.querySelector('cart-page');

        if (newCart) this.innerHTML = newCart.innerHTML;

        const bubble = document.getElementById('cart-icon-bubble');
            if (bubble && sections['cart-icon-bubble']) {
            bubble.innerHTML = sections['cart-icon-bubble'];
        }
    }

    async onRemoveItem(event) {
        const itemKey = event.target.closest('[data-action="remove"]')?.dataset.itemKey;
        if (!itemKey) return;

        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemKey, quantity: 0 })
            });

            const sections = await this.fetchUpdatedSections();
            this.updateCartContents(sections);

        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    }


    async onClearCart() {
        try {
            await fetch('/cart/clear.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const sections = await this.fetchUpdatedSections();
            this.updateCartContents(sections);
        } catch (err) {
            console.error('Failed to clear cart:', err);
        }
    }
    
}

customElements.define('cart-page', CartPage);