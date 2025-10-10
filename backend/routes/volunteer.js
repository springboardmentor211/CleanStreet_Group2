
const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const auth = require("../Middlewares/auth");


router.get("/summary", auth(["volunteer"]), async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const totalAssigned = await Complaint.countDocuments({ assigned_to: volunteerId });
    const resolved = await Complaint.countDocuments({ assigned_to: volunteerId, status: "resolved" });
    const pending = await Complaint.countDocuments({ 
        assigned_to: volunteerId, 
        status: { $in: ["assigned", "in_review"] } 
    });

    res.json({ totalAssigned, resolved, pending });
  } catch (err) {
    console.error("Error in volunteer summary:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.get("/history", auth(["volunteer"]), async (req, res) => {
  try {
    const complaints = await Complaint.find({ assigned_to: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user_id", "name"); 

    res.json(complaints);
  } catch (err) {
    console.error("Error in volunteer history:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



const handleSetInReview = async (complaintId) => {
  
    const reviewNotes = prompt("Enter any notes for your review (optional):");

    try {
        const token = localStorage.getItem('token'); // Or however you get your auth token
        const res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/review`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "x-auth-token": token 
            },
            body: JSON.stringify({ reviewNotes: reviewNotes || "Volunteer has started reviewing this complaint." })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.msg || "Failed to update status.");
        }

        
        const updatedComplaint = await res.json();
        setComplaints(currentComplaints => 
            currentComplaints.map(c => 
                c._id === complaintId ? updatedComplaint : c
            )
        );

        alert("Complaint status updated to 'In Review'.");

    } catch (err) {
        console.error("Error setting complaint to in review:", err);
        alert(`Error: ${err.message}`);
    }
};



module.exports = router;