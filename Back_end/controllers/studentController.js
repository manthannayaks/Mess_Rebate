const Student = require("../models/Student");

// GET student by rollNo
const getStudentData = async (req, res) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.roll });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Convert Map to Object for easier frontend handling
    const recordsObj = {};
    let totalRebate = 0;
    
    for (const [month, data] of student.records.entries()) {
      recordsObj[month] = {
        present: data.present,
        absent: data.absent,
        rebate: data.rebate
      };
      totalRebate += data.rebate || 0;
    }

    res.json({
      rollNo: student.rollNo,
      name: student.name,
      records: recordsObj,
      totalRebate
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST new student
const addStudentData = async (req, res) => {
  try {
    const { rollNo, name, records } = req.body;
    if (!rollNo || !name) return res.status(400).json({ message: "rollNo and name required" });

    const student = new Student({ rollNo, name, records });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: "Error adding student", error: err.message });
  }
};

// PUT update student
const updateStudentData = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { rollNo: req.params.roll },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: "Error updating student", error: err.message });
  }
};

// DELETE student
const deleteStudentData = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ rollNo: req.params.roll });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting student", error: err.message });
  }
};

module.exports = { getStudentData, addStudentData, updateStudentData, deleteStudentData };