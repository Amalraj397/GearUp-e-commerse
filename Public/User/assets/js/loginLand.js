// const loginForm = document.getElementById('loginForm');

// loginForm.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const email = document.getElementById('email').value.trim();
//   const password = document.getElementById('password').value.trim();

//   try {
//     const response = await fetch('/login', {
//       method: 'POST',
//       body: JSON.stringify({ email, password }),
//       headers: { 'Content-Type': 'application/json' },
//     });

//     const data = await response.json();

//     if (data.success) {
//       const user = {
//         firstName: data.user.name,  // ⭐ Save user's firstName here
//       };
//       localStorage.setItem('loggedInUser', JSON.stringify(user));

//       window.location.href = data.redirectTo; // Redirect to landing
//     } else {
//       alert(data.message);
//     }

//   } catch (error) {
//     console.error('Login error:', error);
//   }
// });


import { auth, provider, signInWithPopup } from 'utils/firebase.js';

document.getElementById('loginForm').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userData = {
      email: user.email,
      displayName: user.displayName,
      googleId: user.uid,
      photo: user.photoURL,
    };

    const response = await fetch('/user/google-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
      alert('Google Sign-in Successful!');
      window.location.href = '/';
    } else {
      alert('Signup Failed!');
    }
  } catch (error) {
    console.error(error);
    alert('Error signing in with Google');
  }
});

// Normal login form submit code here if needed (email/password login)
