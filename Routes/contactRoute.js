import express from "express";

const router = express.Router();

// Google Apps Script URL - Update this with your deployment URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDxmUZdxxpT3026-cBPjtttAoKDaN2QRitqT1IFcxn3xY1Lsb0yfp-1a20hFCoVmszDg/exec";

// Contact form submission endpoint
router.post("/contact-submit", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required" 
      });
    }

    console.log("Contact form submission:", { name, email, phone, message });

    // Send data to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        message
      })
    });

    const responseText = await response.text();
    console.log("Google Apps Script raw response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      console.log("Response was:", responseText.substring(0, 200));
      
      // If we got HTML back, it means the deployment URL is wrong or script failed
      return res.status(500).json({ 
        success: false, 
        error: "Invalid Google Apps Script deployment. Please check your deployment URL." 
      });
    }
    
    console.log("Google Apps Script response:", data);
    
    if (data.success) {
      return res.status(200).json({ 
        success: true, 
        message: "Message saved successfully" 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: data.error || "Failed to save message" 
      });
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
