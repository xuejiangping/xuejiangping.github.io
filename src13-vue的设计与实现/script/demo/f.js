const fs = require('fs');
// const file = fs.createWriteStream('./big.file');
// for (let i = 0; i <= 1000; i++) {
//   file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit. \n');
// }
// file.end();

// const server = require('http').createServer();
// server.on('request',(req,res) => {
//   fs.createReadStream('./big.file').pipe(res); //create a ReadStream on the file and pipe it to the response object.
//   // fs.readFile('./big.file',(err,data) => {
//   //   if (err) throw err;
//   //   res.end(data);
//   // })
// });
// server.listen(8000);

let c = require('child_process')
c.exec('ls ',(err,data) => console.log(data))
