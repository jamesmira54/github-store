document.addEventListener('DOMContentLoaded', () => {
    const variantRadios = document.querySelectorAll('input[name="variant-id"]');
    let selectedVariant = "{{ product.selected_or_first_available_variant.id }}";

    variantRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
        selectedVariant = e.target.value;
        });
    });

    document.getElementById('buy-now').addEventListener('click', async () => {
        const quantity = parseInt(document.getElementById('quantity').value) || 1;

        try {
        const res = await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
            id: selectedVariant,
            quantity: quantity
            })
        });

        if (res.ok) {
            window.location.href = '/checkout';
        } else {
            alert('Unable to add product to cart.');
        }
        } catch (err) {
        console.error(err);
        alert('Something went wrong.');
        }
    });
});

 document.addEventListener('DOMContentLoaded', () => {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = [...document.querySelectorAll('.thumbnail')];
    const nextBtn = document.getElementById('next-img');
    const prevBtn = document.getElementById('prev-img');
    
    let currentIndex = 0;

    function setActiveThumb(index) {
      thumbnails.forEach(t => t.classList.remove('ring-2', 'ring-blue-600'));
      thumbnails[index]?.classList.add('ring-2', 'ring-blue-600');
    }

    // Load image by index
    function loadImage(index) {
      const targetThumb = thumbnails[index];
      if (!targetThumb) return;

      const fullSrc = targetThumb.dataset.full;
      mainImage.src = fullSrc;
      currentIndex = index;
      setActiveThumb(index);
    }

    // Thumbnail click
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => loadImage(index));
    });

    // Next / Prev buttons
    nextBtn.addEventListener('click', () => {
      const next = (currentIndex + 1) % thumbnails.length;
      loadImage(next);
    });

    prevBtn.addEventListener('click', () => {
      const prev = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
      loadImage(prev);
    });

    // Set initial image index
    const initialThumb = thumbnails.find(t => t.dataset.full === mainImage.src);
    if (initialThumb) {
      currentIndex = parseInt(initialThumb.dataset.index);
      setActiveThumb(currentIndex);
    } else {
      setActiveThumb(0);
    }
  });