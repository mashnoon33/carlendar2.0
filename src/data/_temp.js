// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file.

const Apify = require("apify");
Apify.main(async () => {
	// Get input of the actor. Input fields can be modified in INPUT_SCHEMA.json file.
	// For more information, see https://docs.apify.com/actor/input-schema
	const input = await Apify.getInput();
	console.log("Input:");
	console.dir(input);

	// Here you can prepare your input for actor apify/legacy-phantomjs-crawler this input is based on a actor
	// task you used as the starting point.
	const metamorphInput = {
		startUrls: [
			{
				key: "START",
				value: "http://example.com",
			},
		],
		crawlPurls: [
			{
				key: "",
				value:
					"https://apps.carleton.edu/campus/registrar/schedule/enroll/?term=20WI&subject=[\\D+]",
			},
		],

		clickableElementsSelector: null,
		pageFunction: function pageFunction(context) {
			var $ = context.jQuery;

			if (context.request.label === "START") {
				const majors = [
					"AFST",
					"AMMU",
					"AMST",
					"ARBC",
					"ARCN",
					"ARTH",
					"ASST",
					"ASTR",
					"BIOL",
					"CHEM",
					"CHIN",
					"CAMS",
					"CLAS",
					"CGSC",
					"CS",
					"CCST",
					"DANC",
					"ECON",
					"EDUC",
					"ENGL",
					"ENTS",
					"EUST",
					"FREN",
					"GEOL",
					"GERM",
					"GRK",
					"HIST",
					"IDSC",
					"JAPN",
					"LATN",
					"LTAM",
					"LING",
					"LCST",
					"MATH",
					"MARS",
					"MEST",
					"MELA",
					"MUSC",
					"NEUR",
					"PHIL",
					"PE",
					"PHYS",
					"POSC",
					"PSYC",
					"RELG",
					"RUSS",
					"SOAN",
					"SPAN",
					"ARTS",
					"THEA",
					"WGST",
				];
				const base =
					"https://apps.carleton.edu/campus/registrar/schedule/enroll/?term=";
				const term = "20WI";
				const subj = "&subject=";

				const url = base + term + subj;
				var loadData = function(id) {
					for (const item of majors) {
						context.enqueuePage(url + item);
					}
				};
				loadData(1);
				context.skipOutput();
				context.willFinishLater();
			} else {
				var results = [];
				$(".course").each(function() {
					if (
						(
							$(this)
								.find(".data")
								.find(".schedule")
								.find("tr:nth-child(1)")
								.find("td:nth-child(1)")
								.find(".start")
								.text() +
							" - " +
							$(this)
								.find(".data")
								.find(".schedule")
								.find("tr:nth-child(1)")
								.find("td:nth-child(1)")
								.find(".end")
								.text()
						).length == 3
					) {
						x_m = null;
					} else {
						x_m =
							$(this)
								.find(".data")
								.find(".schedule")
								.find("tr:nth-child(1)")
								.find("td:nth-child(1)")
								.find(".start")
								.text() +
							" - " +
							$(this)
								.find(".data")
								.find(".schedule")
								.find("tr:nth-child(1)")
								.find("td:nth-child(1)")
								.find(".end")
								.text();
					}

					results.push({
						value: results.length,
						// CourseNum: $(this).find(".coursenum").text(),
						id: $(this)
							.find(".coursenum")
							.text(),
						key: $(this)
							.find(".coursenum")
							.text(),

						// name: $(this).find(".coursenum").text(),

						text: $(this)
							.find(".title")
							.text()
							.replace(
								$(this)
									.find(".coursenum")
									.text(),
								""
							)
							.replace(
								$(this)
									.find(".credits")
									.text(),
								""
							)
							.trim(),

						credits: $(this)
							.find(".credits")
							.text(),
						// Details: $(this).find(".title").text().replace($(this).find(".coursenum").text(),"").replace($(this).find(".credits").text(),"").trim(),
						location: $(this)
							.find(".data")
							.find(".schedule")
							.find(".locations")
							.text(),
						instructor: $(this)
							.find(".faculty")
							.text()
							.trim(),
						// description: $(this).find(".description").find("p:nth-child(2)").text(),
						// Days: $(this).find(".data").find(".schedule").find(".schedule").find("thead").find(".used").text(),
						// start: $(this).find(".data").find(".schedule").find(".schedule").find("td:nth-child(1)").text(),
						// end: $(this).find(".data").find(".schedule").find(".schedule").find("tbody").find(".used").text(), "ADD END"
						m:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(1)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(1)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(1)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(1)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),

						t:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(2)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(2)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(2)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(2)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						w:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(3)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(3)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(3)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(3)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						th:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(4)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(4)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(4)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(4)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						f:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(5)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(1)")
									.find("td:nth-child(5)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(5)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(1)")
											.find("td:nth-child(5)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						m_lab:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(1)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(1)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(1)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(1)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						t_lab:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(2)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(2)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(2)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(2)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						w_lab:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(3)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(3)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(3)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(3)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						th_lab:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(4)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(4)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(4)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(4)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
						f_lab:
							(
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(5)")
									.find(".start")
									.text() +
								" - " +
								$(this)
									.find(".data")
									.find(".schedule")
									.find("tr:nth-child(2)")
									.find("td:nth-child(5)")
									.find(".end")
									.text()
							).length == 3
								? null
								: (
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(5)")
											.find(".start")
											.text() +
										" - " +
										$(this)
											.find(".data")
											.find(".schedule")
											.find("tr:nth-child(2)")
											.find("td:nth-child(5)")
											.find(".end")
											.text()
								  )
										.replace(/am/g, " am")
										.replace(/pm/g, " pm"),
					});
				});
				return results;
			}
		},
		interceptRequest: function interceptRequest(context, newRequest) {
			// called whenever the crawler finds a link to a new page,
			// use it to override default behavior
			return newRequest;
		},
		considerUrlFragment: false,
		loadImages: true,
		loadCss: true,
		injectJQuery: true,
		injectUnderscoreJs: false,
		ignoreRobotsTxt: false,
		skipLoadingFrames: false,
		verboseLog: true,
		disableWebSecurity: false,
		rotateUserAgents: false,
		maxCrawledPages: null,
		maxOutputPages: null,
		maxCrawlDepth: null,
		resourceTimeout: null,
		pageLoadTimeout: null,
		pageFunctionTimeout: null,
		maxInfiniteScrollHeight: null,
		randomWaitBetweenRequests: null,
		maxCrawledPagesPerSlave: null,
		customHttpHeaders: null,
		customData: null,
		cookies: null,
		cookiesPersistence: "PER_PROCESS",
		finishWebhookUrl: null,
		finishWebhookData: null,
		maxParallelRequests: 1,
		proxyConfiguration: {
			useApifyProxy: false,
		},
	};

	// Now let's metamorph into actor apify/legacy-phantomjs-crawler using the created input.
	await Apify.metamorph("apify/legacy-phantomjs-crawler", metamorphInput);
});
