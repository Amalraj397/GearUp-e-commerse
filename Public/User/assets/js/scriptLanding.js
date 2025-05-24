// import { auth, signOut } from "./utils/firebase.js";    grok


// document.addEventListener('DOMContentLoaded', function() {
//     // Navigation menu hover effect
//     const navLinks = document.querySelectorAll('.nav-link');

//     navLinks.forEach(link => {
//         link.addEventListener('mouseenter', function() {
//             this.style.color = '#ff6600';
//         });

//         link.addEventListener('mouseleave', function() {
//             this.style.color = '#ffffff';
//         });
//     });

//     // Hero slider functionality
//     const dots = document.querySelectorAll('.dot');
//     const prevBtn = document.querySelector('.prev');
//     const nextBtn = document.querySelector('.next');

//     // Sample bike data for the slider
//     const bikes = [
//         {
//             name: 'Vanquish Comp Carbon',
//             price: '$1195.00',
//             description: 'High-end carbon frame provides efficiency and stiffness through the use of optimized layered tubes.'
//         },
//         {
//             name: 'Mountain Explorer Pro',
//             price: '$1495.00',
//             description: 'Designed for the toughest trails with advanced suspension and premium components.'
//         },
//         {
//             name: 'Road Master Elite',
//             price: '$1295.00',
//             description: 'Lightweight frame and aerodynamic design for maximum speed on the open road.'
//         },
//         {
//             name: 'Urban Commuter X1',
//             price: '$895.00',
//             description: 'Perfect for city riding with comfortable geometry and practical features.'
//         }
//     ];

//     let currentSlide = 0;

//     // Function to update the hero content
//     function updateSlide(index) {
//         // Update text content
//         document.querySelector('.hero-text h2').textContent = bikes[index].name;
//         document.querySelector('.price').textContent = bikes[index].price;
//         document.querySelector('.hero-text p').textContent = bikes[index].description;

//         // Update active dot
//         dots.forEach(dot => dot.classList.remove('active'));
//         dots[index].classList.add('active');

//         // Add animation effect
//         const heroImage = document.getElementById('hero-bike');
//         heroImage.style.opacity = '0';

//         setTimeout(() => {
//             heroImage.style.opacity = '1';
//             heroImage.style.transform = 'translate(-50%, -50%) scale(1.05)';

//             setTimeout(() => {
//                 heroImage.style.transform = 'translate(-50%, -50%) scale(1)';
//             }, 300);
//         }, 300);
//     }

//     // Event listeners for dots
//     dots.forEach((dot, index) => {
//         dot.addEventListener('click', () => {
//             currentSlide = index;
//             updateSlide(currentSlide);
//         });
//     });

//     // Event listeners for arrow buttons
//     prevBtn.addEventListener('click', () => {
//         currentSlide = (currentSlide - 1 + bikes.length) % bikes.length;
//         updateSlide(currentSlide);
//     });

//     nextBtn.addEventListener('click', () => {
//         currentSlide = (currentSlide + 1) % bikes.length;
//         updateSlide(currentSlide);
//     });

//     // Auto slide every 5 seconds
//     setInterval(() => {
//         currentSlide = (currentSlide + 1) % bikes.length;
//         updateSlide(currentSlide);
//     }, 5000);

//     // Parallax effect for hero section
//     const heroSection = document.querySelector('.hero');

//     window.addEventListener('scroll', () => {
//         const scrollPosition = window.scrollY;
//         if (scrollPosition < 500) {
//             const heroImage = document.getElementById('hero-bike');
//             heroImage.style.transform = `translate(-50%, -${50 - scrollPosition * 0.05}%)`;

//             const orangeBg = document.querySelector('.orange-bg');
//             orangeBg.style.transform = `translateX(${scrollPosition * 0.05}%)`;
//         }
//     });

//     // Button hover effects
//     const buttons = document.querySelectorAll('.btn');

//     buttons.forEach(button => {
//         button.addEventListener('mouseenter', function() {
//             this.style.transform = 'translateY(-3px)';
//             this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
//         });

//         button.addEventListener('mouseleave', function() {
//             this.style.transform = 'translateY(0)';
//             this.style.boxShadow = 'none';
//         });
//     });

//     // Category card hover effects
//     const categoryCards = document.querySelectorAll('.category-card');

//     categoryCards.forEach(card => {
//         card.addEventListener('mouseenter', function() {
//             const content = this.querySelector('.category-content');
//             content.style.transform = 'translateY(-10px)';
//         });

//         card.addEventListener('mouseleave', function() {
//             const content = this.querySelector('.category-content');
//             content.style.transform = 'translateY(0)';
//         });
//     });
// });

// ----------------------------------------------------------------------------

// function togglePassword(id) {
//       const input = document.getElementById(id);
//       if (input.type === "password") {
//         input.type = "text";
//       } else {
//         input.type = "password";
//       }
//     }

//     document.getElementById("signupForm").addEventListener("submit", function(e) {
//       e.preventDefault();
//       alert("Signup Successful!");
//     });
// ---------------------------------------------------------------------------------------

// document.getElementById("loginForm").addEventListener("submit", function(e) {
//     e.preventDefault();
//     alert("Login Successful!");
//   });

document.addEventListener("DOMContentLoaded", function () {
  // Navigation menu hover effect
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      this.style.color = "#ff6600";
    });

    link.addEventListener("mouseleave", function () {
      this.style.color = "#ffffff";
    });
  });

  // document.addEventListener("DOMContentLoaded", () => {
  //     const userDisplayName = document.getElementById("user-name");

  //     const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  //     if (loggedInUser && loggedInUser.firstName) {
  //       userDisplayName.innerText = `Hi, welcome ${loggedInUser.firstName} 👋`;
  //     } else if (loggedInUser && loggedInUser.displayName) {
  //       userDisplayName.innerText = `Hi, welcome ${loggedInUser.displayName} 👋`;
  //     }
  //   });

  // -----------------------------------
  //     document.addEventListener("DOMContentLoaded", () => {
  //     const userDisplayName = document.getElementById("user-name");
  //     const loginLink = document.getElementById("login-link");
  //     const signupLink = document.getElementById("signup-link");
  //     const logoutLink = document.getElementById("logout-link");

  //     const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));  // assign the localy stored name into a veriable

  //     if (loggedInUser) {
  //     //   let name = loggedInUser.firstName || loggedInUser.displayName || "Guest";
  //     let name = loggedInUser.name || loggedInUser.firstName || loggedInUser.displayName ;

  //       userDisplayName.innerText = `Hi, welcomeee ${name}`;

  //       // Show user name and logout, hide login/signup
  //       userDisplayName.style.display = "block";
  //       logoutLink.style.display = "block";
  //       loginLink.style.display = "none";
  //       signupLink.style.display = "none";
  //     } else {
  //       // If no user logged in
  //       userDisplayName.style.display = "none";
  //       logoutLink.style.display = "none";
  //       loginLink.style.display = "block";
  //       signupLink.style.display = "block";
  //     }

  //     // 🔥 Add logout functionality here:
  //     logoutLink.addEventListener("click", () => {
  //       localStorage.removeItem("loggedInUser");
  //     });
  //   });

  //   ---------------------------

  document.addEventListener("DOMContentLoaded", () => {
      const userDisplayName = document.getElementById("user-name");
      const loginLink = document.getElementById("login-link");
      const signupLink = document.getElementById("signup-link");
      const logoutLink = document.getElementById("logout-link");

      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

      if (loggedInUser) {
        const name = loggedInUser.displayName || loggedInUser.firstName || "Guest";
        userDisplayName.innerText = `Hi, welcomeee ${name}`;
        userDisplayName.style.display = "block";    // Show the username
        logoutLink.style.display = "block";           // Show logout
        loginLink.style.display = "none";             // Hide login
        signupLink.style.display = "none";              // Hide signup
      }
       else {
        userDisplayName.style.display = "none";
        logoutLink.style.display = "none";
        loginLink.style.display = "block";
        signupLink.style.display = "block";
      }

      logoutLink.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
      });
    });

  // --------------grok

//   import { auth, signOut } from "./utils/firebase.js";

//   document.addEventListener("DOMContentLoaded", async () => {
//     const userDisplayName = document.getElementById("user-name");
//     const loginLink = document.getElementById("login-link");
//     const signupLink = document.getElementById("signup-link");
//     const logoutLink = document.getElementById("logout-link");

//     // Check localStorage first
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

//     // Optionally, verify with backend session
//     try {
//       const response = await fetch("/user/check-session", {
//         method: "GET",
//         credentials: "include", // Include cookies for session
//       });
//       const sessionData = await response.json();
//       if (sessionData.user && !loggedInUser) {
//         // Sync session data to localStorage if not present
//         loggedInUser = {
//           id: sessionData.user.id,
//           firstName: sessionData.user.name,
//           email: sessionData.user.email,
//         };
//         localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
//       }
//     } catch (error) {
//       console.error("Error checking session:", error);
//     }

//     if (loggedInUser) {
//       const name =
//         loggedInUser.displayName || loggedInUser.firstName || "Guest";
//       userDisplayName.innerText = `Hi, welcome ${name} 👋`;
//       userDisplayName.style.display = "block";
//       logoutLink.style.display = "block";
//       loginLink.style.display = "none";
//       signupLink.style.display = "none";
//     } else {
//       userDisplayName.style.display = "none";
//       logoutLink.style.display = "none";
//       loginLink.style.display = "block";
//       signupLink.style.display = "block";
//     }

    // Handle logout
//     logoutLink.addEventListener("click", async (e) => {
//       e.preventDefault();
//       try {
//         // Sign out from Firebase (for Google Auth)
//         await signOut(auth);
//         // Clear localStorage
//         localStorage.removeItem("loggedInUser");
//         // Destroy backend session
//         await fetch("/user/logout", {
//           method: "POST",
//           credentials: "include",
//         });
//         window.location.href = "/";
//       } catch (error) {
//         console.error("Logout error:", error);
//         alert("Error logging out");
//       }
//     });
//   });


  // ------------------------------------------

  // Hero slider functionality
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  // Sample bike data for the slider
  const bikes = [
    {
      name: "Ferrari F40-LM 001",
      price: "₹2999.00",
      description:
        "High-end carbon frame provides efficiency and stiffness through the use of optimized layered tubes.",
    },
    {
      name: "BUGATTI BOLIDE",
      price: "₹4299.00",
      description:
        "Lightweight, extreme and uncompromising. The BOLIDE is BUGATTI's track-only hypercar built around the iconic W16 engine.s.",
    },
    {
      name: "Road Master Elite",
      price: "₹2599.00",
      description:
        "Lightweight frame and aerodynamic design for maximum speed on the open road.",
    },
    {
      name: "Urban Commuter X1",
      price: "₹2999.00",
      description:
        "Perfect for city riding with comfortable geometry and practical features.",
    },
  ];

  let currentSlide = 0;

  // Function to update the hero content
  function updateSlide(index) {
    // Update text content
    const heroTitle = document.querySelector(".hero-text h2");
    const heroPrice = document.querySelector(".price");
    const heroDesc = document.querySelector(".hero-text p");

    if (heroTitle && heroPrice && heroDesc) {
      heroTitle.textContent = bikes[index].name;
      heroPrice.textContent = bikes[index].price;
      heroDesc.textContent = bikes[index].description;

      // Update active dot
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[index].classList.add("active");

      // Add animation effect
      const heroImage = document.getElementById("hero-bike");
      if (heroImage) {
        heroImage.style.opacity = "0";

        setTimeout(() => {
          heroImage.style.opacity = "1";
          heroImage.style.transform = "translate(-50%, -50%) scale(1.05)";

          setTimeout(() => {
            heroImage.style.transform = "translate(-50%, -50%) scale(1)";
          }, 300);
        }, 300);
      }
    }
  }

  // Event listeners for dots
  if (dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index;
        updateSlide(currentSlide);
      });
    });
  }

  // Event listeners for arrow buttons
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      currentSlide = (currentSlide - 1 + bikes.length) % bikes.length;
      updateSlide(currentSlide);
    });

    nextBtn.addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % bikes.length;
      updateSlide(currentSlide);
    });

    // Auto slide every 4 seconds
    setInterval(() => {
      currentSlide = (currentSlide + 1) % bikes.length;
      updateSlide(currentSlide);
    }, 4000);
  }

  // Parallax effect for hero section
  const heroSection = document.querySelector(".hero");
  const heroImage = document.getElementById("hero-bike");
  const orangeBg = document.querySelector(".orange-bg");

  if (heroSection && heroImage && orangeBg) {
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition < 500) {
        heroImage.style.transform = `translate(-50%, -${
          50 - scrollPosition * 0.05
        }%)`;
        orangeBg.style.transform = `translateX(${scrollPosition * 0.05}%)`;
      }
    });
  }

  // Button hover effects
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px)";
      this.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
    });

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });

  // Facility card animations
  const facilityCards = document.querySelectorAll(".facility-card");

  if (facilityCards.length > 0) {
    // Add animation when scrolling into view
    window.addEventListener("scroll", function () {
      facilityCards.forEach((card) => {
        const cardPosition = card.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;

        if (cardPosition < screenPosition) {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }
      });
    });

    // Initialize cards as hidden
    facilityCards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s ease";
    });
  }

  // Service items hover effect
  const serviceItems = document.querySelectorAll(".service-item");

  serviceItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(10px)";
    });

    item.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0)";
    });
  });

  // Form validation and submission
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const message = document.getElementById("message").value;

      // Simple validation
      if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        alert("Thank you for your message! We will get back to you soon.");
        contactForm.reset();
        submitBtn.textContent = "Submit";
        submitBtn.disabled = false;
      }, 1500);
    });
  }
});
