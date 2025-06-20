class ProductForm extends HTMLElement {
    /**
     * Define the custom element and its shadow DOM
    */
    constructor() {
        super();
        this.form = this.querySelector('form');
        this.submitHandler = this.onSubmit.bind(this);
    }

    /**
     * Initialize the custom element and set up event listeners
    */
    connectedCallback() {
        this.form.addEventListener('submit', this.submitHandler);
    }

    /**
     * Clean up event listeners when the element is removed from the DOM
    */
    disconnectedCallback() {
        this.form.removeEventListener('submit', this.submitHandler);
    }

    async onSubmit(event) {
        event.preventDefault();
        
        // Validate the form before submission
        const formData = new FormData(this.form);
        const addToCartBtn = this.querySelector('[type="submit"]');
        addToCartBtn.disabled = true;

        // Show loading state in the cart notification
        const cartNotification = document.querySelector('cart-notification');
        if (cartNotification) {
            cartNotification.renderLoading();
            cartNotification.classList.remove('hidden', 'opacity-0', 'translate-y-4');
            cartNotification.classList.add('opacity-100', 'translate-y-0');
        }

        const action = this.form.getAttribute('action') || '/cart/add.js';
        const method = this.form.getAttribute('method') || 'POST';

        try {
            const response = await fetch(action, {
                method: method,
                body: formData,
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Add to cart failed');
            }

            const addedItem = await response.json();

            const cartRes = await fetch('/cart.js');
            const cartData = await cartRes.json();

            // Try to match the item by variant ID
            const matchedItem = cartData.items.find(i => i.variant_id === addedItem.variant_id);

            // Update the cart icon count
            document.dispatchEvent(
                new CustomEvent('cart:updated', { detail: matchedItem })
            );

        } catch (error) {
        console.error('Error submitting form:', error);
        } finally {
            addToCartBtn.disabled = false;
        }
    }
}

customElements.define('product-form', ProductForm);