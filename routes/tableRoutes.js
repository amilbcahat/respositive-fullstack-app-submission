const tableController = require("./../controllers/tableController.js");
const express = require("express");
const router = express.Router();

router.route("/newTable").post(tableController.newTable);
router.route("/updateTable").patch(tableController.updateTable);
router.route("/deleteTable").delete(tableController.deleteTable);
router.route("/getAllTables").get(tableController.getAllTables);
router.route("/getCSV").post(tableController.getTableCSVData);
module.exports = router;
