const express = require("express");
const connection = require("../connection");
const router = express.Router();
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/signup", (req, res) => {
  let user = req.body;

  // Validate name
  if (!user.name) {
    return res.status(400).json({ error: "Name is required." });
  }

  // Validate contactNumber
  if (!user.contactNumber) {
    return res.status(400).json({ error: "Contact number is required." });
  }

  // Validate email
  if (!user.email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // Validate password
  if (!user.password) {
    return res.status(400).json({ error: "Password is required." });
  } else if (user.password.length <= 6) {
    return res.status(400).json({ error: "Password must be more than 6 characters." });
  }
  // if (user.password != user.password_confirmation ) {
  //   return res.status(400).json({ error: "Password does not match." });
  // }
  bcrypt.genSalt(13, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return res.status(500).json({ error: "Error occurred while hashing password." });
      }

      query = "SELECT email, password, role, status FROM user WHERE email=?";
      connection.query(query, [user.email], (err, results) => {
        if (!err) {
          if (results.length <= 0) {
            query = "INSERT INTO user(name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
            connection.query(query, [user.name, user.contactNumber, user.email, hash], (err, results) => {
              if (!err) {
                const response = { email: user.email,name: user.name, role: 'user' };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: "8h" });
                res.status(200).json({ token: accessToken,message: "Successfully Registered!" });
                //res.status(200).json({ message: "Successfully Registered!" });
              } else {
                return res.status(500).json(err);
              }
            });
          } else {
            return res.status(400).json({ message: "Email already exists." });
          }
        } else {
          return res.status(500).json(err);
        }
      });
    });
  });
});


router.post("/login", (req, res) => {
  const user = req.body;
// Validate email and password
if (!user.email || !user.password) {
  return res.status(400).json({ message: "Email and password are required." });
}
  query = "select email,name,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      //compare user pswd with encrypted pswd
      bcrypt.compare(
        user.password,
        results[0].password,
        function (err, isMatch) {
          //check if user was found by eail and pswd matches
          if (results.length <= 0 || !isMatch) {
            return res
              .status(401)
              .json({ error: "Incorrect Username or Password." });
          } else if (results[0].status === "false") {
            return res.status(401).json({ message: "Wait for Admin Approval" });
          } else if (isMatch) {
            //generate a token
            const response = { email: results[0].email, name: results[0].name, role: results[0].role };
            const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
              expiresIn: "8h",
            });
            res.status(200).json({ token: accessToken, message: "Welcome back!" + results[0].name  });
          } else {
            return res.status(400).json({
              message: "Something went wrong. Please try again later.",
            });
          }
        }
      );
    } else {
      return res.status(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(200)
          .json({ message: "Password sent successfully to your email." });
      } else {
        var mailOptions = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Password by Cafe Management System",
          html:
            "<p><b>Your Login details for Cafe Management System</b><br><b>Email: </b>" +
            results[0].email +
            "<br><b>Password: </b>" +
            results[0].password +
            '<br><a href="http://localhost:4200/">Click here to login</a></p>',
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        //save new password to db
        return res
          .status(200)
          .json({ message: "Password sent successfully to your email." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  const user = req.body;
  query =
    "select id,name,email,contactNumber,status from user where role='user'";
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
  (req, res) => {
    const user = req.body;
    query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "User name does not exist." });
        }
        return res.status(200).json({ message: "User Updated Successfully!" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.patch("/changePassword", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [email], (err, results) => {
    if (typeof results[0] !== 'undefined' && results[0] !== null) {
    if (!err) {
      //compare user pswd with encrypted pswd
      // results[0].password givin error on wrong email
      bcrypt.compare(
        user.oldPassword,
        results[0].password,
        function (err, isMatch) {
          if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old Password" });
          } else if (isMatch) {
            bcrypt.genSalt(13, function (err, salt) {
              bcrypt.hash(user.newPassword, salt, function (err, hash) {
                //console.log(hash);
                const updateQuery =
                  "UPDATE user SET password = ? WHERE email = ?";
                connection.query(
                  updateQuery,
                  [hash, email],
                  (err, results) => {
                    if (!err) {
                      return res
                        .status(200)
                        .json({ message: "Password Updated Successfully" });
                    } else {
                      return res.status(500).json(err);
                    }
                  }
                );
              });
            }); //end of encrypt
          } else {
            return res
              .status(400)
              .json({ message: "Something went wrong. Please try again lter" });
          }
        }
      ); //end of bcrypt compare
    } 
    else {
      return res.status(500).json(err);
    }
  }else{
    return res.status(404).json({ message: "User does not exist"});
  }
  });
});

module.exports = router;

