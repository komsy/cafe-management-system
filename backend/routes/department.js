const express = require("express");
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let department = req.body;
  //console.log(department)
  query = "insert into department (name,description,status) values(?,?,?)";
  connection.query(query, [department.name,department.description,department.status], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Department Added Successfully!" });
    } else {
      return res.status(500).json(err);
    }
  });
});
// router.get("/get", auth.authenticateToken, (req, res,next) => {
//     var query = "select * from department order by name";
//     connection.query(query, (err, results) => {
//       if (!err) {
//         return res.status(200).json(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     });
//   });

router.get("/get", auth.authenticateToken, (req, res, next) => {
  // Retrieve the visible column names from the docProperty table
  const columnsQuery =
    "SELECT controlName FROM docProperty WHERE docName = 'department' AND visible = 1";
  connection.query(columnsQuery, (error, propResults, fields) => {
    if (error) {
      return res.status(500).json(err);
    }
    //console.log(propResults);
    // Extract the column names from the query results
    const columns = propResults.map((row) => row.controlName);
    //console.log(columns);
    // Construct the SQL query using the retrieved column names
    const query = `SELECT ${columns.join(", ")} FROM department`;
    connection.query(query, (err, results) => {
      if (!err) {
        if (results.length === 0) {
          // Results are empty
          return res.status(200).json({columns: columns, message:"empty"});
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
router.post("/editDepartment", auth.authenticateToken, (req, res, next) => {
  const keys = Object.keys(req.body); // ["name", "description"]
  const name = req.body.name; // "name"

  // Construct the SQL query using parameterized queries
  const query = `SELECT ?? FROM department WHERE name = ?`;
  const values = [keys, name]; // Pass the array of column names and the 'name' value as parameters

  connection.query(query, values, (err, results) => {
    if (!err) {
      if (results.length === 0) {
        // Results are empty
        return res.status(200).json({ columns: keys, message: "empty" });
      } else {
        //console.log(results)
        return res.status(200).json(results);
      }
    } else {
      return res.status(500).json(err);
    }
  });
});


// router.post("/editDepartment", auth.authenticateToken, (req, res, next) => {
//   let product = req.body;
//   const keys = Object.keys(req.body); // ["name", "description"]

//   const name = keys[0]; // "name"
//   const description = keys[1]; // "description"
//     console.log(name)
//     // Construct the SQL query using the retrieved column names
//     const query = `SELECT ${product} FROM department`;
//     connection.query(query, (err, results) => {
//       if (!err) {
//         if (results.length === 0) {
//           // Results are empty
//           return res.status(200).json({columns: columns, message:"empty"});
//         } else {
//           //console.log(results);
//           return res.status(200).json(results);
//         }
//       } else {
//         return res.status(500).json(err);
//       }
//     });
// });  


router.patch(
    "/update",
    auth.authenticateToken,
    checkRole.checkRole,
    (req, res, next) => {
      let product = req.body;
      console.log(product)
      var query = "update department set name=?,description=? where name=?";
      connection.query(query, [ product.name,product.description,product.name], (err, results) => {
        if (!err) {
          if (results.affectedRows == 0) {
            return res.status(404).json({ message: "Department name is not found." });
          }
          return res.status(200).json({ message: "Department Updated Successfully!" });
        } else {
          return res.status(500).json(err);
        }
      });
    }
  );


module.exports = router;