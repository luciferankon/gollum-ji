const Express = require("express");
const redis = require("redis");
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

const redisClient = redis.createClient({
	url: process.env.REDIS_URL,
	db: 1
});

const enqueueLintData = () => {
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
			redisClient.RPOP("lintResult", err =>
				console.log(err, "1, Jay hind dosto")
			);
			redisClient.LPUSH("lintResult", JSON.stringify(dataForReports), err =>
				console.log(err, "Jay hind dosto")
			);
		});
};

let db;

const enqueueTestData = () => {
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
			redisClient.LPUSH("testResult", JSON.stringify(dataForReports));
			redisClient.RPOP("testResult");
		});
};

MongoClient.connect(uri, { useUnifiedTopology: true }, (err, database) => {
	db = database;
	const port = process.env.PORT || 8080;
	setInterval(enqueueTestData, 5000);
	// setInterval(enqueueLintData, 1000);
	app.listen(port);
	console.log(`listening on port ${port}`);
});

const generateDataForTest = (req, res) => {
	redisClient.RPOP("testResult", (err, reply) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(JSON.parse(reply));
	});
};

const generateDataForLint = (req, res) => {
	redisClient.RPOP("lintResult", (err, reply) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(JSON.parse(reply));
	});
};

app.get("/test", generateDataForTest);
app.get("/lint", generateDataForLint);
