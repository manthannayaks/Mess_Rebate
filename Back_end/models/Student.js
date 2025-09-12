const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  records: {
    type: Map,
    of: new mongoose.Schema({
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      rebate: { type: Number, default: 0 }
    }, { _id: false })
  }
});

module.exports = mongoose.model("Student", studentSchema);