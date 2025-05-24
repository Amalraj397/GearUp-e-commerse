// document.addEventListener('DOMContentLoaded', function() {
//     // Image upload preview functionality
//     const imageUploadArea = document.getElementById('image-upload-area');
//     const imageInput = document.getElementById('product-images');
//     const imagePreviewContainer = document.getElementById('image-preview-container');
    
//     // Handle drag and drop
//     ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
//         imageUploadArea.addEventListener(eventName, preventDefaults, false);
//     });
    
//     function preventDefaults(e) {
//         e.preventDefault();
//         e.stopPropagation();
//     }
    
//     ['dragenter', 'dragover'].forEach(eventName => {
//         imageUploadArea.addEventListener(eventName, highlight, false);
//     });
    
//     ['dragleave', 'drop'].forEach(eventName => {
//         imageUploadArea.addEventListener(eventName, unhighlight, false);
//     });
    
//     function highlight() {
//         imageUploadArea.classList.add('highlight');
//     }
    
//     function unhighlight() {
//         imageUploadArea.classList.remove('highlight');
//     }
    
//     // Handle file drop
//     imageUploadArea.addEventListener('drop', handleDrop, false);
    
//     function handleDrop(e) {
//         const dt = e.dataTransfer;
//         const files = dt.files;
//         handleFiles(files);
//     }
    
//     // Handle file input change
//     imageInput.addEventListener('change', function() {
//         handleFiles(this.files);
//     });
    
//     function handleFiles(files) {
//         files = [...files];
//         files.forEach(previewImage);
//     }
    
//     function previewImage(file) {
//         // Check if file is an image
//         if (!file.type.match('image.*')) {
//             alert('Please upload image files only');
//             return;
//         }
        
//         // Check file size (max 5MB)
//         if (file.size > 5 * 1024 * 1024) {
//             alert('File size should not exceed 5MB');
//             return;
//         }
        
//         const reader = new FileReader();
        
//         reader.onload = function(e) {
//             const imgPreview = document.createElement('div');
//             imgPreview.className = 'image-preview';
            
//             const img = document.createElement('img');
//             img.src = e.target.result;
//             img.alt = file.name;
            
//             const removeBtn = document.createElement('button');
//             removeBtn.className = 'remove-image';
//             removeBtn.innerHTML = '<i class="fas fa-times"></i>';
//             removeBtn.addEventListener('click', function() {
//                 imgPreview.remove();
//             });
            
//             imgPreview.appendChild(img);
//             imgPreview.appendChild(removeBtn);
//             imagePreviewContainer.appendChild(imgPreview);
//         };
        
//         reader.readAsDataURL(file);
//     }
    
//     // Calculate offer percentage when prices change
//     const regularPriceInput = document.getElementById('regular-price');
//     const sellingPriceInput = document.getElementById('selling-price');
//     const offerInput = document.getElementById('product-offer');
    
//     regularPriceInput.addEventListener('input', calculateOffer);
//     sellingPriceInput.addEventListener('input', calculateOffer);
//     offerInput.addEventListener('input', calculateSellingPrice);
    
//     function calculateOffer() {
//         const regularPrice = parseFloat(regularPriceInput.value) || 0;
//         const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
        
//         if (regularPrice > 0 && sellingPrice > 0 && regularPrice >= sellingPrice) {
//             const offerPercentage = ((regularPrice - sellingPrice) / regularPrice) * 100;
//             offerInput.value = offerPercentage.toFixed(0);
//         }
//     }
    
//     function calculateSellingPrice() {
//         const regularPrice = parseFloat(regularPriceInput.value) || 0;
//         const offerPercentage = parseFloat(offerInput.value) || 0;
        
//         if (regularPrice > 0 && offerPercentage >= 0 && offerPercentage <= 100) {
//             const sellingPrice = regularPrice * (1 - offerPercentage / 100);
//             sellingPriceInput.value = sellingPrice.toFixed(2);
//         }
//     }
    
//     // Form submission
//     const productForm = document.getElementById('add-product-form');
    
//     productForm.addEventListener('submit', function(e) {
//         e.preventDefault();
        
//         // Validate form
//         if (!validateForm()) {
//             return;
//         }
        
//         // Collect form data
//         const formData = new FormData(productForm);
//         const productData = {};
        
//         for (const [key, value] of formData.entries()) {
//             productData[key] = value;
//         }
        
//         // In a real application, you would send this data to your server
//         console.log('Product Data:', productData);
        
//         // Show success message
//         alert('Product saved successfully!');
        
//         // Redirect to products page
//         window.location.href = 'products.html';
//     });
    
//     function validateForm() {
//         // Basic validation
//         const requiredFields = ['product-name', 'brand', 'category', 'description', 'regular-price', 'selling-price', 'stock'];
//         let isValid = true;
        
//         requiredFields.forEach(field => {
//             const input = document.getElementById(field);
//             if (!input.value.trim()) {
//                 input.classList.add('error');
//                 isValid = false;
//             } else {
//                 input.classList.remove('error');
//             }
//         });
        
//         if (!isValid) {
//             alert('Please fill in all required fields');
//         }
        
//         return isValid;
//     }

//         //view productlist button

//     const viewProductsBtn = document.getElementById('.save-product-btn');

//     viewProductsBtn.addEventListener('click', function () {
//         window.location.href = '/admin/productList'; // change this to your actual product list page path
//     });

//     // Check for edit mode
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('id');
    
//     if (productId) {
//         // This would be an API call in a real application
//         // For demo purposes, we'll use the sample data from products.js
        
//         const product = {
//             id: 1,
//             name: "Nike Air Max 270",
//             brand: "Nike",
//             category: "Shoes",
//             description: "The Nike Air Max 270 delivers a plush ride for everyday wear. The first-ever Max Air unit designed specifically for Nike Sportswear shoes, it delivers enhanced cushioning at the heel.",
//             variant: "Men's Running",
//             color: "Black/White",
//             regularPrice: 150.00,
//             sellingPrice: 129.99,
//             offer: 13,
//             stock: 45,
//             status: "active"
//         };
        
//         // Populate form with product data
//         document.getElementById('product-name').value = product.name;
//         document.getElementById('brand').value = product.brand.toLowerCase();
//         document.getElementById('category').value = product.category.toLowerCase();
//         document.getElementById('description').value = product.description;
//         document.getElementById('variant').value = product.variant;
//         document.getElementById('color').value = product.color;
//         document.getElementById('regular-price').value = product.regularPrice;
//         document.getElementById('selling-price').value = product.sellingPrice;
//         document.getElementById('product-offer').value = product.offer;
//         document.getElementById('stock').value = product.stock;
//         document.getElementById('status').value = product.status;
        
//         // Update page title
//         document.querySelector('.add-product-header h1').textContent = 'Edit Product';
//         document.title = 'Admin Dashboard - Edit Product';
//     }
    
//     // Sidebar Toggle (from main script)
//     const sidebarToggle = document.getElementById('sidebar-toggle');
//     const sidebar = document.querySelector('.sidebar');
    
//     sidebarToggle.addEventListener('click', function() {
//         sidebar.classList.toggle('active');
//     });

//     // Dropdown functionality
//     const dropdownBtn = document.querySelector('.dropdown-btn');
//     const dropdownContent = document.querySelector('.dropdown-content');
    
//     dropdownBtn.addEventListener('click', function() {
//         dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
//     });

//     // Close dropdown when clicking outside
//     window.addEventListener('click', function(event) {
//         if (!event.target.matches('.dropdown-btn') && !event.target.matches('.admin-avatar') && !event.target.matches('.fa-chevron-down')) {
//             if (dropdownContent.style.display === 'block') {
//                 dropdownContent.style.display = 'none';
//             }
//         }
//     });
// });


document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('add-product-form');
    const imageUploadArea = document.getElementById('image-upload-area');
    const imageInput = document.getElementById('product-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const cancelBtn = document.getElementById('cancel-btn');
    const viewProductsBtn = document.querySelector('.save-product-btn');

    // Validation Functions
    const validateProductName = (value) => {
        if (!value.trim()) return 'Product name is required.';
        if (value.length < 3) return 'Product name must be at least 3 characters long.';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Product name must contain only letters and numbers (no spaces or special symbols).';
        return '';
    };

    const validateBrand = (value) => {
        return value === '' ? 'Please select a brand.' : '';
    };

    const validateCategory = (value) => {
        return value === '' ? 'Please select a category.' : '';
    };

    const validateDescription = (value) => {
        if (!value.trim()) return 'Description is required.';
        if (value.length < 10) return 'Description must be at least 10 characters long.';
        return '';
    };

    const validateSize = (value) => {
        if (!value.trim()) return 'Variants are required.';
        if (!/^(S|M|L)$/.test(value)) return 'Size must be values (e.g: S,M orL).';
        return '';
    };

    const validateProductPrice = (value) => {
        if (value === '') return 'Product price is required.';
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return 'Product price must be a non-negative number.';
        return '';
    };

    const validateProductOffer = (value) => {
        if (value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 100) return 'Product offer must be between 0 and 100.';
        return '';
    };

    const validateStock = (value) => {
        if (value === '') return 'Stock quantity is required.';
        const num = parseInt(value);
        if (isNaN(num) || num < 0) return 'Stock quantity must be a non-negative number.';
        return '';
    };

    const validateImages = () => {
        return imagePreviewContainer.children.length === 0 ? 'At least one image is required.' : '';
    };

    // Show/Hide Error Message
    const showError = (input, message) => {
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (message) {
            input.classList.add('error');
            errorSpan.textContent = message;
            errorSpan.classList.add('active');
        } else {
            input.classList.remove('error');
            errorSpan.textContent = '';
            errorSpan.classList.remove('active');
        }
    };

    // Real-Time Validation
    const inputs = [
        { id: 'product-name', validate: validateProductName },
        { id: 'brand', validate: validateBrand },
        { id: 'category', validate: validateCategory },
        { id: 'description', validate: validateDescription },
        { id: 'size', validate: validateSize },
        { id: 'product-price', validate: validateProductPrice },
        { id: 'product-offer', validate: validateProductOffer },
        { id: 'stock', validate: validateStock }
    ];

    inputs.forEach(({ id, validate }) => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            showError(input, validate(input.value));
        });
        input.addEventListener('change', () => {
            showError(input, validate(input.value));
        });
    });

    // Image Upload Functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, () => {
            imageUploadArea.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, () => {
            imageUploadArea.classList.remove('highlight');
        }, false);
    });

    imageUploadArea.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    imageInput.addEventListener('change', () => {
        handleFiles(imageInput.files);
    });

    function handleFiles(files) {
        [...files].forEach(file => {
            if (!file.type.match('image/(jpeg|png|gif)')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File Type',
                    text: 'Please upload JPG, PNG, or GIF files only.'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: 'File size should not exceed 5MB.'
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = e => {
                const imgPreview = document.createElement('div');
                imgPreview.className = 'image-preview';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', () => {
                    imgPreview.remove();
                    showError(imageInput, validateImages());
                });

                imgPreview.append(img, removeBtn);
                imagePreviewContainer.appendChild(imgPreview);
                showError(imageInput, validateImages());
            };
            reader.readAsDataURL(file);
        });
    }

    // Frame Type Toggle (Single Selection)
    const alloyToggle = document.getElementById('alloys');
    const carbonToggle = document.getElementById('carbon');

    alloyToggle.addEventListener('change', () => {
        if (alloyToggle.checked) {
            carbonToggle.checked = false;
        }
    });

    carbonToggle.addEventListener('change', () => {
        if (carbonToggle.checked) {
            alloyToggle.checked = false;
        }
    });

    // Form Submission
    productForm.addEventListener('submit', e => {
        e.preventDefault();

        let isValid = true;
        inputs.forEach(({ id, validate }) => {
            const input = document.getElementById(id);
            const error = validate(input.value);
            showError(input, error);
            if (error) isValid = false;
        });

        const imageError = validateImages();
        showError(imageInput, imageError);
        if (imageError) isValid = false;

        if (!isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please correct the errors in the form.'
            });
            return;
        }

        const formData = new FormData(productForm);
        const productData = {};
        for (const [key, value] of formData.entries()) {
            if (productData[key]) {
                productData[key] = Array.isArray(productData[key]) ? [...productData[key], value] : [productData[key], value];
            } else {
                productData[key] = value;
            }
        }

        console.log('Product Data:', productData);
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Product saved successfully!',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = '/admin/productList';
        });
    });

    // Cancel Button
    cancelBtn.addEventListener('click', () => {
        productForm.reset();
        imagePreviewContainer.innerHTML = '';
        document.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
            span.classList.remove('active');
        });
        document.querySelectorAll('.error').forEach(input => {
            input.classList.remove('error');
        });
        window.location.href = '/admin/addProduct';
    });

    // View Products Button
    viewProductsBtn.addEventListener('click', () => {
        window.location.href = '/admin/productList';
    });
});