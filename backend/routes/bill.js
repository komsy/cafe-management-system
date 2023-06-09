const express = require("express");
const connection = require("../connection");
const router = express.Router();

let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
let fs = require("fs");
let uuid = require("uuid");
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/generateReport", auth.authenticateToken, (req, res) => {
  const generatedUuid = uuid.v1();
  const orderDetails = req.body;
  var productDetailsReport = JSON.parse(orderDetails.productDetails);
 
  query =
    "insert into bill (name,uuid,email,contactNumber,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?)";
  connection.query(
    query,
    [orderDetails.name,generatedUuid,orderDetails.email,
      orderDetails.contactNumber,orderDetails.paymentMethod,orderDetails.totalAmount,
      orderDetails.productDetails,res.locals.email,
    ],
    (err, results) => {
      if (!err) {
        ejs.renderFile(
          path.join(__dirname, "", "report.ejs"),
          {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactNumber: orderDetails.contactNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount,
          },
          (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json(err);
            } else {
              pdf.create(results).toFile(
                "./generated_pdf/" + generatedUuid + ".pdf",
                function (err, data) {
                  if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                  } else {
                    res.status(200).json({ uuid: generatedUuid });
                  }
                }
              );
            }
          }
        );
      } else {
        return res.status(500).json(err);
      }
    }
  );
});


router.post("/getPdf", auth.authenticateToken, (req, res) => {
    const orderDetails = req.body;
    const pdfPath = "./generated_pdf/" + orderDetails.uuid + ".pdf";
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }else{
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(
            path.join(__dirname, "", "report.ejs"),
            {
              productDetails: productDetailsReport,
              name: orderDetails.name,
              email: orderDetails.email,
              contactNumber: orderDetails.contactNumber,
              paymentMethod: orderDetails.paymentMethod,
              totalAmount: orderDetails.totalAmount,
            },
            (err, results) => {
              if (err) {
                console.log(err);
                return res.status(500).json(err);
              } else {
                pdf.create(results).toFile(
                  "./generated_pdf/" + orderDetails.uuid + ".pdf",
                  function (err, data) {
                    if (err) {
                      console.log(err);
                      return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                  }
                );
              }
            }
          );
    }
});

router.get("/getBills", auth.authenticateToken, (req, res,next) => {
  var query = "select * from bill order by id desc";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.delete(
  "/delete/:id",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res, next) => {
    const id = req.params.id;
    var query = "delete from bill where id = ?";
    connection.query(query, [id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Bill id is not found." });
        }
        return res
          .status(200)
          .json({ message: "Bill Deleted Successfully!" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);


router.get("/getDetails", auth.authenticateToken, (req, res, next) => {
  // Retrieve the visible column names from the docProperty table
  const columnsQuery =
    "SELECT controlName FROM docProperty WHERE docName = 'bill' AND visible = 0";
  connection.query(columnsQuery, (error, propResults, fields) => {
    if (error) {
      return res.status(500).json(err);
    }
    //console.log(propResults);
    // Extract the column names from the query results
    const columns = propResults.map((row) => row.controlName);
    //console.log(columns);
    return res.status(200).json({columns: columns, results:propResults});
  });
});
router.get("/getReadonly", auth.authenticateToken, (req, res, next) => {
  // Retrieve the visible column names from the docProperty table
  const columnsQuery =
    "SELECT controlName FROM docProperty WHERE docName = 'bill' AND locked = 1";
  connection.query(columnsQuery, (error, propResults, fields) => {
    if (error) {
      return res.status(500).json(err);
    }
    //console.log(propResults);
    // Extract the column names from the query results
    const columns = propResults.map((row) => row.controlName);
    //console.log(columns);
    return res.status(200).json({columns: columns, results:propResults});
  });
});
module.exports = router;
