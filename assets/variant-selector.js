class VariantSelector extends HTMLElement {
    // This custom element handles the selection of product variants
    async connectedCallback() {
        this.productUrl = this.closest('product-details')?.dataset.productUrl || window.location.pathname;
        this.inputs = this.querySelectorAll('.variant-option');
        
         this.fetchProductData().then(product => {
            this.product = product;
            this.bindEvents();
            this.triggerFromUrlVariant(); // ✅ Load from URL if available
        });
    }

    bindEvents() {
        this.inputs.forEach(input => {
            input.addEventListener('change', () => this.onOptionChange());
        });
    }

    // This method updates the variant ID in the section API
    async fetchProductData() {
        const res = await fetch(`${this.productUrl}.js`);
        return await res.json();
    }


    triggerFromUrlVariant() {
        const params = new URLSearchParams(window.location.search);
        const variantId = parseInt(params.get('variant'), 10);
        if (!variantId) return;

        const variant = this.product.variants.find(v => v.id === variantId);
        if (variant) {
            // Optionally, mark corresponding inputs as checked
            variant.options.forEach((val, index) => {
            const input = [...this.inputs].find(
                i => parseInt(i.dataset.index, 10) === index && i.value === val
            );
            if (input) input.checked = true;
            });

            this.dispatchVariantChange(variant);
        }
    }

    getSelectedOptions() {
        const selected = [];
        this.inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            if(input.checked) {
                selected[index] = input.value;
            }
        });

        return selected;
    }

    findMatchingVariant(selectedOptions) {
        return this.product.variants.find(v =>
            v.options.every((val, i) => val === selectedOptions[i])
        );
    }
    

    dispatchVariantChange(variant) {
        this.dispatchEvent(new CustomEvent('variant:change', {
            detail: { variant },
            bubbles: true,
            composed: true
        }));
    }

    onOptionChange() {
        const selectedOptions = this.getSelectedOptions();
        const variant = this.findMatchingVariant(selectedOptions);
        if (variant) this.dispatchVariantChange(variant);
    }


    dispatchInitialVariant() {
        const selectedOptions = this.getSelectedOptions();
        const variant = this.findMatchingVariant(selectedOptions);
        if (variant) {
            this.dispatchVariantChange(variant);
        }
    }

}

customElements.define('variant-selector', VariantSelector);