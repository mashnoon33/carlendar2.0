// Grommet
import React, { Component } from "react";
import { Box, Grommet, Text, Stack, ResponsiveContext } from "grommet";
import { isMobile } from "react-device-detect";

// Data
import * as data from "./data/dates.json";
// {
// 	"dates": {
// 		"twentyTwenty": {
// 			"fall": {
// 				"name": "Fall",
// 				"start": "09/14/2020",
// 				"end": "11/18/2020"
// 			},
// 			...
// 		}
// 	}
// }

import * as courses from "./data/output.json";
// [
// 	{
// 		value: 0,  // Each entry has a index key for efficiency
// 		key: "AFST 112.00",
// 		id: "AFST 112.00",
// 		text: "(AFST 112.00) Black Revolution on Campus",
// 		credits: "6 credits",
// 		location: "Leighton 304",
// 		instructor: "Charisse E Burden-Stelly",
// 		mo: null,
// 		tu: "3:10 pm - 4:55 pm",
// 		we: null,
// 		th: "3:10 pm - 4:55 pm",
// 		fr: null,
// 		mo_lab: null,
// 		tu_lab: null,
// 		we_lab: null,
// 		th_lab: null,
// 		fr_lab: null,
// 		url:"https://apps.carleton.edu/campus/registrar/schedule/enroll/?term=20WI&subject=AFST",
// 	},
// 	...
// ]
// Time + Ics
import moment from "moment";
import { createEvents } from "ics";
import { saveAs } from "file-saver";
// Semantic
import { Dropdown, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
//Toast
import TuiCalendar from "tui-calendar";
import "tui-calendar/dist/tui-calendar.css";

const theme = {
	global: {
		colors: {
			brand: "#228BE6",
		},
		font: {
			family: "Roboto",
			size: "14px",
			height: "20px",
		},
	},
};

const optionProps = [
	"disableDblClick",
	"isReadOnly",
	"month",
	"scheduleView",
	"taskView",
	"theme",
	"timezones",
	"week",
];

function exists(array, key, val) {
	return array.some(function(item) {
		return item[key] === val;
	});
}

function get(array, key, val) {
	var result = array.filter(function(item) {
		return item[key] === val;
	});

	return result ? result[0] : null; // or undefined
}
class App extends Component {
	state = {
		showSidebar: false,
		selected: [],
	};

	term = {};

	events = [];
	toastEvents = [];

	schedule = [];

	colors = [
		"#e6194B",
		" #3cb44b",
		" #4363d8",
		" #f58231",
		" #911eb4",
		" #42d4f4",
		" #fabebe",
		" #469990",
		" #9A6324",
		" #800000",
		" #808000",
		" #000075",
	];

	usedColor = [];

	findTerm() {
		// Finds the current Carleton term or if on break, next term
		var now = moment();
		var nextTerm = null;
		for (const prop in data.dates.twentyTwenty) {
			if (
				now.isBetween(
					data.dates.twentyTwenty[prop].start,
					data.dates.twentyTwenty[prop].end
				)
			) {
				return data.dates.twentyTwenty[prop];
			} else {
				var _start = moment(data.dates.twentyTwenty[prop].start);
				if (now.isBefore(_start)) {
					if (nextTerm == null) {
						nextTerm = data.dates.twentyTwenty[prop];
					} else if (_start.isBefore(nextTerm.start)) {
						nextTerm = data.dates.twentyTwenty[prop];
					}
				}
			}
		}
		return nextTerm;
	}
	// Testing code
	test(list) {
		var ed, mwf, mwf_lab, tth, tth_lab, some, none, err; //25 162 3 112 2 88 304 0

		ed = mwf = mwf_lab = tth = tth_lab = some = none = err = 0;

		for (const course of list) {
			if (this.everyDay(course)) {
				ed++;
			} else if (this.mwf(course)) {
				mwf++;
				if (this.anyLab(course)) {
					mwf_lab++;
				}
			} else if (this.tth(course)) {
				tth++;

				if (this.anyLab(course)) {
					tth_lab++;
				}
			} else if (!this.allNull(course)) {
				some++;
			} else if (this.allNull(course)) {
				none++;
			} else {
				err++;
				console.log("ERROR");
				console.log(course);
			}
		}
		console.log(ed, mwf, mwf_lab, tth, tth_lab, some, none, err);
	}
	// Takes in a list of array indexes, and processes those courses
	parse(list) {
		// Reset arrays everytime parse is called
		this.schedule = [];
		this.events = [];
		this.toastEvents = [];

		for (const item of list) {
			const course = courses.default[item];

			// First three cases check for the most common type of recurrance to leverage RRULES intead of creating seperate entries
			if (this.everyDay(course)) {
				this.events.push(this.evalMonday(course));
				this.events.push(this.evalTuesday(course));
				this.events.push(this.evalFriday(course));
				if (this.anyLab(course)) {
					var labs = this.iterateThrough(course, true);
					for (const lab of labs) {
						this.events.push(lab);
					}
				}
			} else if (this.mwf(course)) {
				this.events.push(this.evalMonday(course));
				this.events.push(this.evalFriday(course));
				if (this.anyLab(course)) {
					var labs = this.iterateThrough(course, true);
					for (const lab of labs) {
						this.events.push(lab);
					}
				}
			} else if (this.tth(course)) {
				this.events.push(this.evalTuesday(course));
				if (this.anyLab(course)) {
					var labs = this.iterateThrough(course, true);
					for (const lab of labs) {
						this.events.push(lab);
					}
				}
			} else if (!this.allNull(course)) {
				var singles = this.iterateThrough(course, false);
				for (const single of singles) {
					this.events.push(single);
				}
			} else if (this.allNull(course)) {
			} else {
				console.log("ERROR");
				console.log(course);
			}

			// For toast, we seperately parse events since it doesn't display rrules
			var singles = this.iterateThrough(course, false);
			for (const single of singles) {
				this.toastEvents.push(single);
			}
		}

		var index = 0; // Toast event index

		for (const item of this.toastEvents) {
			var event = {
				// Toast event
				calendarId: "1",
				category: "time",
				dueDateClass: "",
				isReadOnly: true,
				title: item.title,
				color: "#FFFFFF",
				location: item.location,
			};

			//["2020", "1", "6", "13", "50"] // ICS date array
			//2013-02-08 09:30 // Moment target
			event.id = index.toString();
			var is = item.start.map(String); // convery int arrays to str arrays
			var ie = item.end.map(String);
			event.start = moment(is.slice(0, 3).join("-") + " " + is[3] + ":" + is[4])
				.toDate()
				.toISOString();
			event.end = moment(ie.slice(0, 3).join("-") + " " + ie[3] + ":" + ie[4])
				.toDate()
				.toISOString();

			// Makes sure that each course has a consistend hex color (since a course might have multiple even't entries)
			var bgColor = get(this.usedColor, "title", item.title);
			if (bgColor == null) {
				bgColor = this.colors.pop();
				this.usedColor.push({
					title: item.title,
					color: bgColor,
				});
			} else {
				bgColor = bgColor.color;
			}
			event.bgColor = bgColor;
			this.schedule.push(event);
			index++;
		}
		// for (const i of [0, 1, 2, 3, 4, 5, 6]) { // Reset calendar everytime parse is run? Unecesarry?
		// 	this.calendarInst.deleteSchedule(i.toString(), "1", false);
		// }
		this.setSchedules(this.schedule); // Updates toast schedule
	}
	evalTuesday(course) {
		var event = {
			start: null,
			end: null,
			title: null,
			description: null,
			location: null,
		};

		event.location = course.location;
		event.description = "Intstructor : " + course.instructor;
		event.title = course.text;
		var end = moment(this.term.end);
		event.recurrenceRule =
			"FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=1;UNTIL=" +
			end.year().toString() +
			(end.month() < 9
				? "0" + (end.month() + 1).toString()
				: (end.month() + 1).toString()) +
			(end.date() < 10 ? "0" + end.date().toString() : end.date().toString()) +
			"T050000Z";

		var time_string = course.tu.split("-");
		var start_time = moment(time_string[0].trim(), ["h:mm A"]).format("HH:mm");
		var end_time = moment(time_string[1].trim(), ["h:mm A"]).format("HH:mm");
		const termStart = moment(this.term.start).isoWeekday();
		var start;
		var dayInNeed = 2; // Tuesday
		// if we haven't yet passed the day of the week that I need:
		if (termStart <= dayInNeed) {
			// then just give me this week's instance of that day
			start = moment(this.term.start).isoWeekday(dayInNeed);
		} else {
			// otherwise, give me *next week's* instance of that same day
			start = moment(this.term.start)
				.add(1, "weeks")
				.isoWeekday(dayInNeed);
		}
		event.start = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(start_time.split(":")[0]),
			parseInt(start_time.split(":")[1]),
		];
		event.end = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(end_time.split(":")[0]),
			parseInt(end_time.split(":")[1]),
		];
		console.log(event);
		return event;
	}

	evalMonday(course) {
		var event = {
			start: null,
			end: null,
			title: null,
			description: null,
			location: null,
		};

		event.location = course.location;
		event.description = "Intstructor : " + course.instructor;
		event.title = course.text;
		var end = moment(this.term.end);
		event.recurrenceRule =
			"FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=1;UNTIL=" +
			end.year().toString() +
			(end.month() < 9
				? "0" + (end.month() + 1).toString()
				: (end.month() + 1).toString()) +
			(end.date() < 10 ? "0" + end.date().toString() : end.date().toString()) +
			"T050000Z";

		var time_string = course.mo.split("-");
		var start_time = moment(time_string[0].trim(), ["h:mm A"]).format("HH:mm");
		var end_time = moment(time_string[1].trim(), ["h:mm A"]).format("HH:mm");
		const termStart = moment(this.term.start).isoWeekday();

		var start;
		var dayInNeed = 1;
		// if we haven't yet passed the day of the week that I need:
		if (termStart <= dayInNeed) {
			// then just give me this week's instance of that day
			start = moment(this.term.start).isoWeekday(dayInNeed);
		} else {
			// otherwise, give me *next week's* instance of that same day
			start = moment(this.term.start)
				.add(1, "weeks")
				.isoWeekday(dayInNeed);
		}
		event.start = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(start_time.split(":")[0]),
			parseInt(start_time.split(":")[1]),
		];
		event.end = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(end_time.split(":")[0]),
			parseInt(end_time.split(":")[1]),
		];
		console.log(event);

		return event;
	}

	evalFriday(course) {
		var event = {
			start: null,
			end: null,
			title: null,
			description: null,
			location: null,
		};

		event.location = course.location;
		event.description = "Intstructor : " + course.instructor;
		event.title = course.text;
		var end = moment(this.term.end);

		event.recurrenceRule =
			"FREQ=WEEKLY;BYDAY=FR;INTERVAL=1;UNTIL=" +
			end.year().toString() +
			(end.month() < 9
				? "0" + (end.month() + 1).toString()
				: (end.month() + 1).toString()) +
			(end.date() < 10 ? "0" + end.date().toString() : end.date().toString()) +
			"T050000Z";

		var time_string = course.fr.split("-");
		var start_time = moment(time_string[0].trim(), ["h:mm A"]).format("HH:mm");
		var end_time = moment(time_string[1].trim(), ["h:mm A"]).format("HH:mm");
		const termStart = moment(this.term.start).isoWeekday();

		var start;
		var dayInNeed = 5; //Friday
		// if we haven't yet passed the day of the week that I need:
		if (termStart <= dayInNeed) {
			// then just give me this week's instance of that day
			start = moment(this.term.start).isoWeekday(dayInNeed);
		} else {
			// otherwise, give me *next week's* instance of that same day
			start = moment(this.term.start)
				.add(1, "weeks")
				.isoWeekday(dayInNeed);
		}
		event.start = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(start_time.split(":")[0]),
			parseInt(start_time.split(":")[1]),
		];
		event.end = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(end_time.split(":")[0]),
			parseInt(end_time.split(":")[1]),
		];
		console.log(event);

		return event;
	}

	iterateThrough(course, labOnly) {
		var days = [
			"mo",
			"tu",
			"we",
			"th",
			"fr",
			"mo_lab",
			"tu_lab",
			"we_lab",
			"th_lab",
			"fr_lab",
		];
		if (labOnly) {
			days = ["mo_lab", "tu_lab", "we_lab", "th_lab", "fr_lab"];
		}

		var evaled = [];

		for (const day of days) {
			if (course[day] != null) {
				evaled.push(this.evalSingle(course, day, labOnly));
			}
		}
		return evaled;
	}

	evalSingle(course, day, labOnly) {
		var days = ["su", "mo", "tu", "we", "th", "fr"];
		const lab_days = [
			"su_lab",
			"mo_lab",
			"tu_lab",
			"we_lab",
			"th_lab",
			"fr_lab",
		];

		var event = {
			start: null,
			end: null,
			title: null,
			description: null,
			location: null,
		};

		event.location = course.location;
		event.description = "Intstructor : " + course.instructor;
		event.title = course.text;
		var end = moment(this.term.end);

		event.recurrenceRule =
			"FREQ=WEEKLY;BYDAY=" +
			(day.includes("lab")
				? day.split("_")[0].toUpperCase()
				: day.toUpperCase()) +
			";INTERVAL=1;UNTIL=" +
			end.year().toString() +
			(end.month() < 9
				? "0" + (end.month() + 1).toString()
				: (end.month() + 1).toString()) +
			(end.date() < 10 ? "0" + end.date().toString() : end.date().toString()) +
			"T050000Z";

		var time_string = course[day].split("-");
		var start_time = moment(time_string[0].trim(), ["h:mm A"]).format("HH:mm");
		var end_time = moment(time_string[1].trim(), ["h:mm A"]).format("HH:mm");
		const termStart = moment(this.term.start).isoWeekday();

		var start;

		var dayInNeed = day.includes("lab")
			? lab_days.indexOf(day)
			: days.indexOf(day); //Finds dayIndex
		// if we haven't yet passed the day of the week that I need:
		if (termStart <= dayInNeed) {
			// then just give me this week's instance of that day
			start = moment(this.term.start).isoWeekday(dayInNeed);
		} else {
			// otherwise, give me *next week's* instance of that same day
			start = moment(this.term.start)
				.add(1, "weeks")
				.isoWeekday(dayInNeed);
		}
		event.start = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(start_time.split(":")[0]),
			parseInt(start_time.split(":")[1]),
		];
		event.end = [
			start.year(),
			start.month() + 1,
			start.date(),
			parseInt(end_time.split(":")[0]),
			parseInt(end_time.split(":")[1]),
		];
		console.log(event);

		return event;
	}

	allNull(course) {
		const keys = ["mo", "tu", "we", "th", "fr"];

		for (const key of keys) {
			if (course[key] != null) {
				return false;
			}
		}
		return true;
	}

	anyLab(course) {
		const keys = ["mo_lab", "tu_lab", "we_lab", "th_lab", "fr_lab"];

		for (const key of keys) {
			if (course[key] != null) {
				return true;
			}
		}
		return false;
	}

	atleastOneDay(course) {
		const keys = ["mo", "tu", "we", "th", "fr"];

		for (const key of keys) {
			if (course[key] != null) {
				return true;
			}
		}
		return false;
	}

	everyDay(course) {
		const keys = ["mo", "tu", "we", "th", "fr"];

		for (const key of keys) {
			if (course[key] == null) {
				return false;
			}
		}
		return true;
	}

	mwf(course) {
		const keys = ["mo", "we", "fr"];

		for (const key of keys) {
			if (course[key] == null) {
				return false;
			}
		}
		return true;
	}
	tth(course) {
		const keys = ["tu", "th"];

		for (const key of keys) {
			if (course[key] == null) {
				return false;
			}
		}
		return true;
	}

	//TOAST
	rootEl = React.createRef();

	static defaultProps = {
		height: "800px",
		view: "week",
	};

	calendarInst = null;

	componentDidMount() {
		const { schedules = [], view } = this.props;

		this.calendarInst = new TuiCalendar(this.rootEl.current, {
			...this.props,
			defaultView: view,
			disableClick: true,
			disableDblClick: true,
			isReadOnly: true,
		});
		// config
		this.setSchedules(schedules);
		this.bindEventHandlers(this.props);
		this.calendarInst.setDate(moment(this.term.start).toDate());
		this.calendarInst.toggleScheduleView(["time"]);
		this.calendarInst.toggleTaskView(["task"]);
	}

	shouldComponentUpdate(nextProps) {
		const { calendars, height, schedules, theme, view } = this.props;

		if (height !== nextProps.height) {
			this.getRootElement().style.height = height;
		}

		if (calendars !== nextProps.calendars) {
			this.setCalendars(nextProps.calendars);
		}

		if (schedules !== nextProps.schedules) {
			this.calendarInst.clear();
			this.setSchedules(nextProps.schedules);
		}

		if (theme !== nextProps.theme) {
			this.calendarInst.setTheme(this.cloneData(nextProps.theme));
		}

		if (view !== nextProps.view) {
			this.calendarInst.changeView(nextProps.view);
		}

		optionProps.forEach(key => {
			if (this.props[key] !== nextProps[key]) {
				this.setOptions(key, nextProps[key]);
			}
		});

		this.bindEventHandlers(nextProps, this.props);

		return false;
	}

	componentWillUnmount() {
		this.calendarInst.destroy();
	}

	cloneData(data) {
		return JSON.parse(JSON.stringify(data));
	}

	setCalendars(calendars) {
		if (calendars && calendars.length) {
			this.calendarInst.setCalendars(calendars);
		}
	}

	setSchedules(schedules) {
		if (schedules && schedules.length) {
			this.calendarInst.createSchedules(schedules);
		}
	}

	setOptions(propKey, prop) {
		this.calendarInst.setOptions({ [propKey]: prop });
	}

	getInstance() {
		return this.calendarInst;
	}

	getRootElement() {
		return this.rootEl.current;
	}

	bindEventHandlers = (props, prevProps) => {
		const eventHandlerNames = Object.keys(props).filter(key =>
			/on[A-Z][a-zA-Z]+/.test(key)
		);

		eventHandlerNames.forEach(key => {
			const eventName = key[2].toLowerCase() + key.slice(3);
			// For <Calendar onFocus={condition ? onFocus1 : onFocus2} />
			if (prevProps && prevProps[key] !== props[key]) {
				this.calendarInst.off(eventName);
			}
			this.calendarInst.on(eventName, this.props[key]);
		});
	};

	//Grommet

	render() {
		// console.log(options);
		// console.log(courses);
		this.term = this.findTerm();
		// this.test(courses.default);
		// this.parse([281]);
		// console.log(this.parse([courses[23]]));
		// const { showSidebar } = this.state;
		return (
			<Grommet theme={theme} full>
				<ResponsiveContext.Consumer>
					{size => (
						<Box fill>
							<Box
								tag='header'
								direction='row'
								align='center'
								justify='between'
								background='#f2f2f2'
								pad={{
									left: "medium",
									right: "small",
									vertical: size === "small" ? "medium" : "small",
								}}
								elevation='medium'
								style={{ zIndex: "1" }}
							>
								<Text size='medium' weight='bold' color='#636363'>
									{" "}
									🥨 CARLENDAR
								</Text>
								<Text size='medium' weight='300' color='#9c9c9c'>
									{" "}
									{this.term.name + " " + 2020}{" "}
								</Text>
							</Box>
							<Stack anchor='bottom' fill>
								<Box fill color='red'>
									{!isMobile ? (
										<div ref={this.rootEl} style={{ height: "100%" }} />
									) : (
										<Box />
									)}
								</Box>

								<Box
									background='#f2f2f2'
									elevation='medium'
									round='small'
									margin={{
										left: size === "small" ? "large" : "small",
										right: size === "small" ? "large" : "small",
										top: "xlarge",
										bottom: "xlarge",
									}}
									pad={{
										left: size === "small" ? "large" : "small",
										right: size === "small" ? "large" : "small",
										top: "small",
										bottom: "small",
									}}
									width={size === "small" ? "medium" : "large"}
									// margin='xlarge'
									// pad='large'
									align='center'
									justify='center'
									gap='small'
									// fill='horizontal'
								>
									<Box
										direction='column'
										flex={false}
										fill='horizontal'
										// width='large'
										align='start'
										gap='msall'
									>
										<Box
											// flex={false}
											pad={{
												bottom: "small",
											}}
										>
											<Text size='20px'> </Text>
										</Box>
										<Dropdown
											fluid
											floating
											labeled
											icon='search'
											className='icon'
											text='Select Courses'
											multiple
											openOnFocus
											selection
											search
											lazyLoad={true}
											options={courses.default}
											onChange={(e, { value }) => {
												this.setState({
													selected: value,
												});
												this.parse(value);
												// console.log(data);
											}}
											renderLabel={label => ({
												color: "blue",
												content: `${label.text}`,
												icon: "bookmark",
											})}
										/>
									</Box>

									<Button
										positive
										// disabled={this.events.length === 0}
										onClick={() => {
											if (this.events.length !== 0) {
												createEvents(this.events, (error, value) => {
													if (error) {
														console.log(error);
														return;
													}
													var blob = new Blob([value], {
														type: "text/calendar",
													});
													saveAs(blob, "ical.ics");
												});
											}
										}}
									>
										Download
									</Button>
								</Box>
							</Stack>
						</Box>
					)}
				</ResponsiveContext.Consumer>
			</Grommet>
		);
	}
}

export default App;
