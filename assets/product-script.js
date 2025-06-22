// Proceed to checkout functionality
document.addEventListener('DOMContentLoaded', () => {
  const buyNowBtn = document.getElementById('buy-now');
  const quantityInput = document.getElementById('quantity');

  buyNowBtn.addEventListener('click', async () => {
    const selectedInput = document.querySelector('input[name="variant-id"]:checked');
    const quantity = parseInt(quantityInput.value) || 1;

    let variantId;

    if (selectedInput) {
      variantId = selectedInput.value;
    } else {
      variantId = document.getElementById('buy-now').dataset.defaultVariantId;
    }

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity
        })
      });

      if (res.ok) {
        // Redirect to checkout after successful add
        window.location.href = '/checkout';
      } else {
        const error = await res.json();
        alert(error.description || 'Could not add product to cart.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  });
});


// Product gallery and variant swatch
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
  const variantRadios = document.querySelectorAll('input[name="variant-id"]');

  const initialThumb = thumbnails.find(t => t.dataset.full === mainImage.src);

  if(variantRadios.length > 0 && variantRadios[0].dataset.image != '') {
    const matchedThumbFromVariant = [...thumbnails].find(thumb => thumb.dataset.full === variantRadios[0].dataset.image);
    setActiveThumb(parseInt(matchedThumbFromVariant.dataset.index));
    loadImage(parseInt(matchedThumbFromVariant.dataset.index));
  } else if (initialThumb) {
    currentIndex = parseInt(initialThumb.dataset.index);
    setActiveThumb(currentIndex);
  } else {
    setActiveThumb(0);
  }

  // Variant swatch

  variantRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const newImage = e.target.dataset.image;
      if (!newImage) return;

      // Update main image
      mainImage.src = newImage;

      // Find the matching thumbnail and set it as active
      const matchedThumb = [...thumbnails].find(thumb => thumb.dataset.full === newImage);
      if (matchedThumb) {
        currentIndex = parseInt(matchedThumb.dataset.index);
        setActiveThumb(currentIndex);
      } else {
        setActiveThumb(-1); // Remove all active if no match
      }
    });
  });

});


document.addEventListener('DOMContentLoaded', () => {
  const priceEl = document.getElementById('product-price');
  const quantityInput = document.getElementById('quantity');
  const variantRadios = document.querySelectorAll('input[name="variant-id"]');

  const defaultPrice = parseInt(document.getElementById('product-data')?.dataset.defaultPrice || 0);
  let selectedPrice = defaultPrice;

  const selectedInput = document.querySelector('input[name="variant-id"]:checked');
  if (selectedInput) {
    selectedPrice = parseInt(selectedInput.dataset.price);
  }



  // Format price as currency (you can set this dynamically via cart.currency)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'PHP' // Replace with store currency if dynamic
    }).format(amount / 100);
  };

  function updatePriceDisplay() {
    const quantity = parseInt(quantityInput.value) || 1;
    const total = selectedPrice * quantity;
    priceEl.textContent = formatCurrency(total);
  }

  // Listen to variant change
  variantRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      selectedPrice = parseInt(radio.dataset.price);
      updatePriceDisplay();
    });
  });

  // Listen to quantity change
  quantityInput.addEventListener('input', () => {
    updatePriceDisplay();
  });

  // Initialize price on page load
  updatePriceDisplay();
});