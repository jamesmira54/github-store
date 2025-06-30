class ProductDetails extends HTMLElement {
    connectedCallback() {
        this.sectionId = this.dataset.sectionId || 'product-details';
        this.productUrl = this.dataset.productUrl || window.location.pathname;

        this.priceEl = this.querySelector('#product-price');
        this.qtyInput = this.querySelector('#product-quantity');
        this.variantIdInput = this.querySelector('#variant-id');
        this.buyNowBtn = this.querySelector('#buy-now');

        this.mainImageEl = this.querySelector('#main-product-image');
        this.thumbnailEls = this.querySelectorAll('.thumbnail');
        this.thumbnailEls.forEach(thumbnail =>
            thumbnail.addEventListener('click', () => this.setMainImage(thumbnail.dataset.full))
        );


        this.addToCartBtn = this.querySelector('#add-to-cart');
        this.buyNowBtn = this.querySelector('#buy-now');
        this.cart = document.querySelector('cart-notification');
        this.qtyButtons = this.querySelector('.qty-btn');


        // Listen to child <variant-selector>
        this.addEventListener('variant:change', (event) => {
            const variant = event.detail.variant;
            const featureImage = variant.featured_image.src || this.mainImageEl.src;
            this.updateWithSectionAPI(variant.id);
            this.variantIdInput.value = variant.id;
            this.setMainImage(featureImage);
        });

        this.addToCartBtn?.addEventListener('click', () => this.addToCart());
        this.buyNowBtn?.addEventListener('click', () => this.buyItNow());

        this.addEventListener('click', (event) => {
            if (event.target.closest('.qty-btn')) this.onQuantityClick(event);
        });

    }

    async updateWithSectionAPI(variantId) {
        const newUrl = `${this.productUrl}?variant=${variantId}`; // Update URL without reloading
        window.history.replaceState({}, '', newUrl);

        // Continue fetching updated HTML
        fetch(`${newUrl}&section_id=${this.sectionId}`)
            .then(res => res.text())
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const scope = doc.querySelector(`[data-section-id="${this.sectionId}"]`) || doc;

                this.updatePrice(scope);

                const newSku = scope.querySelector('#variant-id');
                if (newSku && this.variantIdInput) {
                    this.variantIdInput.value = newSku.value;
                }

            });
    }


    updatePrice(html) {
        const newPrice = html.querySelector('#product-price');
        if (newPrice && this.priceEl) {
            this.priceEl.textContent = newPrice.textContent;
        }
    }

    setMainImage(imageUrl) {
        if (this.mainImageEl) {
            this.mainImageEl.src = imageUrl;
        }

        this.thumbnailEls.forEach(thumbnail => {
            thumbnail.classList.remove('ring-2', 'ring-blue-500');
            if (thumbnail.dataset.full === imageUrl) {
            thumbnail.classList.add('ring-2', 'ring-blue-500');
            }
        });
    }

    formatMoney(amount) {
        // Customize based on your Shopify currency settings
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }


    async addToCart() {
        const variantId = this.variantIdInput?.value;
        const quantity = parseInt(this.qtyInput?.value, 10) || 1;

        this.cart?.renderLoading();
        this.cart.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        this.cart.classList.add('opacity-100', 'translate-y-0');

        if (!variantId) {
            alert("Please select a variant.");
            return;
        }

        try {
            const res = await fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: variantId, quantity })
            });

            if (res.ok) {
                const addedItemData = await res.json();
                this.cart?.showNotification(addedItemData.key);
            } else {
                const err = await   res.json();
                alert(err.description || "Failed to add to cart.");
            }
        } catch (e) {
            alert("Error adding to cart.");
            console.error(e);
        }
    }


    buyItNow() {
        const variantId = this.variantIdInput?.value;
        const quantity = parseInt(this.qtyInput?.value, 10) || 1;

         if (!variantId) {
            alert("Please select a variant.");
            return;
        }

        // Build direct checkout URL
        const checkoutUrl = `/cart/${variantId}:${quantity}`;

        // Redirect to checkout
        window.location.href = checkoutUrl;
    }

    onQuantityClick(event) {
        const button = event.target.closest('.qty-btn');

        let quantity = parseInt(this.qtyInput?.value, 10) || 1;

        if (button.dataset.action === 'plus') quantity++;
        if (button.dataset.action === 'minus') quantity = Math.max(0, quantity - 1);

        this.qtyInput.value = quantity;
    }

  
}

customElements.define('product-details', ProductDetails);
