
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , WatsonClient = require('watson-js')
  , fs = require('fs')
  , twilio = require('twilio')
  , request = require('request')
  , credentials = require('./credentials')
  , path = require('path');

var app = express();

//setup api options for watson-js
var ATT_API_CLIENT_ID = credentials.ATT_API_CLIENT_ID
  ,	ATT_API_CLIENT_SECRET = credentials.ATT_API_CLIENT_SECRET;

//make twilio connection
var TWILIO_ACCOUNT_SID = credentials.TWILIO_ACCOUNT_SID;
var TWILIO_AUTH_TOKEN = credentials.TWILIO_AUTH_TOKEN;

var client = new twilio.RestClient('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');


var options = {
        client_id: ATT_API_CLIENT_ID,
        client_secret: ATT_API_CLIENT_SECRET,
        //    --data "client_id={{YOUR_APP_KEY}}&client_secret={{YOUR_APP_SECRET}}&grant_type=client_credentials&scope=SPEECH" \ 
        grant_type: "client_credentials",
        scope: "SPEECH",
        access_token_url: "https://api.att.com/oauth/token"
     //   api_domain: "api.att.com"
};

var Watson = new WatsonClient.Watson(options);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


//twililo
app.get('/twilio',function(req,res){
  var resp = new twilio.TwimlResponse();
   
    // The <Gather> verb requires nested TwiML, so we pass in a function
    // to generate the child nodes of the XML document
  resp.record({ timeout:30, finishOnKey:"#", action:"/process_record", method:"GET" }, function() {
 
        // In the context of the callback, "this" refers to the parent TwiML
        // node.  The parent node has functions on it for all allowed child
        // nodes. For <Gather>, these are <Say> and <Play>.
        this.say('transcribe command');
 
    });
 
  
   // The TwiML response object will have functions on it that correspond
    // to TwiML "verbs" and "nouns".  This example uses the "Say" verb.
    // Passing in a string argument sets the content of the XML tag.
    // Passing in an object literal sets attributes on the XML tag.
   // resp.say({voice:'woman'}, 'Enter Phone Num');
 
    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type':'text/xml'
    });
    res.end(resp.toString());
 
});

var recordedurl;
app.get('/process_record',function(req,res){
	//console.log(req.RecordingUrl);
	//console.log(req.content);
	recordedurl=req.query.RecordingUrl;
	console.log(req.query.RecordingUrl);

//var file = fs.createWriteStream("music.wav");
  //request(recordedurl, function(){console.log('process done');}).pipe(fs.createWriteStream('music.wav'));
  
//var request = http.get(recordedurl, function(response) {
  //response.pipe(file);
//  file.end(response.read(), function(){
//    console.log('writing done');
//  });
//  response.on('end',function(){
//    console.log('reading piping done');
//    file.end();
//  });
//  file.on('finish', function(){console.log('writing done');});
//});
	
  var resp = new twilio.TwimlResponse();
    resp.say({voice:'woman'}, 'processing is done');
    res.writeHead(200, {
        'Content-Type':'text/xml'
    });
    res.end(resp.toString());



});
app.get('/getrecord',function(req,res){

  request(recordedurl, function(){res.end('process done');}).pipe(fs.createWriteStream('music.wav'));

	
});




// Receive an AJAX POST from client-side JavaScript
app.get('/speechToText', function(req, res) {
request(recordedurl, function(){
	Watson.getAccessToken(function(err,accessToken){


    // Pass the audio file and access token to AT&T Speech API
    Watson.speechToText(__dirname + '/music.wav',
    accessToken,function(err, reply) {
      // Pass any errors associated with API call to client-side JS
      if(err) { res.send({ error: err }); return; }
      // Return the parsed JSON to client-side JavaScript
      res.send(reply);
      return;

	});

  
});
}).pipe(fs.createWriteStream('music.wav'));
});




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
