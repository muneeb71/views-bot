const express = require("express");
const { runBots } = require("./clicks.controller");
const router = express.Router();

router.post("/run-bots", runBots);

module.exports = router;
