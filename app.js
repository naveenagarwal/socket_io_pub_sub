
/**
 * Module dependencies.
 */

var express = require('express')
  , http    = require('http')
  , routes  = require('./routes');

var app = module.exports = express.createServer();
var io =  require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.post('/feed', function(request, response){
  

  var payload_id = request.body.payload;
  var reuestEnv = request.body.request_env;

  if(reuestEnv == "development"){
    
    feedURL = "http://localhost:3000/get_feed?activity=" + payload_id;

  }else if(reuestEnv == "staging"){
    
    feedURL = "http://184.72.146.82:3002/get_feed?activity=" + payload_id;
  
  }else if(reuestEnv == "production"){
    
    feedURL = "https://myteamsedge.com/get_feed?activity=" + payload_id;
  
  }

  http.get(feedURL, function(res){
    
    res.on('data', function (chunk) {
      var payloadData = JSON.parse(chunk);

      var channels = request.body.channels;
      
      if(typeof channels === 'string') {
        io.sockets.emit(channels, { payload: payloadData["html_data"] });
      }else{
        var i;
        for(i = 0; i < channels.length; i++){
          io.sockets.emit(channels[i], { payload: payloadData["html_data"] });
        }        
      }


    });
    
  })


  response.send(200);

});


app.listen(4444, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});