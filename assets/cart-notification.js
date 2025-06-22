class CartNotification extends HTMLElement {
    constructor() {
        super();
        this.sectionId = this.getAttribute('section-id');
        this.rendered = false;
    }

    connectedCallback() {
        document.addEventListener('cart:updated', this.showNotification.bind(this));
        this.renderLoading();
    }

    renderLoading() {
        this.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-xl max-w-sm w-full">
            <p class="text-sm text-gray-500">Adding to cart...</p>
        </div>
        `;
    }

    async showNotification(event) {
        const item = event.detail;
        
        console.log(event);
        this.innerHTML = `
            <div class="bg-white border rounded-lg p-4 max-w-sm w-full shadow-xl">
                <button class="cart-notification__close absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
                <div class="flex gap-4 items-center">
                    <img src="${item.image}" alt="${item.product_title}" class="w-16 h-16 object-cover rounded" />
                    <div>
                        <p class="text-sm font-medium text-gray-900">${item.product_title}</p>
                        <p class="text-sm text-gray-600 mt-2">Price: ₱${(item.final_price / 100).toFixed(2)}  |  Qty: ${item.quantity}</p>
                    </div>
                </div>
                <div class="flex justify-between mt-4 gap-2">
                    <a href="/cart" class="w-1/2 text-center bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 font-semibold py-2 px-3 rounded">View Cart</a>
                    <a href="/checkout" class="w-1/2 text-center bg-black hover:bg-gray-900 text-sm text-white font-semibold py-2 px-3 rounded">Checkout</a>
                </div>
            </div>
        `;

        this.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        this.classList.add('opacity-100', 'translate-y-0');

        this.attachEvents();


        // Set a timeout to hide the notification after 8 seconds
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.hideNotification();
        }, 8000); 
    }

    attachEvents() {
        const closeBtn = this.querySelector('.cart-notification__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideNotification());
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
