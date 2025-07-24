const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();
const serverUrl = "http://localhost:4000";
const crypto = require("crypto");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  return axios
    .post(serverUrl + "/users", {
      username: req.body.username,
      _id: crypto.randomBytes(8).toString("hex"),
    })
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.status(500).json({ error: "Unable to create user" });
    });
});

app.get("/api/users", (req, res) => {
  axios
    .get(serverUrl + "/users")
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.status(500).json({ error: "Unable to fetch users" });
    });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { body } = req;
  const date = body.date ? new Date(body.date).toDateString() : new Date().toDateString();
  axios
    .post(serverUrl + "/exercises", {
      description: body.description,
      duration: body.duration,
      date: date,
      _id: req.params._id,
    })
    .then((resultEx) => {
      axios
        .get(serverUrl + `/users?_id=${req.params._id}`)
        .then((resultUser) => {
          if (!resultUser.data || !resultUser.data.length) {
            return res.status(404).json({ error: "User not found" });
          }
          const { username } = resultUser.data[0];
          const { _id, description, duration, date } = resultEx.data;
          res.json({
            _id,
            username,
            date,
            duration,
            description,
          });
        })
        .catch(() => res.status(500).json({ error: "Unable to fetch user" }));
    })
    .catch(() => res.status(500).json({ error: "Unable to create exercise" }));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
