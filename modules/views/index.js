const express = require("express");
const { runBotsInParallelController } = require("./views.controller");
const router = express.Router();

router.post("/run-bots", runBotsInParallelController);

module.exports = router;
