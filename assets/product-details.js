class ProductDetails extends HTMLElement {
    
    connectedCallback() {
        this.sectionId = this.dataset.sectionId || 'product-details'; // Default section ID
        this.productUrl = this.dataset.productUrl || window.location.pathname; // Default to current URL

        this.priceEl = this.querySelector('#product-price'); // Element to display the product price
        this.qtyInput = this.querySelector('#product-quantity'); // Input for product quantity
        this.variantIdInput = this.querySelector('#variant-id'); // Input for variant ID
        this.variantStockEl = this.querySelector('#variant-stock'); // Element to display stock information
        
        this.mainImageEl = this.querySelector('#main-product-image'); // Main product image element
        this.thumbnailEls = this.querySelectorAll('.thumbnail'); // Thumbnail image elements

        // Set the main image to the first thumbnail if available
        this.thumbnailEls.forEach(thumbnail =>
            thumbnail.addEventListener('click', () => this.setMainImage(thumbnail.dataset.full))
        );
        
        
        this.buyNowBtn = this.querySelector('#buy-now'); // Button for "Buy Now" action
        this.addToCartBtn = this.querySelector('#add-to-cart'); // Button for "Add to Cart" action
        this.cart = document.querySelector('cart-notification'); // Cart notification element
        this.qtyButtons = this.querySelector('.qty-btn'); // Quantity adjustment buttons


        // Initialize the main image to the first thumbnail if available
        this.addEventListener('variant:change', (event) => {
            const variant = event.detail.variant;
            const featureImage = variant.featured_image.src || this.mainImageEl.src;
            this.updateWithSectionAPI(variant.id);
            this.variantIdInput.value = variant.id;
            this.setMainImage(featureImage);
        });

        this.productActions = this.querySelector('#product-actions'); // Container for action buttons
        this.addToCartBtn?.addEventListener('click', () => this.addToCart()); // Add to Cart button click handler
        this.buyNowBtn?.addEventListener('click', () => this.buyItNow()); // Buy Now button click handler

        // Handle quantity button clicks
        this.addEventListener('click', (event) => {
            if (event.target.closest('.qty-btn')) this.onQuantityClick(event);
        });

    }

    // Update the URL with the selected variant ID and fetch updated HTML
    async updateWithSectionAPI(variantId) {
        const newUrl = `${this.productUrl}?variant=${variantId}`;
        window.history.replaceState({}, '', newUrl);

        // Continue fetching updated HTML
        fetch(`${newUrl}&section_id=${this.sectionId}`)
            .then(res => res.text())
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const scope = doc.querySelector(`[data-section-id="${this.sectionId}"]`) || doc;

                this.updatePrice(scope);
                this.updateInventoryQuantity(scope);
                this.updateProductMeta(scope);

                const newSku = scope.querySelector('#variant-id');
                if (newSku && this.variantIdInput) {
                    this.variantIdInput.value = newSku.value;
                }


            });
    }


    // Update the price in the product details
    updatePrice(html) {
        const newPrice = html.querySelector('#product-price');
        if (newPrice && this.priceEl) {
            this.priceEl.textContent = newPrice.textContent;
        }
    }

    // Update the inventory quantity in the product details
    updateInventoryQuantity(html) {
        const newStock = html.querySelector('#variant-stock');
        if (newStock && this.variantStockEl) {
            this.variantStockEl.textContent = newStock.textContent;
        }
    }

    // Set the main image and highlight the selected thumbnail
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

    // Update the product actions section with new HTML
    updateProductMeta(html) {
        const newMeta = html.querySelector('#product-actions');
        if (newMeta && this.productActions) {
            this.productActions.innerHTML = newMeta.innerHTML;

            // Re-attach event listeners to the new buttons
            this.addToCartBtn = this.productActions.querySelector('#add-to-cart');
            this.buyNowBtn = this.productActions.querySelector('#buy-now');
            this.addToCartBtn?.addEventListener('click', () => this.addToCart());
            this.buyNowBtn?.addEventListener('click', () => this.buyItNow());
        }
    }

    // Format the price according to Shopify's currency settings
    formatMoney(amount) {
        // Customize based on your Shopify currency settings
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }

    // Add the selected variant to the cart
    async addToCart() {
        const variantId = this.variantIdInput?.value;
        const quantity = parseInt(this.qtyInput?.value);

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

    // Redirect to checkout with the selected variant and quantity
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


    // Handle quantity button clicks to increase or decrease the quantity
    onQuantityClick(event) {
        const button = event.target.closest('.qty-btn');

        let quantity = parseInt(this.qtyInput?.value, 10) || 1;

        if (button.dataset.action === 'plus') quantity++;
        if (button.dataset.action === 'minus') quantity = Math.max(0, quantity - 1);

        this.qtyInput.value = quantity;
    }

  
}

customElements.define('product-details', ProductDetails);
