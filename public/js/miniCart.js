document.addEventListener("DOMContentLoaded", function () {
  const cartDropdown = document.getElementById('cartDropdown');

  cartDropdown.addEventListener('click', async function () {
    try {
      const response = await fetch('/buyer/mini-cart');
      const miniCartHTML = await response.text();
      document.getElementById('mini-cart-container').innerHTML = miniCartHTML;
    } catch (error) {
      console.error('Error loading mini cart:', error);
    }
  });

  // Cập nhật các class tương tác với sự kiện
  document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('mini-btn-decrease') || event.target.classList.contains('mini-btn-increase')) {
      const id = event.target.dataset.id;
      const isIncrease = event.target.classList.contains('mini-btn-increase');
      
      // Lấy giá trị quantity hiện tại
      const quantityElement = event.target.closest('tr').querySelector('.mini-quantity');
      let quantity = parseInt(quantityElement.textContent);
  
      // Tăng hoặc giảm số lượng
      quantity = isIncrease ? quantity + 1 : quantity - 1;
  
      // Kiểm tra nếu quantity hợp lệ
      if (quantity <= 0) {
        quantity = 1;  // Không cho phép quantity nhỏ hơn 1
      }
  
      // Gửi yêu cầu cập nhật số lượng đến server
      try {
        const response = await fetch(`/buyer/cart/update/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity })  // Đảm bảo gửi đúng quantity
        });
  
        if (response.ok) {
          const miniCartHTML = await response.text();
          document.getElementById('mini-cart-container').innerHTML = miniCartHTML;
        } else {
          console.error('Error updating quantity');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  });
  

  document.addEventListener('click', function (event) {
    if (event.target.id === 'mini-view-cart') {
      window.location.href = '/buyer/cart';
    } else if (event.target.id === 'mini-checkout-btn') {
      window.location.href = '/buyer/checkout';
    }
  });
});
