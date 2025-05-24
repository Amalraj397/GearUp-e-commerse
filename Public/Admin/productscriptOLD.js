{/* <script>
    document.addEventListener('DOMContentLoaded', () => {
        const productForm = document.getElementById('add-product-form');
        const imageUploadArea = document.getElementById('image-upload-area');
        const imageInput = document.getElementById('product-images');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        const cancelBtn = document.getElementById('cancel-btn');
        const viewProductsBtn = document.querySelector('.save-product-btn');
    
    //  -----------------Validation Functions-------------------
    
//  ----productname validation-----
    const validateProductName = (value) => {
          if (!value.trim()) return 'Product name is required.';
          if (value.length < 3) return 'Product name must be at least 3 characters long.';
          if (!/^[A-Z][a-zA-Z0-9+\-\s]*$/.test(value)) {
            return 'Product name must start with a capital letter and contain only letters, numbers, spaces, +, or -.';
          }
          return '';
        };
    //  ------brand validation-----
    const validateBrand = (value) => {
            return (!value || value === '') ? 'Please select a brand.' : '';
        };
     
    //  ------category validation----
    const validateCategory = (value) => {
            return (!value || value === '') ? 'Please select a category.' : '';
        };
            
    //  ------description validation----
    const validateDescription = (value) => {
    const trimDes = value.trim();
         if (!trimDes) return 'Description is required.';
         if (trimDes.length < 10) return 'Description must be at least 10 characters long.';
         return '';
        }; 

    //  -------Size validation------

    const validateSize = ()=> {
    const sizeSelect = document.getElementById('size');
    const value = sizeSelect.value.trim().toLowerCase();
    const validSizes = ['small', 'medium', 'large'];

    if (!value) {
        return 'Please select a size.';
    }

    if (!validSizes.includes(value)) {
        return 'Invalid size selected.';
    }
        return '';
    };

    //  -------Price validation-----
    const validateProductPrice = (value) => {
        if (value === '') return 'Product price is required.';
      const num = Number(value);
         if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
            return 'Product price must be a positive whole number.';
    }
        return '';
    };
    
    //  -------Offer validation-----
    const validateProductOffer = (value) => {
        if (value === '') return 'Product Offer is required';
      const num = Number(value);
        if (isNaN(num) || num < 0 || !Number.isInteger(num) || num > 100) {
            return 'Product offer must be an integer between 0 and 100.';
        }
        return '';
    };

   //  -------stock validation-----
    const validateStock = (value) => {
        if (value === '') return 'Stock quantity is required.';
    const num = Number(value);
        if (isNaN(num) || !Number.isInteger(num) || num < 0) {
            return 'Stock quantity must be a non-negative whole number.';
        }
        return '';
    };
    
    //  -------gears validation-----
    const validateGears = (value) => {
      const validGears = ["geared(1x7)", "singlespeed", "geared(3x7)"];
        if (!value || !validGears.includes(value)) {
            return "Please select a valid gear option.";
        }
        return '';
    };
    
    //  -------break validation-----
    const validateBrake = (value) => {
      const validBrakes = ["Disc", "Drum"];
        if (!value || !validBrakes.includes(value)) {
            return "Please select a valid brake type.";
        }
        return '';
    };

    //  -------image validation-----
    const validateImages = () => {
      const imageCount = imagePreviewContainer.children.length;
         if (imageCount < 3) return 'Please upload at least 3 images.';
         return '';
    };

    //  -------tags and features validation-----

    const validateFeaturesAndTags = (value) => {
    const featuresChecked = document.querySelectorAll('input[name="features[]"]:checked').length > 0;
    const tagsValue = document.getElementById('tags').value.trim();
    
    if (!featuresChecked && !tagsValue) {
        return 'Please provide at least one tag or select a feature.';
    }
        return '';
    };

    // -----product-Status validation-----
    const validateStatus = (value) => {
    const validStatuses = ["in-stock", "out-of-stock", "coming-soon"];
    if (!value || !validStatuses.includes(value)) {
        return 'Please select a valid product status.';
    }
        return '';
    };
    //--------color validation---------

    const validateColor=(value) =>{
    if (!value.trim()) {
        return 'Color field is required.';
    }
    const validPattern = /^[a-zA-Z\s,]+$/;
    if (!validPattern.test(value)) {
        return 'Enter valid color names separated by commas (e.g., Red, Blue).';
    }
        return '';
    };

    // ----------frame validation-----------

    const alloyToggle = document.getElementById('alloys');
        const carbonToggle = document.getElementById('carbon');
    
        alloyToggle.addEventListener('change', () => {
            if (alloyToggle.checked) carbonToggle.checked = false;
        });
    
        carbonToggle.addEventListener('change', () => {
            if (carbonToggle.checked) alloyToggle.checked = false;
        });
    
  //  -------Frame validation-----
        function validateFrameType() {
            if (!alloyToggle.checked && !carbonToggle.checked) {
                return 'Please select a frame type (Alloy or Carbon Fibre).';
            }
            return '';
        }
// --------------------gender valdation-------------------

        // Collect values from the checkboxes
        function collectGenderData() {
        const men = document.getElementById('men').checked;
        const women = document.getElementById('women').checked;
        const unisex = document.getElementById('unisex').checked;
        const boys = document.getElementById('boys').checked;
        const girls = document.getElementById('girls').checked;

    // Format the data as an object (only one object in the array)
    const genderData = [{
        forMen: men,
        forWomen: women,
        Unisex: unisex,
        forGirls: girls,
        forBoys: boys
    }];

    return genderData;
    }

// Call this function before sending the form data to the backend
    const genderData = collectGenderData();
// console.log(genderData); // Check the structure

         //  -------Gender validation-----

    const validateGender=() =>{
      const genderObject = collectGenderData()[0];
      const isAtLeastOneChecked = Object.values(genderObject).some(val => val === true);
        return isAtLeastOneChecked ? '' : 'Please select at least one gender category.';

    }

    // Error handling function
      const showError = (input, message) => {
      const errorSpan = input?.parentElement?.querySelector('.error-message');
         if (!errorSpan) return; // safely exit if no span exists
     
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
     
      const inputs = [
        { id: 'product-name', validate: validateProductName },
        { id: 'brand', validate: validateBrand },
        { id: 'category', validate: validateCategory },
        { id: 'description', validate: validateDescription },
        { id: 'size', validate: validateSize },
        { id: 'product-price', validate: validateProductPrice },
        { id: 'product-offer', validate: validateProductOffer },
        { id: 'stock', validate: validateStock }, 
        // { id: 'product-image', validate: validateImages },
        { id: 'gear', validate: validateGears },
        { id: 'break', validate: validateBrake },
        { id: 'status', validate: validateStatus },
        { id: 'color', validate: validateColor },
        { id: 'tags', validate: validateFeaturesAndTags },
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
    
        // Image Upload
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
    
        //   image handling functions.. preview, remove etc
        function handleFiles(files) {
            [...files].forEach(file => {
                if (!file.type.match('image/(jpeg|png|gif|jpg|jfif)')) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid File Type',
                        text: 'Please upload JPG, PNG, GIF or JFIF files only.'
                    });
                    return;
                }
    
                if (file.size > 10 * 1024 * 1024) {
                    Swal.fire({
                        icon: 'error',
                        title: 'File Too Large',
                        text: 'File size should not exceed 10 MB.'
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
        
        //  Submit Form
        productForm.addEventListener('submit', e => {
            e.preventDefault();
            console.log("form inside data")
            const name = document.getElementById('product-name').value
            console.log("dataname in the form",name)
    
            let isValid = true;
            inputs.forEach(({ id, validate }) => {
                const input = document.getElementById(id);
                const error = validate(input.value);
                console.log(`Validation for ${id}: ${error || 'Passed'}`);  //debugging
                showError(input, error);
                if (error) isValid = false;
            });

            const genderValid = validateGender();
            console.log(`Gender validation: ${genderValid || 'Passed'}`); //dedugging
             if (!genderValid) isValid = false;
            
            const imageError = validateImages();
            console.log(`Image validation: ${imageError || 'Passed'}`); //dedugging
            showError(imageInput, imageError);
            if (imageError) isValid = false;
    
            const frameError = validateFrameType();
            console.log(`Frame validation: ${frameError || 'Passed'}`); //dedugging
            if (frameError) {
                Swal.fire({ icon: 'error', title: 'Missing Frame Type', text: frameError });
                isValid = false;
            }
    
            // if (!isValid) {
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'Validation Error',
            //         text: 'Please correct the errors in the form.'
            //     });
            //     return;
            // }
    
            //  Send form to server
            const formData = new FormData(this);
            console.log("product form: ", formData)

            formData.append('gender', genderData);
    
            fetch('/admin/addProduct', {
                method: 'POST',
                body: formData
            })
            .then(async response => {
                const data = await response.json();
                console.log('Server response:', data); //dedugging
                if (!response.ok) {
                    if (data.errors && Array.isArray(data.errors)) {
                        data.errors.forEach(err => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Validation Error',
                                text: err
                            });
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'Something went wrong!'
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: data.message || 'Product saved successfully!',
                        timer: 1000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = '/admin/productList';
                    });
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: 'Something went wrong while saving the product.'
                });
            });
        });
    
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
        });
    
        viewProductsBtn.addEventListener('click', () => {
            window.location.href = '/admin/productList';
        });
    });
</script> */}




// ---------------------------------------------------


{/* <script> 

// Form submission,
document.getElementById('add-product-form').addEventListener('submit', async function(e){
    e.preventDefault()

    if (validationForm()){

    const formData = new FormData(this)

    // Ensure all cropped images are added to the FormData
   const previews = document.querySelectorAll('.cropped-preview');
     previews.forEach((preview, index) => {
         if (preview.src) {
    // Convert the preview image to a Blob and append to FormData
         fetch(preview.src)
           .then(res => res.blob())
           .then(blob => {
            const fileName = `productImage${index + 1}.png`; // Customize the file name
            formData.append('productImage', blob, fileName);
        });
   }
});


    try {
        const response = await fetch('/api/v1/admin/products/addProduct',{
            method: 'POST',
            body: formData
        }); 

        const result = await response.json()

        if(response.ok){
           
            Swal.fire({
            title: result.message || Success,
            text: "New product added..!",
            icon: "success"
          })
         .then(()=>{
            window.location.reload()
         })
         
            
        } else {
             // Show SweetAlert for error
        Swal.fire({
            title: 'Error!',
            text: result || 'An error occurred while adding the product.',
            icon: "error"
          });
           
        }
    } catch (error) {
    

        console.error('Error', error)
        
        Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred. Please try again later.',
        icon: "error"
      });
        
    }
  }
})


// Validation for quantity field
function validateQuantity(inputElement, errorElementId) {
 const quantityValue = parseInt(inputElement.value, 10);
  const errorElement = document.getElementById(errorElementId);
    if (isNaN(quantityValue) || quantityValue < 0) {
         errorElement.textContent = "Enter a valid quantity.";
            return false;
     } else {
        errorElement.textContent = "";
         return true;
       }
}


// Validation 
function validationForm(){
    clearErrorMessages()  // clear messages

    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('description').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    const regularPrice = document.getElementById('regularPrice').value;
    // const salePrice = document.getElementById('salePrice').value;
    const productOffer = document.getElementById('productOffer').value;
    const images = document.querySelector('input[type="file"]');

    let isValid = true




    if (name == ""){
        displayErrorMessage('productName-error', 'Please enter a product name..!');
        isValid = false;
    
    }else if (!/^[^\s][A-Za-z0-9\s]*$/.test(name.trim())) {
             displayErrorMessage('productName-error', "Product name should not start with a space and can contain alphanumeric characters and spaces.");
              isValid = false;
            }

    // Des:
    if (description.trim()==""){
        displayErrorMessage('description-error', 'Please enter product description..!');
        isValid = false;
    } 
    else if (!/^[A-Z]/.test(description.trim())) {
     displayErrorMessage('description-error', 'The description must start with a capital letter.');
    isValid = false;
    }
    else if (description.trim().length < 10 || description.trim().length > 600) {
    displayErrorMessage('description-error', 'The description must be between 10 and 300 characters.');
    isValid = false;
    }
    else if (!/^[A-Za-z0-9]/.test(description.trim())) {
    displayErrorMessage('description-error', 'The description cannot start with a special character.');
    isValid = false;
    }  
    if (!/^[^\s][a-zA-Z0-9\s.,'’()\-]+$/.test(description.trim())) {
           displayErrorMessage('description-error', 'The description should not start with a space and can only contain letters, numbers, spaces, periods, commas, apostrophes, parentheses, and hyphens.');
           isValid = false;
          }
    
    //Additional:
    if (additionalInfo.trim() == ""){
        displayErrorMessage('additionalInfo-error', 'Plese enter product additional information..!')
        isValid = false
    }
    else if (!/^(\u2022|[-*]|[A-Za-z])/.test(additionalInfo.trim())) {
                 displayErrorMessage('additionalInfo-error', 'Additional information must start with a bullet point, a dash, or an alphabetic character.');
                isValid = false;
        } 
    
    // Regular Price:
    if (regularPrice == ''){
        displayErrorMessage('regularPrice-error', 'Please enter product regular price..!');
        isValid= false;
    }
    else if (parseFloat(regularPrice)< 0){
        displayErrorMessage('regularPrice-error', 'Enter valid price..!')
        isValid= false;
    }
   

    //Product Offer:
    if(productOffer < 0 || productOffer > 100 ){
        displayErrorMessage('productOffer-error','Enter valid product offer..!')
        isValid = false;
    }
    
    if (images.files.length === 0) {
          displayErrorMessage("images-error",'Please select an image.');
          isValid = false;
      }


    // Validate each dynamically added quantity field
     document.querySelectorAll('.color-stock-item input[type="number"]').forEach((input, index) => {
        if (!validateQuantity(input, `productQuantity-error-${index}`)) {
            isValid = false;
        }
     });

    return isValid;     

}

   


// Error display function 
function displayErrorMessage(elementId, message) {
 const errorElement = document.getElementById(elementId);
     if (errorElement) { // Check if the error element exists
           errorElement.innerText = message;
           errorElement.style.display = 'block'; // Show the error message
     } else {
      console.error(`Error element with ID ${elementId} not found..!`);
    }
}


// Clear error Message function;
function clearErrorMessages(){
const errorElements = document.getElementsByClassName('error-message');
Array.from(errorElements).forEach(element =>{
    element.innerText = '';
});
}
</script> */}



// ------------------- product  script  just before autominima---------------

{/* <script>
    // ================== DOM REFERENCES ==================
    const productForm = document.getElementById('addProduct-form');
    const imageInput = document.getElementById('product-images');
    // const imagePreviewContainer = document.getElementById('image-preview');
    const imagePreviewContainer = document.querySelector('#image-preview');
    const cancelBtn = document.getElementById('cancelBtn');
    const viewProductsBtn = document.getElementById('viewProductsBtn');

    const genderCheckboxes = document.querySelectorAll('input[name="genders[]"]');
    // const genderWrapper = document.querySelector('.gender-toggles');
    const frameCheckboxes = document.querySelectorAll('input[name="frameType"]');

    // ================== IMAGE PREVIEW HANDLING ==================
    console.log("images::",imageInput.files);
    
    imageInput.addEventListener('change', () => {
        handleFiles(imageInput.files);
        console.log("images::",imageInput.files);
    });

    function handleFiles(files) {
        [...files].forEach(file => {
            console.log("images files::",files);
            if (!file.type.match('image/(jpeg|png|gif|jpg|jfif)')) {
                Swal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Only JPG, PNG, GIF, or JFIF formats allowed.' });
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                Swal.fire({ icon: 'error', title: 'File Too Large', text: 'Each file must be under 10 MB.' });
                return;
            }

            const reader = new FileReader();
            reader.onload = e => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'image-preview';

                // const img = document.createElement('img');
                // img.src = e.target.result;
                // img.alt = file.name;
                const img = document.createElement('img');
                img.className = "newImg";
                console.log("img",img);
                img.src = e.target.result;
                console.log("img.src",img.src);
                
                img.alt = file.name;

                img.classList.add('image-preview-item');
            
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', () => {
                    previewDiv.remove();
                    // validateImages();
                });

                previewDiv.append(img, removeBtn);
                imagePreviewContainer.appendChild(previewDiv);
                // validateImages();
            };
            reader.readAsDataURL(file);
        });
    }

    // ================== FORM SUBMISSION ==================
    productForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log("-----------------------------------");
        console.log("Form submitted")  // dubugging
        console.log("-----------------------------------");

        if (true) {
            const formData = new FormData(productForm);
            console.log("form data: :",formData)

            // Append actual uploaded files
            // const files = imageInput.files;
            // [...files].forEach((file, index) => {
            //     console.log("images::22",[...files]);
            //     formData.append('product-images', file);
            //     console.log("getall form data",formData.getAll('product-images') );
            //     // console.log(formData.getAll(product-images) ); 

            // });

    //         const previews = document.querySelectorAll(".newImg");
    //         console.log("previews1::", previews);
            
    //          previews.forEach((preview, index) => {
    //             console.log("previews2::", preview);

    //              if (preview.src) {
    //         // Convert the preview image to a Blob and append to FormData
    //              fetch(preview.src)
    //                .then(res => console.log("res",res))
    //                .then(blob => {
    //                 console.log("res",blob)
    //                 const fileName = `productImage${index + 1}.png`; // Customize the file name
    //                 formData.append('productImage', blob, fileName);
    //             });
    //        }
    //    });

        const files = img;



        [...files].forEach(file => {
    formData.append('productImages', file); // backend will get this as an array
  });
            console.log("-----------------------------------");
            console.log("formData.entries" ,formData);   // debugging 
            console.log("getall form data f ",formData.getAll('productImage') );
            console.log("-----------------------------------");
            try {
                const response = await fetch('/admin/addProduct', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        title: result.message || 'Success',
                        text: 'New product added..!',
                        icon: 'success'
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: result.message || 'An error occurred while adding the product.',
                        icon: 'error'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An unexpected error occurred. Please try again later.',
                    icon: 'error'
                });
            }
        }
    });

    // ================== FORM VALIDATION ==================
    function validationForm() {
        clearErrorMessages();
        let isValid = true;

        const nameInput = document.getElementById('product-name');
        const descriptionInput = document.getElementById('description');
        const additionalInfoInput = document.getElementById('tags');
        const regularPriceInput = document.getElementById('product-price');
        const productOfferInput = document.getElementById('product-offer');

        // Product name validation
        const name = nameInput.value.trim();
        if (!name) {
            showError(nameInput, 'Please enter a product name..!');
            isValid = false;
        } else if (!/^[^\s][A-Za-z0-9\s]*$/.test(name)) {
            showError(nameInput, 'Name must not start with a space and should be alphanumeric.');
            isValid = false;
        }

        // Description validation
        const description = descriptionInput.value.trim();
        if (!description) {
            showError(descriptionInput, 'Please enter a description..!');
            isValid = false;
        } else if (!/^[A-Z]/.test(description)) {
            showError(descriptionInput, 'Description must start with a capital letter.');
            isValid = false;
        }

        // Additional Info validation
        const additionalInfo = additionalInfoInput.value.trim();
        if (!additionalInfo) {
            showError(additionalInfoInput, 'Enter additional product information..!');
            isValid = false;
        }

        // Regular price validation
        const regularPrice = parseFloat(regularPriceInput.value);
        if (isNaN(regularPrice) || regularPrice < 0) {
            showError(regularPriceInput, 'Enter a valid regular price..!');
            isValid = false;
        }

        // Offer validation
        const productOffer = parseFloat(productOfferInput.value);
        if (isNaN(productOffer) || productOffer < 0 || productOffer > 100) {
            showError(productOfferInput, 'Enter valid product offer between 0–100%!');
            isValid = false;
        }

        // Image count validation
        // const imageCount = document.querySelector('.image-preview').length;
        // if (imageCount < 3) {
        //     const imageInputWrapper = document.querySelector('.image-upload-placeholder');
        //     const errorSpan = imageInputWrapper?.querySelector('.error-message');
        //     if (errorSpan) {
        //         errorSpan.textContent = 'Please upload at least 3 images.';
        //         errorSpan.classList.add('active');
        //     }
        //     isValid = false;
        // }

        // const imagePreviewContainer = document.querySelector('.image-preview');
        // const imageCount = imagePreviewContainer?.querySelectorAll('.image-preview-item')?.length || 0;

        //     if (imageCount < 3) {
        // const imageInputWrapper = document.querySelector('.image-upload-placeholder');
        // const errorSpan = imageInputWrapper?.querySelector('.error-message');
        //     if (errorSpan) {
        //     errorSpan.textContent = 'Please upload at least 3 images.';
        //     errorSpan.classList.add('active');
        // }
        // isValid = false;
        // }

        // Gender validation (at least one selected)
        const selectedGenders = Array.from(genderCheckboxes).filter(input => input.checked);
        // console.log(genderCheckboxes);
        if (selectedGenders.length === 0) {
            const genderWrapper = document.querySelector('.gender-toggles');
            const errorSpan = genderWrapper?.querySelector('.error-message');
            if (errorSpan) {
                errorSpan.textContent = 'Please select at least one gender category.';
                errorSpan.classList.add('active');
            }
            isValid = false;
        }

        // Frame type toggle selection (only one can be selected)
        // const selectedFrames = Array.from(frameCheckboxes).filter(input => input.checked);
        // if (selectedFrames.length !== 1) {
        //     const frameWrapper = document.querySelector('.frame-type-checkboxes');
        //     const errorSpan = frameWrapper?.querySelector('.error-message');
        //     if (errorSpan) {
        //         errorSpan.textContent = 'Please select exactly one frame type.';
        //         errorSpan.classList.add('active');
        //     }
        //     isValid = false;
        // }

        // return isValid;


        // ================== FRAME TYPE VALIDATION ==================
        const selectedFrame = document.querySelector('input[name="frameType"]:checked');
            if (!selectedFrame) {
        const frameWrapper = document.querySelector('.frame-type-checkboxes');
        const errorSpan = frameWrapper?.querySelector('.error-message');
            if (errorSpan) {
          errorSpan.textContent = 'Please select a frame type.';
          errorSpan.classList.add('active');
          }
            isValid = false;
        }
     }


    // ================== HELPER FUNCTIONS ==================
    // function validateImages() {
    //     const imageCount = imagePreviewContainer.querySelectorAll('.image-preview').length;
    //     const imageInputWrapper = document.querySelector('.image-upload-wrapper');
    //     const errorSpan = imageInputWrapper?.querySelector('.error-message');

    //     if (errorSpan) {
    //         if (imageCount < 3) {
    //             errorSpan.textContent = 'Please upload at least 3 images.';
    //             errorSpan.classList.add('active');
    //         } else {
    //             errorSpan.textContent = '';
    //             errorSpan.classList.remove('active');
    //         }
    // //     }
    // }

    function validateQuantity(inputElement) {
        const value = parseInt(inputElement.value, 10);
        const errorSpan = inputElement?.parentElement?.querySelector('.error-message');
        if (isNaN(value) || value < 0) {
            if (errorSpan) {
                errorSpan.textContent = 'Enter a valid quantity.';
                errorSpan.classList.add('active');
            }
            inputElement.classList.add('error');
            return false;
        } else {
            if (errorSpan) {
                errorSpan.textContent = '';
                errorSpan.classList.remove('active');
            }
            inputElement.classList.remove('error');
            return true;
        }
    }

    function showError(input, message) {
        const errorSpan = input?.parentElement?.querySelector('.error-message');
        if (!errorSpan) return;

        if (message) {
            input.classList.add('error');
            errorSpan.textContent = message;
            errorSpan.classList.add('active');
        } else {
            input.classList.remove('error');
            errorSpan.textContent = '';
            errorSpan.classList.remove('active');
        }
    }

    function clearErrorMessages() {
        document.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
            span.classList.remove('active');
        });
        document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
    }

    // ================== BUTTON ACTIONS ==================
    cancelBtn.addEventListener('click', () => {
        productForm.reset();
        imagePreviewContainer.innerHTML = '';
        clearErrorMessages();
    });

    viewProductsBtn.addEventListener('click', () => {
        window.location.href = '/admin/productList';
    }); */}
// </script>