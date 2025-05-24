
export const  validateProductData = (data, files) => {
    const errors = [];

    // Product Name
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
        errors.push("Product name must be at least 3 characters long.");
    } else if (!/^[A-Z][a-zA-Z0-9+\-\s]*$/.test(data.name)) {
        errors.push("Product name must start with a capital letter and contain only letters, numbers, spaces, +, or -.");
    }

    // Description
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
        errors.push("Description must be at least 10 characters long.");
    }
    
    // Price
    const price = Number(data.price);
    if (isNaN(price) || !Number.isInteger(price) || price <= 0) {
         errors.push("Product price must be a positive whole number.");
    }

    // Offer 
    if (data.offer !== undefined && data.offer !== '') {
        const offer = Number(data.offer);
        if ( isNaN(offer) ||!Number.isInteger(offer) ||offer < 0 ||offer > 100) {
            errors.push("Product offer must be an integer between 0 and 100.");
        }
    }

    // Brand
    if (!data.brand || typeof data.brand !== 'string' || data.brand.trim() === '') {
        errors.push("Brand is required.");
    }

     //Category
    if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
        errors.push("Category is required.");
    }

    // Gears
    if (!data.gears || !["geared(1x7)", "singlespeed", "geared(3x7)"].includes(data.gears)) {
        errors.push("Gears must be one of: geared(1x7), singlespeed, or geared(3x7).");
    }
      
    // Brake
    if (!data.break || !["Disc", "Drum"].includes(data.break)) {
        errors.push("Brake must be either 'Disc' or 'Drum'.");
    }

    // Stock
    const stock = Number(data.stock);
    if (isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
        errors.push("Stock quantity must be a non-negative whole number.");
    }
    
   //frame type
      if (!data.frame || !['alloy', 'carbonfibre'].includes(data.frame.toLowerCase())) {
        errors.push("Frame type must be either 'alloy' or 'carbonfibre'.");
      }

    // Images
    if (!files || files.length < 3) {
        errors.push("At least 3 images are required.");
    }

    //tags and features
    const features = data.features || [];
    const tags = data.tags || '';
    
      if ((!Array.isArray(features) || features.length === 0) && (!tags || tags.trim().length === 0)) {
        errors.push("Provide at least one tag or select a feature.");
      }

    // gender
    if (
        !data.Gender ||
        !Array.isArray(data.Gender) ||
        data.Gender.length === 0 ||
        !Object.values(data.Gender[0]).some(val => val === true))
        {
        errors.push("Please select at least one gender category.");
    }
     //status
     if (!data.status || !["in-stock", "out-of-stock", "coming-soon"].includes(data.status)) {
        errors.push("Status must be one of: in-stock, out-of-stock, or coming-soon.");
    }
    //color
    if (!data.color || typeof data.color !== 'string' || !data.color.trim()) {
        errors.push("Color is required and must be a non-empty string.");
    }
  //size

    const validSizes = ["small", "medium", "large"];
      if (!data.size || !validSizes.includes(data.size.toLowerCase())) {
        errors.push("Size must be one of: small, medium, or large.");
    }
    
    return errors;
}