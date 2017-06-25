const http = require('http');
const fs = require('fs');
const path = require('path');
let config = path.join(__dirname,"config.json");
let port = process.argv[2]||8080;port = +port;
let getJson = (config,runTimeJsonUpdateFlag)=>{
  if(runTimeJsonUpdateFlag){//if true updated json content will be passed else content at starting time of server
    var content = fs.readFileSync(config);//reading config file through fileSystem allowing change on the fly in config.json
    return JSON.parse(String(content));
  }else{
    return require(config); 
  }
}
http.createServer((req,res)=>{
  content = getJson(config,false);
  var key = Object.keys(content);
  if(key.indexOf(req.url)>-1){
    var file = content[key[key.indexOf(req.url)]].path;
    var filepath;
    if(content[key[key.indexOf(req.url)]].relative){//if relative file exist in same directory else the absolute path will be there
      filepath = path.join(__dirname,file);
    }else{
      filepath = file;
    }
    let reqLog = req.method+' '+req.url+'\t'+filepath+'\t'+(new Date().toString());
    //add log to log file
    fs.appendFile('requests.log', reqLog+'\n', (err) => {
      if (err) throw err;
      console.log(reqLog);
    });
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
}).listen(port,()=>console.log('File server has started at port '+port));
