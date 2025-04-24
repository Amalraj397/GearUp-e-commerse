document.addEventListener('DOMContentLoaded', function() {
    // Image upload preview functionality
    const imageUploadArea = document.getElementById('image-upload-area');
    const imageInput = document.getElementById('product-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        imageUploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        imageUploadArea.classList.remove('highlight');
    }
    
    // Handle file drop
    imageUploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle file input change
    imageInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        files = [...files];
        files.forEach(previewImage);
    }
    
    function previewImage(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please upload image files only');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should not exceed 5MB');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imgPreview = document.createElement('div');
            imgPreview.className = 'image-preview';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', function() {
                imgPreview.remove();
            });
            
            imgPreview.appendChild(img);
            imgPreview.appendChild(removeBtn);
            imagePreviewContainer.appendChild(imgPreview);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Calculate offer percentage when prices change
    const regularPriceInput = document.getElementById('regular-price');
    const sellingPriceInput = document.getElementById('selling-price');
    const offerInput = document.getElementById('product-offer');
    
    regularPriceInput.addEventListener('input', calculateOffer);
    sellingPriceInput.addEventListener('input', calculateOffer);
    offerInput.addEventListener('input', calculateSellingPrice);
    
    function calculateOffer() {
        const regularPrice = parseFloat(regularPriceInput.value) || 0;
        const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
        
        if (regularPrice > 0 && sellingPrice > 0 && regularPrice >= sellingPrice) {
            const offerPercentage = ((regularPrice - sellingPrice) / regularPrice) * 100;
            offerInput.value = offerPercentage.toFixed(0);
        }
    }
    
    function calculateSellingPrice() {
        const regularPrice = parseFloat(regularPriceInput.value) || 0;
        const offerPercentage = parseFloat(offerInput.value) || 0;
        
        if (regularPrice > 0 && offerPercentage >= 0 && offerPercentage <= 100) {
            const sellingPrice = regularPrice * (1 - offerPercentage / 100);
            sellingPriceInput.value = sellingPrice.toFixed(2);
        }
    }
    
    // Form submission
    const productForm = document.getElementById('add-product-form');
    
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = new FormData(productForm);
        const productData = {};
        
        for (const [key, value] of formData.entries()) {
            productData[key] = value;
        }
        
        // In a real application, you would send this data to your server
        console.log('Product Data:', productData);
        
        // Show success message
        alert('Product saved successfully!');
        
        // Redirect to products page
        window.location.href = 'products.html';
    });
    
    function validateForm() {
        // Basic validation
        const requiredFields = ['product-name', 'brand', 'category', 'description', 'regular-price', 'selling-price', 'stock'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields');
        }
        
        return isValid;
    }

        //view productlist button

    const viewProductsBtn = document.querySelector('.save-product-btn');

    viewProductsBtn.addEventListener('click', function () {
        window.location.href = '/admin/productList'; // change this to your actual product list page path
    });

    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        // This would be an API call in a real application
        // For demo purposes, we'll use the sample data from products.js
        
        const product = {
            id: 1,
            name: "Nike Air Max 270",
            brand: "Nike",
            category: "Shoes",
            description: "The Nike Air Max 270 delivers a plush ride for everyday wear. The first-ever Max Air unit designed specifically for Nike Sportswear shoes, it delivers enhanced cushioning at the heel.",
            variant: "Men's Running",
            color: "Black/White",
            regularPrice: 150.00,
            sellingPrice: 129.99,
            offer: 13,
            stock: 45,
            status: "active"
        };
        
        // Populate form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('brand').value = product.brand.toLowerCase();
        document.getElementById('category').value = product.category.toLowerCase();
        document.getElementById('description').value = product.description;
        document.getElementById('variant').value = product.variant;
        document.getElementById('color').value = product.color;
        document.getElementById('regular-price').value = product.regularPrice;
        document.getElementById('selling-price').value = product.sellingPrice;
        document.getElementById('product-offer').value = product.offer;
        document.getElementById('stock').value = product.stock;
        document.getElementById('status').value = product.status;
        
        // Update page title
        document.querySelector('.add-product-header h1').textContent = 'Edit Product';
        document.title = 'Admin Dashboard - Edit Product';
    }
    
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