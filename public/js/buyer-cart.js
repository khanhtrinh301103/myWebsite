// Update subtotal, tax, and grand total
function updateSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const grandTotalElement = document.getElementById('grand-total');
  
    let subtotal = 0;
    document.querySelectorAll('.cart-table tbody tr').forEach(row => {
      const total = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace('$', ''));
      subtotal += total;
    });
  
    const tax = subtotal * 0.10; // 10% tax
    const grandTotal = subtotal + tax;
  
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`;
  }
  
  // Enable or disable the checkout button based on the terms checkbox
  document.getElementById('terms-check').addEventListener('change', function() {
    document.getElementById('proceed-checkout').disabled = !this.checked;
  });
  
  document.getElementById('clear-cart').addEventListener('click', async function () {
    try {
      const response = await fetch('/buyer/cart/clear', {
        method: 'POST'
      });
  
      if (response.ok) {
        document.querySelectorAll('.cart-table tbody tr').forEach(row => row.remove());
        updateSummary();
      } else {
        alert('Error clearing cart');
      }
    } catch (error) {
      console.error('Error clearing cart: ', error);
    }
  });
  
  async function updateQuantity(id, quantity) {
    // Kiểm tra nếu quantity là số hợp lệ
    quantity = parseInt(quantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Invalid quantity');
      return;
    }
  
    try {
      const response = await fetch(`/buyer/cart/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: quantity })
      });
  
      if (response.ok) {
        const totalElement = document.querySelector(`.btn-decrease[data-id="${id}"]`).closest('tr').querySelector('td:nth-child(4)');
        const price = parseFloat(totalElement.closest('tr').querySelector('td:nth-child(2)').textContent.replace('$', ''));
        totalElement.textContent = `$${(price * quantity).toFixed(2)}`;
        updateSummary();
      } else {
        alert('Error updating quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }
  
  
  document.querySelectorAll('.btn-decrease').forEach(button => {
    button.addEventListener('click', function (e) {
      const id = e.target.dataset.id;
      const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
      let quantity = parseInt(quantityInput.value);
  
      if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
        updateQuantity(id, quantity);
      }
    });
  });
  
  document.querySelectorAll('.btn-increase').forEach(button => {
    button.addEventListener('click', function (e) {
      const id = e.target.dataset.id;
      const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
      let quantity = parseInt(quantityInput.value);
  
      quantity++;
      quantityInput.value = quantity;
      updateQuantity(id, quantity);
    });
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function (e) {
      const id = e.target.dataset.id;
      let quantity = parseInt(e.target.value);
  
      if (quantity < 1) {
        quantity = 1;
        e.target.value = quantity;
      }
      updateQuantity(id, quantity);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', async function (e) {
      const id = e.target.dataset.id;
  
      try {
        const response = await fetch(`/buyer/cart/delete/${id}`, {
          method: 'POST'
        });
  
        if (response.ok) {
          e.target.closest('tr').remove();
          updateSummary();
        } else {
          alert('Error deleting item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    });
  });
  
  updateSummary(); // Initial summary update
  