const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const port = process.env.PORT;

// Database
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB connected"))
    .catch((error) => console.log(error));

// Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const linkRoutes = require("./routes/link");

// App Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb", type: "application/json" }));
app.use(cors({ origin: process.env.CLIENT_URL }));

// Middlewares
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", linkRoutes);

app.listen(port, () => {
    console.log("Server is running on port:", port);
});
