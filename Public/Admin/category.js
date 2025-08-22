{
  /* <script>
    // Js functions 
    function confirmListCategory(id, button) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to list this category?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, list it !'
        }).then((result)=> {
            if (result.isConfirmed) {
                // Call the back-end  API to list the category
                fetch(`/api/v1/admin/category/listCategory?id=${id}`, {
                    method: 'POST'
                }).then(response => response.json()).then(data => {
                    Swal.fire(data.message, "",'success');
                    setTimeout(()=>{
                        location.reload() 
                    },2000)
                    
                }).catch(error => {
                    Swal.fire('Error!', error.message, 'error');
                });
            }
        });
    }

    function confirmUnlistCategory(id) {
        Swal.fire({
            title: 'Are you sure',
            text: 'You want to unlist this category',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, unlist it!'
        }).then((result)=>{
            if (result.isConfirmed){
                fetch(`/api/v1/admin/category/unlistCategory?id=${id}`, {
                    method: 'POST'
                }).then(response => response.json()).then(data => {
                    Swal.fire(data.message, '', 'success');
                    setTimeout(()=>{
                        location.reload()
                    },2000)
                    
                }).catch(error =>{
                    Swal.fire('Error!'. error.message, 'error');
                });
            }
        });
    }

    function addOffer(categoryId, button) {
        Swal.fire ({
            title: 'Add Offer Percentage',
            input: 'text',
            inputLabel: 'Offer Percentage',
            inputPlaceholder: 'Enter offer percentage',
            showCancelButton: true,
            confirmButtonText: 'Add Offer',
            preConfirm : (value) => {
                if (!value || isNaN(value) || value <0 || value > 100) {
                    Swal.showValidationMessage ('Please enter a valid percentage between 1 and 100.');
                }else {
                    return fetch('/api/v1/admin/category/addOffer', {
                        method: 'POST',
                        headers: { 'Content-Type' : 'application/json'},
                        body: JSON.stringify({ categoryId, percentage: value})
                    }).then(response => {
                        if(!response.ok) throw new Error('Failed to add offer');
                        return response.json();
                    });
                }
            }
        }).then((result)=> {
            if (result.isConfirmed) {
                Swal.fire(`Offer added successfully!`, '', 'success');
                
            }
            setTimeout(()=>{
                location.reload()
            },2000)
        }).catch(error => {
            Swal.fire ('Error !', error.message, 'error');
        });

    }
    // Edit category
    function editCategory(id){
     
        window.location.href = `/api/v1/admin/category/editCategory?id=${id}`
    }

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');

    searchButton.addEventListener('click', function(){
        const searchValue = searchInput.value.trim();

        if(searchValue){
           window.location.href = `/api/v1/admin/category?search=${searchValue}`;
        }else{
            Toastify({
        text: "Enter any input here!",
        duration: 3000, 
        close: true, 
        gravity: "top", 
        position: "right", 
        backgroundColor: "#FF5733", 
        stopOnFocus: true, 
    }).showToast();
        }
    })
    
</script> */
}
