const mongoose = require("mongoose");

const CONNECTION_STRING = process.env.CONNECTION_STRING;
mongoose
  .connect(
    CONNECTION_STRING
  )
  .then(() => console.log("db connecté !"))
  .catch((error) => console.log(error));
