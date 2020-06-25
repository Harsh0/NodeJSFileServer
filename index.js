const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const uploadPath = './uploads/';
const static = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf' };
const mapping = {
  '/': './static/index.html'
}
let port = process.argv[2] || 8080; port = +port;

const uploadFile = (req, res) => {
  if (!fs.existsSync(uploadPath)) {
    //make directory
    fs.mkdirSync(uploadPath);
  }
  var newForm = formidable.IncomingForm();
  newForm.keepExtensions = true;
  let tmpFile, nFile;
  newForm.parse(req, function (err, fields, files) {
    tmpFile = files.upload.path;
    nFile = uploadPath + files.upload.name;
    res.writeHead(200, {
      'Content-type': 'text/plain'
    });
    res.end();
  });
  newForm.on('end', function () {
    let rs = fs.createReadStream(tmpFile);
    let ws = fs.createWriteStream(nFile);
    rs.pipe(ws);
    rs.on('end', function () {
      //delete tmpFile
      fs.unlinkSync(tmpFile);
    })
    reqLog = req.method + ' ' + req.url + '\t' + nFile + '\t' + (new Date().toString());
    //add log to log file
    fs.appendFile('requests.log', reqLog + '\n', (err) => {
      if (err) throw err;
      console.log(reqLog);
    });
  });
}

const downloadFile = (req, res) => {
  let file = req.url;
  if(mapping[file]) {
    file = mapping[file];
  } else {
    file = '.' + file;
  }
  if (!fs.existsSync(file)) {
    file = uploadPath + file.substring(1);
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end('file not found');//error no route found
      return
    }
  }
  let reqLog = req.method + ' ' + req.url + '\t' + file + '\t' + (new Date().toString());
  //add log to log file
  fs.appendFile('requests.log', reqLog + '\n', (err) => {
    if (err) throw err;
    console.log(reqLog);
  });
  const stat = fs.statSync(file);
  const headers = {
    "Content-Type": "application/octet-stream",
    "Content-Length": stat.size,
    "Content-Disposition": 'filename="' + path.basename(file) + '"'
  }
  if (static[path.extname(file)]) {
    headers['Content-Type'] = static[path.extname(file)]
  }
  res.writeHead(200, headers);
  const readStream = fs.createReadStream(file);
  readStream.pipe(res);  
}

const errorHandling = (err, res) => {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.write('Internal Error occured\n');//error no route found
  res.end(err);
}

http.createServer((req, res) => {
  try {
    if (req.url == '/uploadFile') {
      uploadFile(req, res);
    } else {
      downloadFile(req, res);
    }  
  } catch (error) {
    errorHandling(error, res);
  }
}).listen(port, () => console.log('File server has started at port ' + port));
