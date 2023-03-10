const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { userRouter, companyRouter, modelContractRouter, contractRouter } = require("./routes");

require("dotenv").config();
require("./db")();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/company", companyRouter);
app.use("/model-contract", modelContractRouter);
app.use("/contract", contractRouter);

app.get("/ping", (req, res) => {
  return res.json({
    error: false,
    message: "Server is healthy",
  });
});

app.listen(PORT, () => {
  console.log("Server started listening on PORT : " + PORT);
});
