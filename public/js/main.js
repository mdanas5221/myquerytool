document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-navigation");

  const categoriesItem = document.getElementById("nav-item-categories");
  const categoriesTrigger = document.getElementById("nav-link-categories");

  // --------------------------------
  // Hamburger Menu
  // --------------------------------

  function openMenu() {
    mainNav.classList.add("is-open");
    navToggle.classList.add("is-active");
    navToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    mainNav.classList.remove("is-open");
    navToggle.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");

    // Close categories accordion too
    if (categoriesItem) {
      categoriesItem.classList.remove("is-open");
    }

    if (categoriesTrigger) {
      categoriesTrigger.setAttribute("aria-expanded", "false");
    }
  }

  // Hamburger click
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (mainNav.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // --------------------------------
  // Mobile Categories Dropdown
  // --------------------------------

  if (categoriesTrigger && categoriesItem) {
    categoriesTrigger.addEventListener("click", (e) => {
      // Only accordion behaviour on mobile/tablet
      if (window.innerWidth <= 992) {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = categoriesItem.classList.toggle("is-open");

        categoriesTrigger.setAttribute(
          "aria-expanded",
          isOpen ? "true" : "false",
        );
      }
    });
  }

  // --------------------------------
  // Close menu when normal link clicked
  // --------------------------------

  const normalNavLinks = document.querySelectorAll(
    ".main-nav .nav-link:not(.nav-dropdown-trigger)",
  );

  normalNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Close after clicking category item
  const dropdownLinks = document.querySelectorAll(".dropdown-link");

  dropdownLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // --------------------------------
  // Close when clicking outside
  // --------------------------------

  document.addEventListener("click", (e) => {
    if (!mainNav || !navToggle) return;

    if (
      mainNav.classList.contains("is-open") &&
      !mainNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // --------------------------------
  // Close with Escape
  // --------------------------------

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      mainNav &&
      mainNav.classList.contains("is-open")
    ) {
      closeMenu();
    }
  });

  // --------------------------------
  // If screen becomes desktop
  // --------------------------------

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      closeMenu();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const radioCards = document.querySelectorAll(".feedback-radio-card");
    radioCards.forEach((card) => {
      card.addEventListener("click", () => {
        radioCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
      });
    });
  });
});
