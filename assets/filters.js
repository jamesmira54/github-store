class CollectionFilters extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.productsGrid = document.querySelector('[data-products-grid]');
    this.clearBtn = this.querySelector('[data-clear-filters]');
    this.spinner = this.querySelector('[data-loading-spinner]');
    this.bindEvents();
    window.addEventListener('popstate', () => this.handlePopState());
    this.attachSortEvent();
  }

  bindEvents() {
    this.form.addEventListener('change', () => this.applyFilters());
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.applyFilters();
    });

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clearFilters());
    }
  }

  showLoading(state = true) {
    if (!this.spinner) return;
    this.spinner.style.display = state ? 'block' : 'none';
  }


  applyFilters() {
    const formData = new FormData(this.form);

    // Get sort_by from dropdown if exists
    const sortSelect = document.querySelector('#CollectionSortForm select');
    if (sortSelect) {
      formData.set('sort_by', sortSelect.value);
    }

    const query = new URLSearchParams(formData).toString();
    const url = `${window.location.pathname}?${query}`;

    this.showLoading(true);

    fetch(url)
      .then(res => res.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newGrid = doc.querySelector('[data-products-grid]');
        const newSort = doc.querySelector('#CollectionSortForm');

        if (newGrid) this.productsGrid.innerHTML = newGrid.innerHTML;
        if (newSort) {
          document.querySelector('#CollectionSortForm').innerHTML = newSort.innerHTML;
          this.attachSortEvent(); // Rebind sort handler
        }

        history.pushState(null, '', url);
        this.showLoading(false);
      });
  }

  async handlePopState() {
    this.showLoading(true);
    const response = await fetch(window.location.href);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newGrid = doc.querySelector('[data-products-grid]');
    const newForm = doc.querySelector('#CollectionFiltersForm');

    if (newGrid) this.productsGrid.innerHTML = newGrid.innerHTML;
    if (newForm) this.form.innerHTML = newForm.innerHTML;
    this.showLoading(false);
  }

  clearFilters() {
    const inputs = this.form.querySelectorAll('input[type="checkbox"], input[type="number"], select');
    inputs.forEach(input => {
      if (input.type === 'checkbox') input.checked = false;
      else input.value = '';
    });
    this.applyFilters();
  }

  attachSortEvent() {
    const sortForm = document.querySelector('#CollectionSortForm');
    if (!sortForm) return;

    sortForm.addEventListener('change', () => {
      const sortVal = sortForm.querySelector('select').value;
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', sortVal);

      // Force filter reapply with new sort
      const hiddenInput = this.form.querySelector('input[name="sort_by"]');
      if (hiddenInput) {
        hiddenInput.value = sortVal;
      } else {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'sort_by';
        input.value = sortVal;
        this.form.appendChild(input);
      }

      this.applyFilters();
    });
  }
}

customElements.define('collection-filters', CollectionFilters);
