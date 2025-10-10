



const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const auth = require("../Middlewares/auth");
const Notification = require("../models/Notification");
const exceljs = require('exceljs');


// Main Dashboard Summary Cards
router.get("/summary", auth(["admin"]), async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "received" });
    const assigned = await Complaint.countDocuments({ status: "assigned" });
    const inReview = await Complaint.countDocuments({ status: { $regex: /in_review|in review/i } });
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const activeUsers = await User.countDocuments({ role: { $in: ["user", "volunteer", "admin"] } });

    res.json({ total, pending, assigned, inReview, resolved, activeUsers });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Issue Type Summary for Pie Chart
router.get("/issue-type-summary", auth(["admin"]), async (req, res) => {
  try {
    const issueData = await Complaint.aggregate([
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
      { $sort: { name: 1 } }
    ]);
    res.json(issueData);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Priority Summary for Bar Chart
router.get("/summary/priority", auth(["admin"]), async (req, res) => {
    try {
        const priorityData = await Complaint.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
            { $project: { name: "$_id", count: "$count", _id: 0 } },
            {
                $addFields: { 
                    order: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$name", "High"] }, then: 1 },
                                { case: { $eq: ["$name", "Medium"] }, then: 2 },
                                { case: { $eq: ["$name", "Low"] }, then: 3 }
                            ],
                            default: 4
                        }
                    }
                }
            },
            { $sort: { order: 1 } }
        ]);
        res.json(priorityData);
    } catch (err) {
        console.error("Error fetching priority summary:", err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// Monthly Summary for Line Chart
router.get("/summary/monthly", auth(["admin"]), async (req, res) => {
    try {
        const monthlyData = await Complaint.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }, 
            { $project: { month: "$_id", count: "$count", _id: 0 } }
        ]);
        res.json(monthlyData);
    } catch (err) {
        console.error("Error fetching monthly summary:", err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// Get All Complaints (with status filter)
router.get("/complaints", auth(["admin"]), async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== "all" ? { status } : {};
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate("user_id", "name email")
      .populate("assigned_to", "name email");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching complaints" });
  }
});

// Admin deletes any complaint
router.delete("/complaints/:id", auth(["admin"]), async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ msg: "Complaint not found" });
        }
        await Notification.deleteMany({ complaintId: req.params.id });
        await complaint.deleteOne();
        res.json({ msg: "Complaint removed successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// Get User Summary Cards 
router.get("/users/summary", auth(["admin"]), async (req, res) => {
    try {
        const [totalUsers, regularUsers, volunteers, admins] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: { $regex: /^user$/i } }),
            User.countDocuments({ role: { $regex: /^volunteer$/i } }),
            User.countDocuments({ role: { $regex: /^admin$/i } })
        ]);
        res.json({ total: totalUsers, users: regularUsers, volunteers: volunteers, admins: admins });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Detailed Stats for a Single User (handles volunteers correctly)
router.get("/users/:userId/details", auth(["admin"]), async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let queryField;
        if (user.role === 'volunteer') {
            queryField = { assigned_to: userId };
        } else {
            queryField = { user_id: userId };
        }

        const [totalComplaints, resolvedComplaints, pendingComplaints] = await Promise.all([
            Complaint.countDocuments(queryField),
            Complaint.countDocuments({ ...queryField, status: 'resolved' }),
            Complaint.countDocuments({ ...queryField, status: { $in: ['received', 'assigned', 'in_review'] } })
        ]);

        res.json({ totalComplaints, resolvedComplaints, pendingComplaints });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all users with their complaint counts
router.get("/users", auth(["admin"]), async (req, res) => {
  try {
    const users = await User.aggregate([
        {
            $lookup: { from: 'complaints', localField: '_id', foreignField: 'user_id', as: 'createdComplaints' }
        },
        {
            $lookup: { from: 'complaints', localField: '_id', foreignField: 'assigned_to', as: 'assignedComplaints' }
        },
        {
            $project: {
                _id: 1, name: 1, email: 1, role: 1, createdAt: 1,
                complaintCount: {
                    $cond: { if: { $eq: ["$role", "volunteer"] }, then: { $size: '$assignedComplaints' }, else: { $size: '$createdComplaints' } }
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users with complaint count:", err);
    res.status(500).json({ msg: "Error fetching users" });
  }
});

// Get All Volunteer Users
router.get("/volunteers", auth(["admin"]), async (req, res) => {
  try {
    const volunteers = await User.find({ role: { $regex: /^volunteer$/i } }).select("name email");
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching volunteers" });
  }
});

// Get Recent Activity Log
router.get("/activity-log", auth(["admin"]), async (req, res) => {
    try {
        const activities = await Notification.find({ type: { $ne: 'report_downloaded' } }).sort({ createdAt: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});



// ------------ REPORTS & ANALYTICS ROUTES ----------
router.get("/reports/summary", auth(["admin"]), async (req, res) => {
    try {
        const resolvedComplaints = await Complaint.find({ status: 'resolved' });
        const casesSolved = resolvedComplaints.length;
        let totalResolutionTime = 0;
        resolvedComplaints.forEach(c => {
            const created = new Date(c.createdAt).getTime();
            const resolved = new Date(c.updatedAt).getTime(); 
            totalResolutionTime += (resolved - created);
        });
        const avgMilliseconds = casesSolved > 0 ? totalResolutionTime / casesSolved : 0;
        const avgDays = (avgMilliseconds / (1000 * 60 * 60 * 24)).toFixed(1);
        const totalCases = await Complaint.countDocuments();
        const resolutionRate = totalCases > 0 ? ((casesSolved / totalCases) * 100).toFixed(1) : 0;
        res.json({
            casesSolved,
            reportsReady: casesSolved, 
            resolutionRate,
            avgResolutionTime: `${avgDays} days`,
        });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

router.get("/reports/category-breakdown", auth(["admin"]), async (req, res) => {
    try {
        const breakdown = await Complaint.aggregate([
            { $match: { status: 'resolved' } }, 
            { $group: { _id: '$issueType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, 
           
            { $project: { name: '$_id', count: 1, _id: 0 } } 
        ]);

        const total = await Complaint.countDocuments({ status: 'resolved' });
        
       
        const dataWithPercentage = breakdown.map(item => ({
            name: item.name, 
            count: item.count,
            percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0
        }));

        res.json(dataWithPercentage);
    } catch (err) { 
        console.error("Error fetching category breakdown:", err);
        res.status(500).json({ msg: "Server Error" }); 
    }
});



router.post("/reports/log-download", auth(["admin"]), async (req, res) => {
    try {
        const newLog = new Notification({
            message: `A report was downloaded by admin ${req.user.name}`,
            type: 'report_downloaded',
            user_id: req.user.id
        });
        await newLog.save();
        res.status(200).send("Logged successfully");
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

router.get("/reports/export-excel", auth(["admin"]), async (req, res) => {
    try {
        const complaints = await Complaint.find({ status: 'resolved' }).populate("user_id", "name").populate("assigned_to", "name").sort({ updatedAt: -1 });
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Completed Cases');
        worksheet.columns = [
            { header: 'Case ID', key: 'id', width: 15 },
            { header: 'Title', key: 'title', width: 40 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Complainant', key: 'complainant', width: 25 },
            { header: 'Completed By', key: 'completedBy', width: 25 },
            { header: 'Completed Date', key: 'date', width: 20 }
        ];
        complaints.forEach(c => {
            worksheet.addRow({
                id: c._id.toString().slice(-6).toUpperCase(),
                title: c.title,
                category: c.issueType,
                complainant: c.user_id ? c.user_id.name : 'N/A',
                completedBy: c.assigned_to ? c.assigned_to.name : 'N/A',
                date: new Date(c.updatedAt).toLocaleDateString()
            });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'completed-cases.xlsx');
        await workbook.xlsx.write(res);
        res.end();
        const newLog = new Notification({ message: `Excel report downloaded by ${req.user.name}`, type: 'report_downloaded', user_id: req.user.id });
        await newLog.save();
    } catch (err) {
        console.error("Excel Export Error:", err);
        res.status(500).send('Error generating Excel file');
    }
});


router.get("/test-inreview-count", async (req, res) => {
    try {
        const regexCount = await Complaint.countDocuments({ status: { $regex: /in_review|in review/i } });
        const strictCount = await Complaint.countDocuments({ status: "in_review" });
        const foundComplaints = await Complaint.find({ status: { $regex: /in_review|in review/i } }).select('title status');
        const allStatuses = await Complaint.distinct("status");
        res.json({ flexibleRegexCount: regexCount, strictUnderscoreCount: strictCount, foundComplaints: foundComplaints, allUniqueStatusesInDB: allStatuses });
    } catch (err) {
        res.status(500).json({ msg: "Error in test route. Check logs." });
    }
});

module.exports = router;