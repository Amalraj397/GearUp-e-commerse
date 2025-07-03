  

  const modal = document.getElementById('emailModal');
  const btn = document.getElementById('forgotPasswordBtn');
  const span = document.querySelector('.close');
  const form = document.getElementById('emailForm');

  // Open modal
  btn.onclick = () => {
    modal.style.display = 'block';
  };

  // Close modal
  span.onclick = () => {
    modal.style.display = 'none';
  };

  // Close modal on outside click
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  // Submit email form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('modalEmail').value;

    // Optional: show SweetAlert/Toastify here

    const response = await fetch('/forgotPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.success) {
      // Redirect to OTP page or show next step
      window.location.href = '/forgotGetotp';
    } else {
      alert(data.message); // or show error with SweetAlert
    }
  });