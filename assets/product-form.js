class ProductForm extends HTMLElement {
    constructor() {
        super();
        this.form = this.querySelector('form');
        this.submitHandler = this.onSubmit.bind(this);
    }

    connectedCallback() {
        this.form.addEventListener('submit', this.submitHandler);
    }

    disconnectedCallback() {
        this.form.removeEventListener('submit', this.submitHandler);
    }

    async onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        const addToCartBtn = this.querySelector('[type="submit"]');
        addToCartBtn.disabled = true;

        try {
            const addedItem = await fetch('/cart/add.js', {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' }
            });

            if (!addedItem.ok) throw new Error('Add to cart failed');

            const addedItemData = await addedItem.json();

            this.showNotification(addedItemData.variant_id);

        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            addToCartBtn.disabled = false;
        }
    }

    async showNotification(variantId) {
        // Fetch updated sections
        const sectionResponse = await fetch(`/cart?sections=cart-notification&variant_id=${variantId}`);
        const sectionData = await sectionResponse.json();

        const cartNotif = document.querySelector('cart-notification');

        if (cartNotif && sectionData['cart-notification']) {
            cartNotif.innerHTML = sectionData['cart-notification'];
            cartNotif.classList.remove('hidden', 'opacity-0', 'translate-y-4');
            cartNotif.classList.add('opacity-100', 'translate-y-0');

            const closeBtn = cartNotif.querySelector('.cart-notification__close');
            closeBtn?.addEventListener('click', () => {
                cartNotif.classList.remove('opacity-100', 'translate-y-0');
                cartNotif.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => cartNotif.classList.add('hidden'), 300);
            });

            // setTimeout(() => {
            //     cartNotif.classList.remove('opacity-100', 'translate-y-0');
            //     cartNotif.classList.add('opacity-0', 'translate-y-4');
            //     setTimeout(() => cartNotif.classList.add('hidden'), 300);
            // }, 8000);

        } else {
            // Fallback: let cart-notification component handle fetching
            document.dispatchEvent(
                new CustomEvent('cart:updated', {
                detail: {
                    variant_id: variantId,
                    quantity,
                },
                })
            );
        }
    }
}

customElements.define('product-form', ProductForm);
