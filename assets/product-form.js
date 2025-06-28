class ProductForm extends HTMLElement {
    constructor() {
        super();
        this.form = this.querySelector('form');
        this.submitHandler = this.onSubmit.bind(this);
        this.cart = document.querySelector('cart-notification');
    }

    connectedCallback() {
        this.form.addEventListener('submit', this.submitHandler);
    }

    disconnectedCallback() {
        this.form.removeEventListener('submit', this.submitHandler);
    }

    async onSubmit(event) {
        event.preventDefault();

        const config = fetchConfig('javascript');
        
        const formData = new FormData(this.form);
        const addToCartBtn = this.querySelector('[type="submit"]');
        addToCartBtn.disabled = true;

        this.cart?.renderLoading();
        this.cart.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        this.cart.classList.add('opacity-100', 'translate-y-0');

        delete config.headers['Content-Type'];
        config.body = formData;
        

        try {
            const addedItem = await fetch('/cart/add.js', config);

            if (!addedItem.ok) throw new Error('Add to cart failed');

            const addedItemData = await addedItem.json();
            this.cart?.showNotification(addedItemData.key);

        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            addToCartBtn.disabled = false;
        }
    }
}

customElements.define('product-form', ProductForm);
