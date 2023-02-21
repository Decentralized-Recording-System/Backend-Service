const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { userRouter, companyRouter } = require("./routes");

require("dotenv").config();
require("./db")();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/users", userRouter);
app.use("/company", companyRouter);
// for feature
app.use("/model-contract");
app.use("/contract");
// for feature
app.get("/ping", (req, res) => {
  return res.send({
    error: false,
    message: "Server is healthy",
  });
});

app.listen(PORT, () => {
  console.log("Server started listening on PORT : " + PORT);
});
