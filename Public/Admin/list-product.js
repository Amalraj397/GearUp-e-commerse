document.addEventListener('DOMContentLoaded', function() {
    // Sample product data
    const products = [
        {
            id: 1,
            name: "RoadMaster 500",
            brand: "SpeedX",
            category: "Road Bike",
            variant: "Men's Performance",
            color: "Red/Black",
            regularPrice: 24000.00,
            sellingPrice: 21500.00,
            offer: 10,
            stock: 10,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=SpeedX"
        },
        {
            id: 2,
            name: "MountainRider X",
            brand: "TrailBlaze",
            category: "Mountain Bike",
            variant: "Unisex Trail",
            color: "Matte Black",
            regularPrice: 28500.00,
            sellingPrice: 25500.00,
            offer: 11,
            stock: 5,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Trail"
        },
        {
            id: 3,
            name: "Urban Hybrid 3.0",
            brand: "CityCruze",
            category: "Hybrid Bike",
            variant: "Men's City",
            color: "Grey/Orange",
            regularPrice: 22000.00,
            sellingPrice: 19800.00,
            offer: 10,
            stock: 0,
            status: "inactive",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=City"
        },
        {
            id: 4,
            name: "FunBike 12",
            brand: "KiddoRide",
            category: "Kids Bike",
            variant: "Boys/Girls 3-6 yrs",
            color: "Blue/Yellow",
            regularPrice: 8500.00,
            sellingPrice: 7499.00,
            offer: 12,
            stock: 20,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Kiddo"
        },
        {
            id: 5,
            name: "TrailMaster 29",
            brand: "RockRider",
            category: "Mountain Bike",
            variant: "Men's Off-road",
            color: "Green/Black",
            regularPrice: 31000.00,
            sellingPrice: 27999.00,
            offer: 10,
            stock: 3,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Rock"
        },
        {
            id: 6,
            name: "CityCruise 700c",
            brand: "MetroVelo",
            category: "Hybrid Bike",
            variant: "Women's City Ride",
            color: "White/Peach",
            regularPrice: 19500.00,
            sellingPrice: 17500.00,
            offer: 10,
            stock: 8,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Velo"
        },
        {
            id: 7,
            name: "eRide X1",
            brand: "VoltCycle",
            category: "Electric Bike",
            variant: "Unisex",
            color: "Black/Green",
            regularPrice: 48500.00,
            sellingPrice: 44999.00,
            offer: 7,
            stock: 0,
            status: "inactive",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Volt"
        },
        {
            id: 8,
            name: "Junior Sprint 16",
            brand: "TinyTrek",
            category: "Kids Bike",
            variant: "Boys/Girls 5-8 yrs",
            color: "Red/White",
            regularPrice: 9700.00,
            sellingPrice: 8999.00,
            offer: 7,
            stock: 18,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Trek"
        },
        {
            id: 9,
            name: "Racer Pro 700c",
            brand: "FastLane",
            category: "Road Bike",
            variant: "Men's Speed",
            color: "Black/Neon",
            regularPrice: 27000.00,
            sellingPrice: 24999.00,
            offer: 7,
            stock: 6,
            status: "draft",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Fast"
        },
        {
            id: 10,
            name: "Eco Step-Through",
            brand: "UrbanMotion",
            category: "Hybrid Bike",
            variant: "Women's Comfort",
            color: "Teal",
            regularPrice: 21500.00,
            sellingPrice: 19999.00,
            offer: 7,
            stock: 9,
            status: "active",
            image: "https://via.placeholder.com/50x50/FF8C00/FFFFFF?text=Eco"
        }
    ];
    

    // Pagination variables
    let currentPage = 1;
    const productsPerPage = 5;
    let filteredProducts = [...products];

    // Format currency
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    // Render products table
    function renderProducts() {
        const tableBody = document.getElementById('products-table-body');
        tableBody.innerHTML = '';

        // Calculate pagination
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        // Render products
        paginatedProducts.forEach(product => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" class="product-image"></td>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>${product.category}</td>
                <td>${product.variant}</td>
                <td>${product.color}</td>
                <td>${formatCurrency(product.regularPrice)}</td>
                <td>${formatCurrency(product.sellingPrice)}</td>
                <td>${product.offer}%</td>
                <td>${product.stock > 0 ? product.stock : '<span class="status-inactive">Out of Stock</span>'}</td>
                <td>
                    <span class="product-status ${product.status === 'active' ? 'status-active' : product.status === 'draft' ? 'status-draft' : 'status-inactive'}">
                        ${product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                </td>
                <td class="product-actions">
                    <button class="edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    ${product.status === 'active' ? 
                        `<button class="block-btn" data-id="${product.id}"><i class="fas fa-ban"></i></button>` : 
                        `<button class="unblock-btn" data-id="${product.id}"><i class="fas fa-check-circle"></i></button>`
                    }
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                window.location.href = `add-product.html?id=${productId}`;
            });
        });

        document.querySelectorAll('.block-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                blockProduct(productId);
            });
        });

        document.querySelectorAll('.unblock-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                unblockProduct(productId);
            });
        });

        // Update pagination
        updatePagination();
    }

    // Block product function
    function blockProduct(productId) {
        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            products[productIndex].status = 'inactive';
            // Re-apply current filter and sort
            applyFiltersAndSort();
        }
    }

    // Unblock product function
    function unblockProduct(productId) {
        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            products[productIndex].status = 'active';
            // Re-apply current filter and sort
            applyFiltersAndSort();
        }
    }

    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        const pageNumbers = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        // Update prev/next buttons
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        // Update page numbers
        pageNumbers.innerHTML = '';
        
        // Determine range of page numbers to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderProducts();
            });
            pageNumbers.appendChild(pageBtn);
        }
    }

    // Search functionality
    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        applyFiltersAndSort(searchTerm);
    });

    // Apply filters and sort
    function applyFiltersAndSort(searchTerm = searchInput.value.toLowerCase().trim()) {
        // Filter products
        filteredProducts = products.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.variant.toLowerCase().includes(searchTerm) ||
                product.color.toLowerCase().includes(searchTerm)
            );
        });
        
        // Reset to first page when filtering
        currentPage = 1;
        renderProducts();
    }

    // Pagination event listeners
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });

    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });

    // Initialize the table
    renderProducts();

    // Sidebar Toggle (from main script)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Dropdown functionality
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    dropdownBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-btn') && !event.target.matches('.admin-avatar') && !event.target.matches('.fa-chevron-down')) {
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            }
        }
    });
});