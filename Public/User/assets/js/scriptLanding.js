
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
      img:'User/assets/images/backgrounds/2018-Ferrari-FXX-K-Evo-001-1080-removebg-preview.png'
    },
    {
      name: "BUGATTI BOLIDE",
      price: "₹4299.00",
      description:
        "Lightweight, extreme and uncompromising. The BOLIDE is BUGATTI's track-only hypercar built around the iconic W16 engine.s.",
        img:'User/assets/images/backgrounds/2019-Audi-R8-LMS-GT3-001-1080-removebg-preview.png'
    },
    {
      name: "Road Master Elite",
      price: "₹2599.00",
      description:
        "Lightweight frame and aerodynamic design for maximum speed on the open road.",
      img:'User/assets/images/backgrounds/2022-Formula1-Mercedes-AMG-W13-F1-E-Performance-008-2160-Photoroom.png'
    },
    {
      name: "Urban Commuter X1",
      price: "₹2999.00",
      description:
        "Perfect for city riding with comfortable geometry and practical features.",
      img:'User/assets/images/backgrounds/2024-Chevrolet-Corvette-Z06-GT3.R-001-1440w-Photoroom.png'  
    },
  ];

  let currentSlide = 0;

  // Function to update the hero content
  function updateSlide(index) {
    // Update text content
    const heroTitle = document.querySelector(".hero-text h2");
    const heroPrice = document.querySelector(".price");
    const heroDesc = document.querySelector(".hero-text p");
    const heroImage = document.getElementById("hero-bike");

    if (heroTitle && heroPrice && heroDesc) {
      heroTitle.textContent = bikes[index].name;
      heroPrice.textContent = bikes[index].price;
      heroDesc.textContent = bikes[index].description;
      heroImage.src = bikes[index].img;

      // Update active dot
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[index].classList.add("active");

      // Add animation effect
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
