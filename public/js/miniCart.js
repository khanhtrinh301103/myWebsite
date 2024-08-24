document.addEventListener("DOMContentLoaded", function () {
    const cartDropdown = document.getElementById('cartDropdown');
  
    cartDropdown.addEventListener('click', async function () {
      try {
        const response = await fetch('/buyer/mini-cart');
        const { cartItems, subtotal } = await response.json();
  
        const miniCartItems = document.getElementById('mini-cart-items');
        miniCartItems.innerHTML = '';
  
        if (cartItems.length > 0) {
          cartItems.forEach(item => {
            miniCartItems.innerHTML += `
              <div class="mini-cart-item d-flex justify-content-between align-items-center">
                <img src="${item.productImage}" alt="${item.productName}" style="width: 50px; height: 50px; margin-right: 10px;">
                <div>
                  <span>${item.productName}</span><br>
                  <span>${item.quantity} x $${item.price.toFixed(2)}</span>
                </div>
                <div>
                  <button class="btn btn-sm btn-secondary btn-decrease" data-id="${item.id}">-</button>
                  <button class="btn btn-sm btn-secondary btn-increase" data-id="${item.id}">+</button>
                </div>
              </div>
            `;
          });
  
          miniCartItems.innerHTML += `
            <div class="d-flex justify-content-between mt-3">
              <strong>Subtotal:</strong>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
          `;
        } else {
          miniCartItems.innerHTML = '<p>Your cart is empty.</p>';
        }
      } catch (error) {
        console.error('Error fetching mini cart:', error);
      }
    });
  
    // Xử lý tăng/giảm số lượng trong mini-cart
    document.addEventListener('click', async function (event) {
      if (event.target.classList.contains('btn-decrease') || event.target.classList.contains('btn-increase')) {
        const id = event.target.dataset.id;
        const isIncrease = event.target.classList.contains('btn-increase');
        const quantityChange = isIncrease ? 1 : -1;
  
        try {
          const response = await fetch(`/buyer/cart/update/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ change: quantityChange })
          });
  
          if (response.ok) {
            const { cartItems, subtotal } = await response.json();
            const miniCartItems = document.getElementById('mini-cart-items');
            miniCartItems.innerHTML = '';
  
            if (cartItems.length > 0) {
              cartItems.forEach(item => {
                miniCartItems.innerHTML += `
                  <div class="mini-cart-item d-flex justify-content-between align-items-center">
                    <img src="${item.productImage}" alt="${item.productName}" style="width: 50px; height: 50px; margin-right: 10px;">
                    <div>
                      <span>${item.productName}</span><br>
                      <span>${item.quantity} x $${item.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <button class="btn btn-sm btn-secondary btn-decrease" data-id="${item.id}">-</button>
                      <button class="btn btn-sm btn-secondary btn-increase" data-id="${item.id}">+</button>
                    </div>
                  </div>
                `;
              });
  
              miniCartItems.innerHTML += `
                <div class="d-flex justify-content-between mt-3">
                  <strong>Subtotal:</strong>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
              `;
            } else {
              miniCartItems.innerHTML = '<p>Your cart is empty.</p>';
            }
          } else {
            console.error('Error updating quantity');
          }
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      }
    });
  });
  