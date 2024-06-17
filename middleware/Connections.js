import mongoose from "mongoose"
import "dotenv/config";

const conndb = (req, res) => {
  const mongoURL = process.env.MONGODB_URL;
  if (mongoose.connections[0].readyState) {
    return;
  } else {
    mongoose
      .connect(mongoURL)
      .then(() => console.log("connected"))
      .catch((e) => console.log(e));
  }
};

export default conndb;
