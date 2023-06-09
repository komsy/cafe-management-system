const express = require("express");
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let menuItems = req.body;
  query = "insert into menuItems (menuName,tableName,submenu,priorityNo) values(?,?,?,?)";
  connection.query(query, [menuItems.menuName,menuItems.tableName,menuItems.submenu,menuItems.priorityNo], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Menu Items Added Successfully!" });
    } else {
      return res.status(500).json(err);
    }
  });
});
router.get("/get", auth.authenticateToken, (req, res,next) => {
    // var query = "select * from menuItems order by name";  
    var query = "select * from menuItems";
    connection.query(query, (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else {
        return res.status(500).json(err);
      }
    });
  });
  
router.patch(
    "/update",
    auth.authenticateToken,
    checkRole.checkRole,
    (req, res, next) => {
      let product = req.body;
      var query = "update menuItems set name=? where id=?";
      connection.query(query, [ product.name,product.id], (err, results) => {
        if (!err) {
          if (results.affectedRows == 0) {
            return res.status(404).json({ message: "menuItems id is not found." });
          }
          return res.status(200).json({ message: "menuItems Updated Successfully!" });
        } else {
          return res.status(500).json(err);
        }
      });
    }
  );


module.exports = router;