const { getValueWithErrorMargin } = require("../../utils/helper");
const { runBotsInParallel } = require("./clicks.service");

const runBots = async (req, res) => {
  try {
    const { botCount, clicks } = req.body;
    if (!botCount || !clicks)
      return res.status(400).json({ message: "Invalid Data" });
    const _clicks = getValueWithErrorMargin(clicks);
    runBotsInParallel(botCount, _clicks);
    res.status(200).json({ status: true, message: "Bots are running" });
  } catch (error) {
    res.status(500).json({ error: `Error running bots: ${error.message}` });
  }
};

module.exports = {
  runBots,
};
