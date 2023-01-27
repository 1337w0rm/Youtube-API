const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userHandler = require("./routeHandler/userHandler");
const videoHandler = require("./routeHandler/videoHandler");
const cors = require('cors');

//express initialization
const app = express();
//require('dotenv').config()
dotenv.config();
app.use(express.json());

app.use(cors());

//database connection with mongoose
mongoose.set("strictQuery", true);
// nstead of http://localhost you have to wite http://0.0.0.0 to
// connect the database (connection string)
mongoose
  .connect("mongodb+srv://aditya:aditya123@finalproject.zx9y8.mongodb.net/Youtube?retryWrites=true", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connection successfull"))
  .catch((err) => console.log(err));

app.use("/user", userHandler);
app.use("/video", videoHandler);

//default error handler
const errorHandler = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
}

app.use(errorHandler);

app.listen(3000, () => {
  console.log("app listening at port 3000");
});
