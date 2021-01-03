const logger = require('../config/winston');

const http = require('http'),
      path = require('path'),
      express = require('express'),
      newrelic = require('newrelic'),
      router = express.Router();
/* Create a transaction on app startup. Serves no actual use. 🤷‍♂️ */
function nothingUseful(){
  newrelic.startWebTransaction('aTest', () => {
      newrelic.setTransactionName("yes a test");
      console.log("not sure");
      newrelic.addCustomAttribute("any","thing");
      newrelic.endTransaction();
  });
}

/* Generate a greeting based on the time of day . */         
function getGreeting(){
  const hours = new Date().getHours()

  const timeOfDay = hours < 12 && 'morning' || hours < 18 && 'afternoon' || 'evening'

  return timeOfDay
};

/* GET home page. */
router.get('/', function(req, res, next) {
  
  res.render(
    'index', { 
      title: 'New Relic Node Workshop',
      greeting: getGreeting()
      }
    );
});

/* GET 10
  Generate random numbers until we get the number 10
                                                      . */
router.get('/badmaths', function (req, res) {
  let x = '';
  do {
    x = Math.floor(Math.random() * 111000); 
  } while (x != 10);
  res.send('{"x": "'+ x + '"}\n');
});

/* GET 10
  Run a for loop until the counter is 1 less than 11
                                                      . */
router.get('/maths', function (req, res) {
  let x = '';
  let i = 0;
  for (i=0; i>-11;i--){
    x = -i;
    console.log(x);
  }
  console.log(x);
  res.send('{"x": "'+ x + '"}\n');
});

/* GET 10
  Define one as 1, add one to an array (x) 10 times, fetch length of x
                                                      . */
router.get('/weirdmaths', function (req, res) {
  one = 1;
  let x = [one, one, one, one, one, one, one, one, one, one ];
  res.send('{"x": "'+ x.length + '"}\n');
});

class NameError extends Error {
  constructor(message, property) {
    super(message, property);
    this.name = "ValidationError";
    this.property = "You got the wrong name !!!!!!";
  }
}

router.get('/grayspencer', function (req, res) {
  newrelic.setTransactionName(req.query.username);
  newrelic.addCustomAttribute("ok","no");
  newrelic.addCustomAttribute("parameterAddress", req.query.address);
  newrelic.addCustomAttribute("parameterUsername", req.query.username);
  throw new NameError('WrongName'); 
});

router.get('/external', function (req, res) {
  const options = {
      "method": "GET",
      "hostname": "go-gary.eu-west-2.elasticbeanstalk.com",
      "port": "80",
      "path": "/gary",
      "headers": {
        "user-agent": "vscode-restclient",
        "authorization": "token abc123",
        "content-type": "application/json"
      }
    };
    const rq = http.request(options, function (rs) {
      const chunks = [];
    
      rs.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      rs.on("end", function () {
        const body = Buffer.concat(chunks);
        res.send(body.toString());
      });
    });
    
    rq.end();
    
});

router.get('/external/:custom', function (req, res) {
  const options = {
      "method": "GET",
      "hostname": "go-gary.eu-west-2.elasticbeanstalk.com",
      "port": "80",
      "path": "/" + req.params.custom,
      "headers": {
        "user-agent": "vscode-restclient",
        "authorization": "token abc123",
        "content-type": "application/json"
      }
    };
    const rq = http.request(options, function (rs) {
      const chunks = [];
    
      rs.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      rs.on("end", function () {
        const body = Buffer.concat(chunks);
        res.send(body.toString());
      });
    });
    newrelic.addCustomAttribute('error', req.params.custom);
    rq.end();
    
});

router.get('/gary/:id', function (req, res) {
  newrelic.addCustomAttribute('error', req.params.id);
  const attributes = {
      newrelic: 'implies existance of old relic',
      hello: 'world',
      favouriteNumber: 4
    }
  try {
      newrelic.recordCustomEvent("MyFirstEvent", attributes);
      console.log("custom event sent!");
    } catch (e) {
      console.log("failed to reach new relic. Status code:", e.statusCode);
    }
  res.send('{"yourNumber": "'+ req.params.id + '"}\n');
  newrelic.noticeError("PROBLEM", req);
});

module.exports = router;
setTimeout(nothingUseful, 5000);