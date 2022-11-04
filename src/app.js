const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
require("./db")();

const app = express();
// Middlewares
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use("/users", require("./routes/users"));
app.use("/company", require("./routes/company"));
// app.use("/records", require("./routes/records"));
app.get("/ping", (req, res) => {
  return res.send({
    error: false,
    message: "Server is healthy",
  });
});
// Socket IO
// const httpServer = require("./socket")(app);

app.listen(PORT, () => {
  console.log("Server started listening on PORT : " + PORT);
});
