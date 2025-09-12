const express = require("express");
const { getStudentData, addStudentData, updateStudentData, deleteStudentData } = require("../controllers/studentController");

const router = express.Router();

router.get("/:roll", getStudentData);
router.post("/", addStudentData);
router.put("/:roll", updateStudentData);
router.delete("/:roll", deleteStudentData);

module.exports = router;