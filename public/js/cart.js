document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.btn-decrease').forEach(button => {
      button.addEventListener('click', function () {
        const id = button.getAttribute('data-id');
        const quantitySpan = button.nextElementSibling;
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 1) {
          quantity--;
          updateQuantity(id, quantity);
        }
      });
    });
  
    document.querySelectorAll('.btn-increase').forEach(button => {
      button.addEventListener('click', function () {
        const id = button.getAttribute('data-id');
        const quantitySpan = button.previousElementSibling;
        let quantity = parseInt(quantitySpan.textContent);
        quantity++;
        updateQuantity(id, quantity);
      });
    });
  
    function updateQuantity(id, quantity) {
      fetch(`/buyer/cart/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      }).then(response => {
        if (response.ok) {
          window.location.reload();
        }
      });
    }
  });
