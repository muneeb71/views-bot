const { getValueWithErrorMargin } = require("../../utils/helper");
const { runBotsInParallelService } = require("./views.service");

const runBotsInParallelController = async (req, res) => {
  try {
    const { botCount, views } = req.body;
    if (!botCount || !views)
      return res.status(400).json({ message: "Invalid Data" });
    const _views = getValueWithErrorMargin(views);
    runBotsInParallelService(botCount, _views);
    res
      .status(200)
      .json({ status: true, message: "Bots started successfully" });
  } catch (err) {
    res.status(500).json({ error: `Error starting bots: ${err.message}` });
  }
};

module.exports = {
  runBotsInParallelController,
};
