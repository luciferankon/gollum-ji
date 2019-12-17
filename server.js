const Express = require("express");
const app = Express();
const MongoClient = require("mongodb").MongoClient;
const { USER, PASSWORD } = process.env;
const uri = `mongodb+srv://${USER}:${PASSWORD}@cluster0-nvzs5.mongodb.net/test?retryWrites=true&w=majority`;

const githubUserNames = [
	"bugdriver",
	"trinangkur",
	"sukhiboi",
	"satheesh-chandran",
	"shankarbyageli",
	"shiviraj",
	"symbiote-ux",
	"unphydra",
	"armanaaquib",
	"imvaishu",
	"mildshower",
	"rey-vthi",
	"bsanthoshkumar",
	"nooranasrin",
	"palpriyanshu",
	"sravani-labala",
	"dad-ka-raneesa",
	"cricket-lover",
	"anil-muraleedharan",
	"abhilashkasula",
	"naveen-kumar-vadla",
	"anujachaitanya",
	"pssruthy",
	"bernie-walker",
	"Neha-sanserwal",
	"gulsane",
	"myultimatevision",
	"rahitkar",
	"venkybavisetti",
	"desibabua",
	"melodyni",
	"lazyhackerthani",
	"apurvagurme",
	"drishya-dobriyal",
	"photongupta",
	"bcalm"
];

let db;
MongoClient.connect(uri, { useUnifiedTopology: true }, (err, database) => {
	db = database;
	const port = process.env.PORT || 8080
	app.listen(port);
	console.log(`listening on port ${port}`);
});

const generateDataForTest = (req, res) => {
	const dbo = db.db("sauron_reporters");
	dbo
		.collection("events")
		.find({ job: "test" })
		.toArray((err, results) => {
			let dataForReports = {};
			githubUserNames.map(username => {
				dataForReports[username] = results
					.filter(result => result["pusher"] == username)
					.map(result => {
						return {
							sha: result["sha"],
							total: result["result"]["total"],
							passed: result["result"]["passed"].length,
							failed: result["result"]["failed"].length,
							failedSuites: result["result"]["failed"].map(
								testCase => testCase.title
							),
							time: result["time"],
							project: result["project"]
						};
					})
					.reverse();
			});
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.send(dataForReports);
		});
};

const generateDataForLint = (req, res) => {
	const dbo = db.db("sauron_reporters");
	dbo
		.collection("events")
		.find({ job: "lint" })
		.toArray((err, results) => {
			let dataForReports = {};
			githubUserNames.forEach(username => {
				dataForReports[username] = results
					.filter(result => result["pusher"] == username)
					.map(result => {
						return {
							sha: result["sha"],
							result: result["result"],
							time: result["time"],
							project: result["project"]
						};
					})
					.reverse();
			});
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.send(dataForReports);
		});
};

app.get("/test", generateDataForTest);
app.get("/lint", generateDataForLint);
