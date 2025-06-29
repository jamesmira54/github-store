class CartPage extends HTMLElement {
    constructor() {
        super();
        this.sectionId = this.getAttribute('section-id');
    }

    connectedCallback() {
        this.addEventListener('click', this.onQuantityClick.bind(this));
        this.addEventListener('click', this.onRemoveItem.bind(this));
        this.addEventListener('click', this.onClearCart.bind(this));
    }


    async onQuantityClick(event) {
        const button = event.target.closest('.qty-btn');
        if (!button) return;

        const row = button.closest('[data-item-key]');
        if (!row) {
        console.warn('Could not find cart item row');
        return;
        }

        const input = row.querySelector('.qty-input');
        if (!input) {
        console.warn('Could not find quantity input');
        return;
        }

        const itemKey = row.dataset.itemKey;
        let quantity = parseInt(input.value);

        if (button.dataset.action === 'plus') quantity++;
        if (button.dataset.action === 'minus') quantity = Math.max(0, quantity - 1);

        input.value = quantity;


        // Update Shopify cart
        try {
            const response = await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                id: itemKey,
                quantity
                })
            });

            if (!response.ok) throw new Error('Failed to update cart');

            // Fetch updated HTML for cart section + bubble
            const sectionRes = await fetch('/?sections=cart,cart-icon-bubble');
            const sections = await sectionRes.json();

            this.updateCartContents(sections);

        } catch (error) {
            console.error('Cart update failed:', error);
        }
    }

    updateCartContents(sections) {
        // Replace entire cart section
        const newHTML = sections['cart'];
        if (!newHTML) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(newHTML, 'text/html');

        // Replace cart-page's content
        const newCart = doc.querySelector('cart-page');
        if (newCart) {
            this.innerHTML = newCart.innerHTML;
        }

        // Update cart bubble
        const bubble = document.getElementById('cart-icon-bubble');
        if (bubble && sections['cart-icon-bubble']) {
            bubble.innerHTML = sections['cart-icon-bubble'];
        }
    }

    async onRemoveItem(event) {
        const button = event.target.closest('[data-action="remove"]');
        if (!button) return;

        const itemKey = button.dataset.itemKey;
        if (!itemKey) return;

        try {
            await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemKey, quantity: 0 })
            });

            const sections = await fetch('/?sections=cart,cart-icon-bubble').then(res => res.json());
            this.updateCartContents(sections);

        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    }


    async onClearCart(event) {
        const button = event.target.closest('[data-action="clear"]');
        if (!button) return;

        try {
            const cart = await fetch('/cart.js').then(res => res.json());
            const removePromises = cart.items.map(item =>
            fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.key, quantity: 0 })
            })
            );
            await Promise.all(removePromises);

            const sections = await fetch('/?sections=cart,cart-icon-bubble').then(res => res.json());
            this.updateCartContents(sections);

        } catch (err) {
            console.error('Failed to clear cart:', err);
        }
    }
}

customElements.define('cart-page', CartPage);