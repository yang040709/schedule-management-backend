// import { add } from "./utils/index.js";
import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "@/config/db";
dotenv.config();

const PORT = process.env.PORT || 3000;
const init = async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

init();
