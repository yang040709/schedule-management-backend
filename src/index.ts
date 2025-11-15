import { add } from "./utils";
import dotenv from "dotenv";
import app from "./app";
dotenv.config();

const PORT = process.env.PORT || 3000;
// console.log(import.meta?.env);
// console.log(process?.env.API_KEY);

// console.log("hello123");
// console.log(add(1, 2));

const init = () => {
  app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

init();
