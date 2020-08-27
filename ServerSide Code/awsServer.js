//jshint esversion:8

/////////////////////// AWS LAB LOADER (SERVER SIDE) //////////////////////////
var x = 0;
var labMsg = "";

gatekeeper.route("/runLab")

  .post(function(req, res) {

    var ObjectId = require('mongodb').ObjectId;
    var index;
    var code = req.body.code;
    var id = ObjectId(req.body.id);
    var instance = req.body.instance;
    var Commission = server.getCollection("Commission");

    //Check the Commissions database and the search from the array of commissions to find the corresponding commission code.
    Commission.findOne({
      _id: id,
      user: req.user.username
    }, function(err, found) {
      for (var x = 0; x < found.commissions.length; x++) {
        if(err){ res.json(400); break;
        } else {
          if (found.commissions[x].code === code) {
            //Identified the correct commission module by index
            //set array index for AWS Lambda
            index = x;
            // TODO: SET COMISSION ACTIVE  TO TRUE
            // Grab the remaining time on the commission and send back to
            // the client so a Timer popup can be created.
            var client = found.client;

            var postData = JSON.stringify({
              courseID: code,
              obID: id,
              chunkArray: index,
              instance: 'start',
              companyName: client
            });

            //
            var options = {
              hostname: 'REMOVED FOR CODE EXAMPLE UPLOAD',
              port: 443,
              path: '/test/compcheckstart',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'x-api-key': 'REMOVED FOR CODE EXAMPLE UPLOAD' // SHOULD HAVE BEEN AN ENVAR ANYWAY
              }
            };

            var postReq = https.request(options, function(postRes) {
              postRes.on('data', function(d){
                // var data = JSON.parse(d);
                // console.log("AWS STARTED");

                var resData = { comMod: found.commissions[index].name,
                                timeMin: found.commissions[index].timeLeft.minutes,
                                timeSec: found.commissions[index].timeLeft.seconds};

                res.json(resData);
              });

              req.on('error', function(postError) {
                console.error(postError);
              });
            });
            postReq.write(postData);
            postReq.end();
          }
        }
      }
    });
  });

gatekeeper.route("/stopLab")

.post(function(req, res) {

  var ObjectId = require('mongodb').ObjectId;
  var index;
  var code = req.body.code;
  var id = ObjectId(req.body.id);
  var instance = req.body.instance;
  var Commission = server.getCollection("Commission");

  Commission.findOne({
    _id: id,
    user: req.user.username
  }, function(err, found) {
    for (var x = 0; x < found.commissions.length; x++) {
      if(err){
        res.json(400); break;
      } else {
        if (found.commissions[x].code === code) {
          index = x;
          // console.log(id);
          // console.log(index);

          var postData = JSON.stringify({
            taskArnNumber: found.commissions[index].taskArnNumber,
            obID: id,
            chunkArray: index
          });

          var options = {
            hostname: 'ohhmnvp66i.execute-api.eu-west-2.amazonaws.com',
            port: 443,
            path: '/prod/compcheckstop',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': postData.length,
              'x-api-key': 'REMOVED FOR CODE EXAMPLE UPLOAD' // SHOULD HAVE BEEN AN ENVAR ANYWAY
            }
          };

          var postReq = https.request(options, function(postRes) {
            postRes.on('data', function(d){
              var data = JSON.parse(d);
              // console.log("AWS STOPPED");
              var resData = "stop";
              res.json(resData);
            });
            req.on('error', function(postError) {
              console.error(postError);
            });
          });

          postReq.write(postData);
          postReq.end();
        }
      }
    }
  });
});

gatekeeper.route("/pollLab")

.post(function(req, res) {

  var ObjectId = require('mongodb').ObjectId;
  var index;
  var code = req.body.code;
  var id = ObjectId(req.body.id);
  var instance = req.body.instance;
  var Commission = server.getCollection("Commission");

  Commission.findOne({
    _id: id,
    user: req.user.username
  }, function(err, found) {
    for (var x = 0; x < found.commissions.length; x++) {
      if(err){ res.json(400); break;
      } else {
        if (found.commissions[x].code === code) {
          index = x;

          var postData = JSON.stringify({
            taskArnNumber: found.commissions[index].taskArnNumber
          });

          var options = {
            hostname: 'REMOVED FOR CODE EXAMPLE UPLOAD',
            port: 443,
            path: '/prod/compcheckpolling',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': postData.length,
              'x-api-key': 'REMOVED FOR CODE EXAMPLE UPLOAD' // SHOULD HAVE BEEN AN ENVAR ANYWAY
            }
          };

          var postReq = https.request(options, function(postRes) {

            postRes.on('data', function(d){
              var data = JSON.parse(d);
              // console.log("AWS POLLED");
              var resData = data;
              res.json(resData);
            });

            req.on('error', function(postError) {
              console.error(postError);
            });
        });
          postReq.write(postData);
          postReq.end();
        }
      }
    }
  });
});
