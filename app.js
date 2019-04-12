var express = require("express");
var app = express();
app.set("view engine", "ejs");
var querystring = require('querystring');
app.use(express.json());
var mongoose = require("mongoose");
var uuidv1 = require('uuid/v1');

mongoose.connect('mongodb+srv://db-user:tRXhnrbx1CtqMnKI@cluster0-ecqtj.gcp.mongodb.net/careach?retryWrites=true', {
	useNewUrlParser: true
});

var volunteerSchema = new mongoose.Schema({
	name: String,
	userName: String,
	password: String,
	description: String,
	eventsRegistered: Array,
	rating: Number,
	city: String
});
var Volunteer = mongoose.model("Volunteer", volunteerSchema);

var ngoSchema = new mongoose.Schema({
	name: String,
	description: String,
	eventsHosted: Array,
	rating: Number,
	userName: String,
	password: String
});
var NGO = mongoose.model("NGO", ngoSchema);

var eventSchema = new mongoose.Schema({
	name: String,
	description: String,
	volunteersRegistered: Array,
	city: String,
	eventId: String,
	ngo: String
});
var Event = mongoose.model("Event", eventSchema);

app.get("/events", function (req, res) {
	var cityParam = req.query.city; //for now, supports city as a query parameter
	var query = {};
	if (cityParam != null) {
		query = {
			city: cityParam
		};

		console.log("query: " + JSON.stringify(query));
	}
	Event.find(query, function (err, events) {
		if (err) {
			console.log("Not working");
		} else {
			res.send(events);
		}
	});
});

app.get("/volunteers", function (req, res) {
	Volunteer.find({}, function (err, volunteers) {
		if (err) {
			console.log("Not working");
		} else {
			res.send(volunteers);
		}
	});
});

//index route
app.get("/ngos", function (req, res) {
	NGO.find({}, function (err, ngos) {
		if (err) {
			console.log("Not working");
		} else {
			res.send(ngos);
		}
	});
});

//Show route, show info about one ngo
app.get("/ngos/:name", function (req, res) {
	var name = req.params.name;
	console.log(name);
	NGO.find({
		userName: name
	}, function (err, ngos) {
		if (err) {
			console.log("Not working");
		} else {
			res.send(ngos);
		}
	});
});

app.get("/volunteers/:name", function (req, res) {
	var name = req.params.name;
	console.log(name);
	Volunteer.find({
		userName: name
	}, function (err, volunteers) {
		if (err) {
			console.log("Not working");
		} else {
			res.send(volunteers);
		}
	});
});

//Show route
app.get("/events/:id", function (req, res) {
	var id = req.params.id; //for now, supports city as a query parameter
	Event.find({
		eventId: id
	}, function (err, events) {
		if (err) {
			console.log("Not working");
		} else {
			res.send(events);
		}
	});
});

function isUniqueEntryAlreadyPresent(collection, uniqueNameKey, uniqueNameValue) {
	var query = {};
	query[uniqueNameKey] = uniqueNameValue;
	console.log("Checking if there is already a record with the same user name\nKey: " + uniqueNameKey + "\nValue: " + uniqueNameValue);
	console.log("Query: " + JSON.stringify(query));
	collection.find(query, function (err, entityRecords) {
		if (err) {
			return false;
		} else {
			if (entityRecords === null || entityRecords.length === 0) {
				console.log("Didn't find any record with this user name");
				return false;
			} else {
				console.log("Found a record with this user name");
				console.log("returning " + true);
				return true;
			}
		}
	});
}


app.post("/ngos", function (req, res) {
	var name = req.body.name;
	var description = req.body.description;
	var userName = req.body.userName;
	console.log("Checking if there is already a record with the same user name\nKey: userName\nValue: " + userName);
	NGO.find({
		userName: userName
	}, function (err, entityRecords) {
		if (err) {
			console.log("Error");
		} else {
			if (entityRecords === null || entityRecords.length === 0) {
				console.log("Didn't find any record with this user name");
				var password = req.body.password;
				// var rating = req.body.rating;
				//var json=JSON.parse(req.body);
				console.log("Input: " + req.body);
				var newNGO = {
					name: name,
					description: description,
					eventsHosted: [],
					// rating: rating,
					userName: userName,
					password: password
				};
				console.log("New NGO created:" + newNGO);
				NGO.create(newNGO, function (err, ngo) {
					if (err) {
						console.log("NGO not saved");
					} else {
						console.log("NGO saved" + ngo);
						res.status(201).send(ngo);
					}
				});
			} else {
				console.log("Found a record with this user name");
				console.log("User name already present throwing a 400 error");
				res.status(400).send({
					"status": "FAILED",
					"errorMessage": userName + " is already present in db"
				});
			}
		}
	});

});

app.post("/volunteers", function (req, res) {
	var name = req.body.name;
	var description = req.body.description;
	var userName = req.body.userName;

	Volunteer.find({
		userName: userName
	}, function (err, entityRecords) {
		if (err) {
			console.log("Error");
		} else {
			if (entityRecords === null || entityRecords.length === 0) {
				console.log("Didn't find any record with this user name");
				var password = req.body.password;
				//var rating = req.body.rating;
				var city = req.body.city;

				console.log("Input: " + req.body);
				var newVolunteer = {
					name: name,
					description: description,
					eventsRegistered: [],
					//rating: rating,
					userName: userName,
					password: password,
					city: city
				};
				console.log(newVolunteer);
				Volunteer.create(newVolunteer, function (err, v) {
					if (err) {
						console.log("Volunteer not saved");
					} else {
						console.log("Volunteer saved" + v);
						res.status(201).send(v);
					}
				});
			} else {
				console.log("Found a record with this user name");
				console.log("User name already present throwing a 400 error");
				res.status(400).send({
					"status": "FAILED",
					"errorMessage": userName + " is already present in db"
				});
			}
		}
	});

});

//TODO: Also write logic to revert completely in cas of failure
//Create route
app.post("/events", function (req, res) {
	var name = req.body.name;
	var description = req.body.description;
	var ngo = req.body.ngo;
	var eventId = uuidv1();
	var city = req.body.city;

	console.log("Input: " + req.body);
	var newEvent = {
		name: name,
		description: description,
		ngo: ngo,
		eventId: eventId,
		city: city,
		volunteers: []
	};
	console.log(newEvent);
	Event.create(newEvent, function (err, event) {
		if (err) {
			console.log("Event not saved");
			res.status(500).send(event);
		} else {
			console.log("Event saved in Event table" + event);
			//Also update in NGO table events list
			NGO.find({
				userName: ngo
			}, function (err, ngo) {
				if (event != null) {
					console.log("There is an ngo with the user name: " + ngo);
				} else {
					console.log("There is no ngo with this username");
				}
				if (err) {
					console.log("Error in fetching ngo records");
				}
			});
			NGO.findOneAndUpdate({
				userName: ngo
			}, {
				$push: {
					eventsHosted: eventId
				}
			}, function (err, doc) {
				if (err) {
					console.log("Unable to update the NGO table event list with this event: " + event);
					res.status(500).send(event);
				} else {
					res.status(201).send(event);
				}
			});
		}
	});
});

app.put("/events/:eventId/register", function (req, res) {
	var volunteerUserName = req.body.userName;
	var eventId = req.params.eventId;
	console.log("Input: " + req.body);
	var noError = true;
	var errorMessage = null;
	Event.find({
		eventId: eventId
	}, function (err, event) {
		if (event != null) {
			console.log("There is an event with the eventId: " + eventId);
			Volunteer.findOneAndUpdate({
				userName: volunteerUserName
			}, {
				$push: {
					eventsRegistered: eventId
				}
			}, function (err, doc) {
				if (err) {
					errorMessage = "Unable to update the Volunteer table event list with this event: " + event;
					console.log(errorMessage);
					noError = false;
				}
			});
		} else {
			errorMessage = "There is no event with this id: " + eventId;
			console.log(errorMessage);
			noError = false;
		}
		if (err) {
			errorMessage = "Error in fetching event records: " + eventId;
			console.log(errorMessage);
			noError = false;
		}
	});

	Volunteer.find({
		userName: volunteerUserName
	}, function (err, volunteers) {
		if (volunteers != null) {
			console.log("There is a volunteer with the user name: " + volunteerUserName);
			Event.findOneAndUpdate({
				eventId: eventId
			}, {
				$push: {
					volunteersRegistered: volunteerUserName
				}
			}, function (err, doc) {
				if (err) {
					errorMessage = "Unable to update the Event table volunteers list with this volunteer: " + volunteers;
					console.log(errorMessage);
					noError = false;
				}
			});
		} else {
			errorMessage = "There is no volunteer with this user name: " + volunteerUserName;
			console.log(errorMessage);
			noError = false;
		}
		if (err) {
			errorMessage = "Error in fetching volunteer records :" + volunteerUserName;
			console.log(errorMessage);
			noError = false;
		}
	});

	if (noError) {
		res.status(200).send({
			"status": "SUCCESS"
		});
	} else {
		res.status(500).send({
			"status": "FAILED",
			"errorMessage": errorMessage
		});
	}

});

app.listen(process.env.PORT, process.env.IP, function () {
	console.log("The server has started");
});