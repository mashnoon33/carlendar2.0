var JSONItems = [""];
var terms = [];
//console.log(JSONItems.results.length);
var cal = ics();
var rrule = {
	freq: "WEEKLY",
};
$.getJSON("data/dates.json", function(data) {
	terms = data;
});

var termSTART = "";
var termEND = "";

var que = [];
var sel = $(".ui.dropdown.second");
var start;
var end;
var save = false;

window.addEventListener("load", async e => {
	await loadJsons();
});

async function loadJsons() {
	console.log("JSON loading!");

	$.getJSON("data/ClassesX.json", function(data) {
		JSONItems = data;
	});

	sel.dropdown({
		apiSettings: {
			url: "data/ClassesX.json",
		},
		filterRemoteData: true,
		onChange: function(value, text, $selectedItem) {
			$("#down")
				.removeClass("disabled")
				.addClass("positive");
			$("#down").html("Generate Calendar");
			que = value.split(",");
		},
	});
}

function class2ICS(className) {
	var classes = JSONItems.results;

	for (var i = 0; i < classes.length; i++) {
		if (classes[i].name === className) {
			parseClass(classes[i]);
			return;
		}
	}
}

function shitFuckWeHaveClassEveryDay(item) {
	if (
		item.M != null &&
		item.T != null &&
		item.W != null &&
		item.TH != null &&
		item.F != null
	) {
		checkForMWF(item);
		checkForTTH(item);
		return true;
	}
	return false;
}

function checkForMWF(item) {
	if (item.M === item.W && item.M != null) {
		rrule.byday = ["MO", "WE"];
		rrule.until = termEND;

		var parts = item.M.split("-");
		var stime = parts[0].trim();
		var etime = parts[1].trim();

		start = termSTART + " " + stime;
		end = termSTART + " " + etime;

		cal.addEvent(item.name, item.text, item.location, start, end, rrule);

		if (item.F != null) {
			rrule.byday = ["FR"];
			rrule.until = termEND;
			var parts = item.F.split("-");
			var stime = parts[0].trim();
			var etime = parts[1].trim();

			var startF = termSTART.replace("07", "11");

			start = startF + " " + stime;
			end = startF + " " + etime;

			cal.addEvent(item.name, item.text, item.location, start, end, rrule);
		}

		item.cat = "mwf";
		checkSingles(item);

		// TODO: CHECK SINGLES (ex: GEO 110.52)
		labcheck(item);

		return true;
	}

	return false;
}

function checkForTTH(item) {
	if (item.T === item.TH && item.T != null) {
		rrule.until = termEND;
		rrule.byday = ["TU", "TH"];

		var parts = item.T.split("-");
		var stime = parts[0].trim();
		var etime = parts[1].trim();

		var startT = termSTART.replace("07", "08");

		start = startT + " " + stime;
		end = startT + " " + etime;

		cal.addEvent(item.name, item.text, item.location, start, end, rrule);
		labcheck(item);

		item.cat = "tth";
		checkSingles(item);

		return true;
	}
	return false;
}

function checkSingles(item) {
	console.log("SINGLES" + item.cat);

	for (var key in item) {
		if (
			item[key] != null &&
			item[key].includes("am") | item[key].includes("pm") &&
			item[key].includes("-") &&
			item[key].includes(":") &&
			key != "text"
		) {
			//   // console.log(item.name + " " + key + " : " + item[key]);
			//   console.log(key);
			// }

			console.log(key + " : " + item[key]);
			if (item.cat === "tth" || item.cat === null) {
				console.log("mwf ran");
				if (key === "M") {
					rrule.until = termEND;
					rrule.byday = ["MO"];

					var parts = item.M.split("-");
					var stime = parts[0].trim();
					var etime = parts[1].trim();

					var startT = termSTART;

					start = startT + " " + stime;
					end = startT + " " + etime;

					cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				}

				if (key === "W") {
					rrule.until = termEND;
					rrule.byday = ["WE"];

					var parts = item.W.split("-");
					var stime = parts[0].trim();
					var etime = parts[1].trim();

					var startT = termSTART.replace("07", "09");

					start = startT + " " + stime;
					end = startT + " " + etime;

					cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				}

				if (key === "F") {
					rrule.until = termEND;
					rrule.byday = ["FR"];

					var parts = item.F.split("-");
					var stime = parts[0].trim();
					var etime = parts[1].trim();

					var startT = termSTART.replace("07", "11");

					start = startT + " " + stime;
					end = startT + " " + etime;

					cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				}
			}

			if (item.cat === "mwf" || item.cat === null) {
				console.log("tth ran");

				if (key === "T") {
					console.log("TU WORKED");
					rrule.until = termEND;
					rrule.byday = ["TU"];

					var parts = item.T.split("-");
					var stime = parts[0].trim();
					var etime = parts[1].trim();

					var startT = termSTART.replace("07", "11");

					start = startT + " " + stime;
					end = startT + " " + etime;

					cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				}
				if (key === "TH") {
					console.log("TH WORKED");
					rrule.until = termEND;
					rrule.byday = ["TH"];

					var parts = item.TH.split("-");
					var stime = parts[0].trim();
					var etime = parts[1].trim();

					var startT = termSTART.replace("07", "10");

					start = startT + " " + stime;
					end = startT + " " + etime;

					cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				}

				console.log("or nothing?");
			}

			labcheck(item);

			// TODO: Add LAB days
		}
	}
	return false;
}

function labcheck(item) {
	for (var key in item) {
		if (item[key] != null && key.includes("_")) {
			if (key === "M_Lab") {
				rrule.until = termEND;
				rrule.byday = ["MO"];

				var parts = item.M_Lab.split("-");
				var stime = parts[0].trim();
				var etime = parts[1].trim();

				var startT = termSTART;

				start = startT + " " + stime;
				end = startT + " " + etime;

				cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				return true;
			}
			console.log("Got so far");

			if (key === "T_Lab") {
				rrule.until = termEND;
				rrule.byday = ["TU"];
				console.log("Bingo");

				var parts = item.T_Lab.split("-");
				var stime = parts[0].trim();
				var etime = parts[1].trim();

				var startT = termSTART.replace("07", "08");

				start = startT + " " + stime;
				end = startT + " " + etime;

				cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				return true;
			}

			if (key === "W_Lab") {
				rrule.until = termEND;
				rrule.byday = ["WE"];

				var parts = item.W_Lab.split("-");
				var stime = parts[0].trim();
				var etime = parts[1].trim();

				var startT = termSTART.replace("07", "09");

				start = startT + " " + stime;
				end = startT + " " + etime;

				cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				return true;
			}

			if (key === "TH_Lab") {
				rrule.until = termEND;
				rrule.byday = ["TH"];

				var parts = item.TH_Lab.split("-");
				var stime = parts[0].trim();
				var etime = parts[1].trim();

				var startT = termSTART.replace("07", "10");

				start = startT + " " + stime;
				end = startT + " " + etime;

				cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				return true;
			}

			if (key === "F_Lab") {
				rrule.until = termEND;
				rrule.byday = ["FR"];

				var parts = item.F_Lab.split("-");
				var stime = parts[0].trim();
				var etime = parts[1].trim();

				var startT = termSTART.replace("07", "11");

				start = startT + " " + stime;
				end = startT + " " + etime;

				cal.addEvent(item.name, item.text, item.location, start, end, rrule);
				return true;
			}
			return false;
		}
	}
}

function parseClass(item) {
	item.cat = null;
	// TODO: MWF checks for classes the 2nd time, resulting in doubles
	if (shitFuckWeHaveClassEveryDay(item)) {
		console.log("SHIT FUCK YOU GOT CLASS EVERYDAY");
	} else if (checkForMWF(item)) {
		console.log("MWF");
	} else if (checkForTTH(item)) {
		console.log("TTH");
	} else if (checkSingles(item)) {
		console.log("Singles");
	} else {
		console.log("FIX THIS ");
		console.log(item);
	}
}

$("#down").on("click", function() {
	if (!save) {
		$("#down")
			.removeClass("positive")
			.addClass("negative");
		$("#down").html("Download Calendar");

		for (var i = 0; i < que.length; i++) {
			class2ICS(que[i]);
		}
		cal.download("CArLENDER");
		cal = ics();
		save = true;
		return;
	}

	if (save) {
		$.get("/download", data => {
			location.href = document.URL + data + id + ".ics";
		});
	}
	// window.open('/download');
});
