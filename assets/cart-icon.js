class CartIcon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                .cart-icon {
                    width: 28px;
                    height: 28px;
                    display: inline-block;
                    background-image: url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' /%3E%3Cpath d='M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' /%3E%3Cpath d='M17 17h-11v-14h-2' /%3E%3Cpath d='M6 5l14 1l-1 7h-13' /%3E%3C/svg%3E");
                    background-size: contain;
                    background-repeat: no-repeat;
                    margin-top: 5px;
                    position: relative;
                }
                .cart-icon:hover {
                    opacity: 0.7;
                    cursor: pointer;
                }
                .cart-icon:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
                }
                .cart-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    border-radius: 50%;
                    padding: 0.14rem 0.4rem;
                    font-size: 11px;
                    font-weight: bold;
                    color: white;
                    background-color: #e7000b;
                }
            </style>
            <div class="cart-icon">
                <span class="cart-badge" id="cart-badge" hidden>0</span>
            </div>
        `;
        this.updateCartCound();
    }

    getCartSVG () {
        return `
        <svg  xmlns="http://www.w3.org/2000/svg"  width="12"  height="12"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M17 17h-11v-14h-2" /><path d="M6 5l14 1l-1 7h-13" />
        </svg>
        `;
    }

    async updateCartCound() {
        try {
            const response = await fetch('/api/cart/count');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const badge = this.shadowRoot.getElementById('cart-badge');
            if (data.item_count > 0) {
                badge.textContent = data.item_count;
                badge.hidden = false;
            } else {
                badge.hidden = true;
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }
}

customElements.define('cart-icon', CartIcon);