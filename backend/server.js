const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const exploreRoutes = require("./src/routes/explore.routes");
app.use("/api", exploreRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running ");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
