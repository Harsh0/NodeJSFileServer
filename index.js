var http = require('http');
var fs = require('fs');
var path = require('path');
var config = path.join(__dirname,"config.json");
http.createServer(function(req,res){
  console.log("new req to "+req.url);
  var content = fs.readFileSync(config);//reading config file through fileSystem allowing change on the fly in config.json
  content = JSON.parse(String(content));
  var key = Object.keys(content);
  if(key.indexOf(req.url)>-1){
    var file = content[key[key.indexOf(req.url)]].path;
    var filepath;
    if(content[key[key.indexOf(req.url)]].relative){//if relative file exist in same directory else the absolute path will be there
      filepath = path.join(__dirname,file);
    }else{
      filepath = file;
    }
    var stat = fs.statSync(filepath);
    var readStream = fs.createReadStream(filepath);
    res.writeHead(200,{
      "Content-Type":"application/octet-stream",
      "Content-Length":stat.size,
      "Content-Disposition":'filename="'+path.basename(filepath)+'"'
    });//sending response header
    readStream.pipe(res);//piping readStream to response
  }else{
    res.writeHead(404,{"Content-Type":"text/plain"});
    res.end('file not found');//error no route found
  }
}).listen(80,function(){
  console.log('file server has started');
})
