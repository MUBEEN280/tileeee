const mongoose = require("mongoose");

const tileSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  referenceNumber: { type: String, required: true },
  tileQuantity: { type: Number, required: true },
  tileSize: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TileSubmission", tileSubmissionSchema);
