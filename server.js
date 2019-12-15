const Express = require("express");
const app = Express();
const MongoClient = require("mongodb").MongoClient;
const uri =
	"mongodb+srv://mongo-power:B6ou0ITjLB6aYgKK@cluster0-nvzs5.mongodb.net/test?retryWrites=true&w=majority";

const githubUserNames = [
	"bugdriver",
	"trinangkur",
	"sukhiboi",
	"angrybirdno1",
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

const generateDataForReports = (req, res) => {
	MongoClient.connect(uri, { useUnifiedTopology: true }, (err, db) => {
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
								sha: "sha1234",
								total: result["result"]["total"],
								passed: result["result"]["passed"].length,
								failed: result["result"]["failed"].length,
								failedSuites: result["result"]["failed"].map(
									testCase => testCase.title
								),
								time: result["time"]
							};
						});
        });
        res.setHeader("Access-Control-Allow-Origin", "*");
				res.send(dataForReports);
			});
	});
};

app.get("/", generateDataForReports);
app.listen(process.env.PORT || 8080);
