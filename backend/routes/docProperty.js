const express = require("express");
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let docProperty = req.body;
  query =
    "insert into docProperty (docName,controlName,controllabel,controlType,visible,locked,decimals) values(?,?,?,?,?,?,?)";
  connection.query(
    query,
    [
      docProperty.docName,
      docProperty.controlName,
      docProperty.controllabel,
      docProperty.controlType,
      docProperty.visible,
      docProperty.locked,
      docProperty.decimals,
    ],
    (err, results) => {
      if (!err) {
        return res
          .status(200)
          .json({ message: "Doc Property Added Successfully!" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});
router.get("/get", auth.authenticateToken, (req, res, next) => {
  // Retrieve the visible column names from the docProperty table
  const columnsQuery =
    "SELECT controlName FROM docProperty WHERE docName = 'department' AND visible = 1";
  connection.query(columnsQuery, (error, results, fields) => {
    if (error) {
      return res.status(500).json(err);
    }
    console.log(results);
    // Extract the column names from the query results
    const columns = results.map((row) => row.controlName);

    // Construct the SQL query using the retrieved column names
    const query = `SELECT ${columns.join(", ")} FROM department`;
    connection.query(query, (err, results) => {
      if (!err) {
        if (results.length === 0) {
          // Results are empty
          return res.status(200).json(columns);
        } else {
          console.log(results);
          return res.status(200).json(results);
        }
      } else {
        return res.status(500).json(err);
      }
    });

  });
});
  
router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res, next) => {
    let product = req.body;
    var query = "update docProperty set name=? where id=?";
    connection.query(query, [product.name, product.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res
            .status(404)
            .json({ message: "docProperty id is not found." });
        }
        return res
          .status(200)
          .json({ message: "docProperty Updated Successfully!" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

module.exports = router;
