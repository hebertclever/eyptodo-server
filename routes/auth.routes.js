const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");

const User = require("../models/User.model");

// Sign-up
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Verificar se username e password nao estao em branco
  if (!password || !username) {
    return res
      .status(400)
      .json({ message: "Please provide an username and password" });
  }

  // Verificar a forca da senha
  if (password.length < 7) {
    return res.status(400).json({
      message:
        "Please make your password at least 8 characters long for security purposes",
    });
  }

  // Verificar se este nome de usuario ja foi cadastrado
  const result = await User.findOne({ username });

  console.log(result);
  if (result) {
    return res.status(400).json({
      message: "This username already exists. Please choose another.",
    });
  }

  // Criptografar senha antes de inserir no banco
  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(password, salt);

  const savedUser = await User.create({ username, password: hashPass });

  return res.status(201).json(savedUser);
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, userObj, failureDetails) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong while authenticating user" });
    }

    if (!userObj) {
      return res.status(401).json(failureDetails);
    }

    req.login(userObj, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went bad while saving session" });
      }

      return res.status(200).json(userObj);
      // Tambem podemos retornar diretamente req.user que o Passport criou automaticamente apos salvar a sessao
      // return res.status(200).json(req.user);
    });
  })(req, res, next);
});

// Logout
router.post("/logout", async (req, res) => {
  req.logout();
  return res.status(200).json({ message: "Log-out success!" });
});

// Verificar seu o usuario esta autenticado
router.get("/loggedin", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  }
  return res.status(401).json({ message: "Unauthorized" });
});

module.exports = router;
