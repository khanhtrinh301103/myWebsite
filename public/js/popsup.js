document.addEventListener('DOMContentLoaded', function () {
    const cart = [];
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
  
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
      button.addEventListener('click', function (e) {
        const productCard = e.target.closest('.card-body');
        const productName = productCard.querySelector('.card-title').textContent;
        const productPrice = parseFloat(productCard.querySelector('.card-text strong').nextSibling.textContent.replace('$', ''));
        const productImage = productCard.querySelector('img').src;
        
        addToCart({ name: productName, price: productPrice, image: productImage });
      });
    });
  
    function addToCart(product) {
      const existingProductIndex = cart.findIndex(item => item.name === product.name);
  
      if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
      } else {
        product.quantity = 1;
        cart.push(product);
      }
  
      updateCartUI();
    }
  
    function updateCartUI() {
      cartCount.textContent = cart.reduce((total, product) => total + product.quantity, 0);
      cartItemsContainer.innerHTML = '';
  
      let subtotal = 0;
  
      cart.forEach((product, index) => {
        const productElement = document.createElement('div');
        productElement.className = 'd-flex justify-content-between align-items-center mb-2';
        productElement.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px;">
          <div>
            <strong>${product.name}</strong>
            <small class="d-block">$${product.price.toFixed(2)}</small>
            <div class="d-flex align-items-center">
              <button class="btn btn-secondary btn-sm btn-decrease" data-index="${index}">-</button>
              <span class="mx-2">${product.quantity}</span>
              <button class="btn btn-secondary btn-sm btn-increase" data-index="${index}">+</button>
            </div>
          </div>
          <button class="btn btn-danger btn-sm" data-index="${index}">&times;</button>
        `;
  
        cartItemsContainer.appendChild(productElement);
        subtotal += product.price * product.quantity;
  
        productElement.querySelector('.btn-decrease').addEventListener('click', function (e) {
          e.stopPropagation();
          decreaseQuantity(index);
        });
  
        productElement.querySelector('.btn-increase').addEventListener('click', function (e) {
          e.stopPropagation();
          increaseQuantity(index);
        });
  
        productElement.querySelector('.btn-danger').addEventListener('click', function (e) {
          e.stopPropagation();
          removeFromCart(index);
        });
      });
  
      cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
  
    function decreaseQuantity(index) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        updateCartUI();
      }
    }
  
    function increaseQuantity(index) {
      cart[index].quantity += 1;
      updateCartUI();
    }
  
    function removeFromCart(index) {
      cart.splice(index, 1);
      updateCartUI();
    }
  });
  