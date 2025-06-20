document.addEventListener('DOMContentLoaded', () => {
    // Remove single item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
        const line = button.getAttribute('data-line');
        fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line: parseInt(line), quantity: 0 })
        }).then(() => location.reload());
        });
    });

    // Clear all items
    document.getElementById('clear-cart')?.addEventListener('click', () => {
        fetch('/cart/clear.js', { method: 'POST' }).then(() => location.reload());
    });

    // Update quantities on form submit
    document.getElementById('cart-form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const updates = Array.from(document.querySelectorAll('input[name="updates[]"]')).map((input, i) => ({
        line: parseInt(input.dataset.line),
        quantity: parseInt(input.value)
        }));

        const updatePromises = updates.map(item => {
        return fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line: item.line, quantity: item.quantity })
        });
        });

        Promise.all(updatePromises).then(() => location.reload());
    });
});