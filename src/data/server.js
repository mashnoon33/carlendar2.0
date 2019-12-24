var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");

var rs = require("randomstring");
var findRemoveSync = require("find-remove");

var name = "";
var upperBound = "1gb";
var port = process.env.PORT || 8000;
console.log(port);
var result = findRemoveSync(__dirname + "/download", {
	age: {
		seconds: 3600,
	},
	extensions: ".ics",
});

app.listen(port);

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post("/cal", function(req, resp) {
	var cat = req.body.data.split("\\n");
	name = "carlendar" + req.body.id;
	fs.writeFile("download/" + name + ".ics", cat.join("\n"), err => {
		console.log(name);
	});
	resp.sendStatus(200);
});
app.get("/download", function(req, res) {
	res.send("download/carlendar");
});
