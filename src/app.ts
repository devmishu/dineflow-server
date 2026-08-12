import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome Dineflow server ",
  });
});

app.use("/api", routes);

export default app;