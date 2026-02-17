/* ============================================
   FILTER SYSTEM - SMOOTH ANIMATIONS
   ============================================ */

let currentFilter = "*";
let menuItems = [];

// Initialize Filters
function initFilters(menuData) {
  menuItems = menuData.items || [];
  renderFilterButtons(menuData.categories || []);
  renderMenuItems(menuItems);
  setupFilterListeners();
}

// Render Filter Buttons (without Show All - that's handled separately)
function renderFilterButtons(categories) {
  const filterContainer = document.querySelector(".filter-container");
  if (!filterContainer) return;

  // Clear existing buttons
  filterContainer.innerHTML = "";

  // Add category filter buttons (no "Show All" here)
  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.setAttribute("data-filter", `.filter-${category.id}`);
    btn.textContent = category.name;
    filterContainer.appendChild(btn);
  });

  // Render Category Grid
  renderCategoryGrid(categories);
}

// Render Category Grid (Celina-style visual cards)
function renderCategoryGrid(categories) {
  const gridContainer = document.getElementById("categoryGrid");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  const regularCategories = categories.filter((c) => !c.fullRow);
  const fullRowCategories = categories.filter((c) => c.fullRow);

  // Wrapper for standard grid (so Lent can sit below in its own section)
  const gridInner = document.createElement("div");
  gridInner.className = "category-grid-inner";

  regularCategories.forEach((category) => {
    gridInner.appendChild(createCategoryCard(category));
  });

  gridContainer.appendChild(gridInner);

  // Full-row section at the end (e.g. Lent Menu)
  if (fullRowCategories.length > 0) {
    const lentSection = document.createElement("div");
    lentSection.className = "lent-menu-section";
    lentSection.innerHTML = '<p class="lent-menu-section-label">Lent Menu</p>';
    fullRowCategories.forEach((category) => {
      const card = createCategoryCard(category, true);
      lentSection.appendChild(card);
    });
    gridContainer.appendChild(lentSection);
  }

  // Setup Show All button
  const showAllBtn = document.getElementById("showAllBtn");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      showAllCategories();
    });
  }
}

function createCategoryCard(category, fullRow = false) {
  const card = document.createElement("div");
  card.className = "category-card" + (fullRow ? " category-card-full-row" : "");
  card.setAttribute("data-category", category.id);

  const fallbackGradient =
    "linear-gradient(135deg, #e4c27a 0%, #8c735b 100%)";

  card.innerHTML = `
    <div class="category-card-bg">
      ${
        category.image
          ? `<img src="${category.image}" alt="${category.name}">`
          : `<div class="category-card-gradient" style="background: ${fallbackGradient}"></div>`
      }
    </div>
    <div class="category-card-overlay"></div>
    <span class="category-card-title">${category.name}</span>
  `;

  card.addEventListener("click", () => {
    if (category.id === "drinks-desserts") {
      window.location.href = "coffee-menu.html";
      return;
    }
    selectCategory(category);
  });

  return card;
}

// Select a category from grid
function selectCategory(category) {
  const filter = `.filter-${category.id}`;

  // Filter items
  filterMenuItems(filter);

  // Update filter button active state
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.classList.remove("filter-active");
    if (btn.getAttribute("data-filter") === filter) {
      btn.classList.add("filter-active");
    }
  });

  // Scroll to menu section
  const menuContainer = document.getElementById("menuContainer");
  if (menuContainer) {
    setTimeout(() => {
      menuContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}

// Show all categories
function showAllCategories() {
  filterMenuItems("*");

  // Remove active state from all filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.classList.remove("filter-active");
  });
}

// Setup Filter Listeners
function setupFilterListeners() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      // If Drinks & Desserts, redirect to coffee menu
      if (filter === ".filter-drinks-desserts") {
        window.location.href = "coffee-menu.html";
        return;
      }

      filterMenuItems(filter);

      // Update active state
      filterButtons.forEach((b) => b.classList.remove("filter-active"));
      btn.classList.add("filter-active");
    });
  });
}

// Filter Menu Items with Isotope-like animation
function filterMenuItems(filter) {
  currentFilter = filter;
  const container = document.getElementById("menuContainer");
  if (!container) return;

  const allItems = container.querySelectorAll(".menu-item");

  // First: zoom out ALL items
  allItems.forEach((item) => {
    item.style.transition = "all 0.4s ease-out";
    item.style.opacity = "0";
    item.style.transform = "scale(0.8)";
  });

  // After zoom out completes, prepare and show filtered items
  setTimeout(() => {
    let visibleIndex = 0;

    allItems.forEach((item) => {
      const matchesFilter =
        filter === "*" || item.classList.contains(filter.replace(".", ""));

      if (matchesFilter) {
        // First set to hidden state before showing
        item.style.display = "";
        item.classList.remove("filtered-out");
        item.style.opacity = "0";
        item.style.transform = "scale(0.5)";
        item.style.transition = "none"; // Remove transition temporarily

        // Force reflow
        item.offsetHeight;

        // Now animate zoom in with stagger
        const delay = visibleIndex * 60;
        setTimeout(() => {
          item.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
          item.style.opacity = "1";
          item.style.transform = "scale(1)";
        }, delay);

        visibleIndex++;
      } else {
        // Hide item
        item.classList.add("filtered-out");
        item.style.display = "none";
      }
    });
  }, 450);
}

// Render Menu Items
function renderMenuItems(items) {
  const container = document.getElementById("menuContainer");
  if (!container) return;

  container.innerHTML = "";

  // Group items by category
  const groupedItems = {};
  items.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Render items with category headers
  Object.keys(groupedItems).forEach((categoryId) => {
    const categoryItems = groupedItems[categoryId];
    const category = getCurrentMenuData()?.categories?.find(
      (c) => c.id === categoryId
    );

    // Category Header
    if (category) {
      const header = document.createElement("div");
      header.className = `menu-item menu-header-item filter-${categoryId}`;
      header.innerHTML = `
        <h2>${category.name.toUpperCase()}</h2>
      `;
      container.appendChild(header);
    }

    // Category Items
    categoryItems.forEach((item) => {
      const menuItem = createMenuItemElement(item, categoryId);
      container.appendChild(menuItem);
    });
  });
}

// Create Menu Item Element (Celina-inspired card design)
function createMenuItemElement(item, categoryId) {
  const div = document.createElement("div");
  div.className = `menu-item filter-${categoryId}${
    item.image ? "" : " no-image"
  }`;

  // Special handling for note items (like "Check Coffee Bar Menu")
  if (item.isNote) {
    div.innerHTML = `
      <div class="menu-content" style="justify-content: center;">
        <span class="menu-item-name" style="text-align: center; font-size: 1.1rem;">${
          item.name
        }</span>
      </div>
      ${
        item.ingredients
          ? `<div class="menu-ingredients" style="text-align: center; font-style: italic;">${item.ingredients}</div>`
          : ""
      }
      <a href="coffee-menu.html" class="add-to-cart-btn" style="text-decoration: none; display: inline-block; text-align: center;">
        View Coffee Bar Menu
      </a>
    `;
    div.style.gridColumn = "1 / -1";
    div.style.textAlign = "center";
    div.style.padding = "2rem";
    div.style.background =
      "linear-gradient(135deg, rgba(228, 194, 122, 0.1) 0%, rgba(228, 194, 122, 0.05) 100%)";
    return div;
  }

  // Category header items
  if (item.isHeader) {
    return div; // Headers are handled separately
  }

  // Regular menu item card
  const descriptionHtml = item.ingredients
    ? `<div class="menu-item-description">${item.ingredients}</div>`
    : "";

  div.innerHTML = `
    <button class="menu-item-close">&times;</button>
    ${
      item.image
        ? `<div class="menu-item-image"><img src="${item.image}" alt="${item.name}"></div>`
        : ""
    }
    <div class="menu-item-content">
      <div class="menu-item-name">${item.name}</div>
      ${descriptionHtml}
      <div class="menu-item-footer">
        <span class="menu-item-price">$${item.price.toFixed(2)}</span>
        <div class="menu-item-actions">
          <button class="view-item-btn" data-item-id="${item.id}">
            <svg viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            Quick View
          </button>
          <button class="add-to-cart-btn-small" data-item-id="${item.id}">
            <svg viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.15.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  // Add click event listeners
  const viewBtn = div.querySelector(".view-item-btn");
  const addBtn = div.querySelector(".add-to-cart-btn-small");
  const closeBtn = div.querySelector(".menu-item-close");

  if (viewBtn) {
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Trigger expand immediately - no delay
      div.classList.add("expanding");
      expandMenuItem(div, item);
    });
  }

  // Make entire card clickable for Quick View
  div.addEventListener("click", (e) => {
    // Don't trigger if clicking on buttons
    if (
      e.target.closest(".add-to-cart-btn-small") ||
      e.target.closest(".menu-item-close")
    ) {
      return;
    }
    div.classList.add("expanding");
    expandMenuItem(div, item);
  });

  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Use image if available, otherwise use the title element
      const imgElement =
        div.querySelector(".menu-item-image img") ||
        div.querySelector(".menu-item-name");
      addToCart(item, imgElement);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeExpandedItemFromButton(div);
    });
  }

  // Add animation delay for staggered effect
  const index = Array.from(div.parentElement?.children || []).length;
  div.style.animationDelay = `${index * 0.08}s`;
  div.classList.add("fade-in-up");

  return div;
}

// Store reference to expanded clone and original element
let expandedClone = null;
let originalElement = null;

// Expand Menu Item (create clone, animate to center)
function expandMenuItem(element, item) {
  // Close any existing expanded clone
  if (expandedClone) {
    expandedClone.remove();
    expandedClone = null;
  }
  if (originalElement) {
    originalElement.style.opacity = "";
    originalElement = null;
  }

  // Store reference to original
  originalElement = element;

  // Create overlay if it doesn't exist
  let overlay = document.querySelector(".menu-item-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "menu-item-overlay";
    document.body.appendChild(overlay);
  }

  // Get the element's current position
  const rect = element.getBoundingClientRect();

  // Create a clone for the modal
  expandedClone = element.cloneNode(true);
  expandedClone.className = "menu-item expanded-clone";

  // Set clone initial position (same as original)
  expandedClone.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: auto;
    z-index: 2000;
    margin: 0;
    opacity: 1;
  `;

  // Append clone to body
  document.body.appendChild(expandedClone);

  // Dim the original slightly
  element.style.opacity = "0.3";
  element.classList.remove("expanding");

  // Prevent body scroll
  document.body.style.overflow = "hidden";

  // Force reflow
  expandedClone.offsetHeight;

  // Show overlay
  overlay.style.display = "block";
  overlay.style.opacity = "0";
  overlay.style.backdropFilter = "blur(0px)";
  overlay.offsetHeight;

  overlay.style.transition = "opacity 0.5s ease, backdrop-filter 0.5s ease";
  overlay.style.opacity = "1";
  overlay.style.backdropFilter = "blur(8px)";
  overlay.classList.add("active");

  // Animate clone to center
  expandedClone.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
  expandedClone.style.top = "50%";
  expandedClone.style.left = "50%";
  expandedClone.style.transform = "translate(-50%, -50%)";
  expandedClone.style.width = "min(90%, 600px)";
  expandedClone.classList.add("expanded");

  // Setup close button on clone
  const closeBtn = expandedClone.querySelector(".menu-item-close");
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeExpandedClone();
    };
  }

  // Setup add to cart on clone
  const addBtn = expandedClone.querySelector(".add-to-cart-btn-small");
  if (addBtn) {
    addBtn.onclick = (e) => {
      e.stopPropagation();
      // Use image if available, otherwise use the title element
      const imgElement =
        expandedClone.querySelector(".menu-item-image img") ||
        expandedClone.querySelector(".menu-item-name");
      addToCart(item, imgElement);
    };
  }

  // Close on overlay click
  overlay.onclick = () => {
    closeExpandedClone();
  };

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeExpandedClone();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

// Close the expanded clone
function closeExpandedClone() {
  const overlay = document.querySelector(".menu-item-overlay");

  if (!expandedClone) return;

  // Instantly hide overlay
  if (overlay) {
    overlay.style.display = "none";
    overlay.style.cssText = "";
    overlay.classList.remove("active");
  }

  // Reset body scroll
  document.body.style.overflow = "";

  // Remove expanded class so !important doesn't block animation
  expandedClone.classList.remove("expanded");

  // Keep it at center position without the class
  expandedClone.style.position = "fixed";
  expandedClone.style.top = "50%";
  expandedClone.style.left = "50%";
  expandedClone.style.transform = "translate(-50%, -50%)";
  expandedClone.style.zIndex = "2000";

  // Force reflow
  expandedClone.offsetHeight;

  // Now animate - shrink and drop through pipe
  expandedClone.style.transition = "all 0.4s cubic-bezier(0.4, 0, 1, 1)";
  expandedClone.style.transform = "translate(-50%, 100vh) scale(0.2)";
  expandedClone.style.opacity = "0";

  // Restore original element
  if (originalElement) {
    originalElement.style.opacity = "";
    originalElement.classList.remove("expanding");
  }

  // Remove clone after animation
  setTimeout(() => {
    if (expandedClone) {
      expandedClone.remove();
      expandedClone = null;
    }
    originalElement = null;
  }, 400);
}

// Legacy function - now redirects to closeExpandedClone
function closeExpandedItemFromButton(element) {
  closeExpandedClone();
}

// Get current menu data (will be set by menu-specific scripts)
let menuData = null;

function setMenuData(data) {
  menuData = data;
  initFilters(data);
}

function getCurrentMenuData() {
  return menuData;
}
