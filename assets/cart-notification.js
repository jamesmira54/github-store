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

    hideNotification() {
        this.classList.remove('opacity-100', 'translate-y-0');
        this.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            this.classList.add('hidden');
        }, 300); 
    }
}

customElements.define('cart-notification', CartNotification);
