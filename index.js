//importing all modules
const express = require('express')
const bodyparser = require('body-parser');
var urlencodedParser = bodyparser.urlencoded({extended:false});
const { exec } = require("child_process");
const cp = require('child_process');
const morgan = require('morgan');

//setting=================================================================================
const app = express()
app.use(express.static('src'));
app.set('port', process.env.PORT || 3000); //set ports
// using morgan to find request route
app.use(morgan('dev'));

//variables=================================================================================
var global1;
var global2;
var global3; 
var lp;
app.locals.data = {};
var token="tokens=*";
//functions=================================================================================

//to clone the project from github
function createclone(linkname){
  global1 = app.locals.data.folder;
  global2 = app.locals.data.folder;
  global3 = app.locals.data.folder;
  console.log(app.locals.data);
  exec("cd public & git clone "+linkname, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return ;   
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return ;
      }
      console.log(`stdout: ${stdout}`);
  });
}

//get methode=========================================================================================
app.get('/', (req, res) =>{
  res.sendFile(__dirname+'/index.html');  //firt methode to access
}); 

//method after stopping the container
app.get('/stop',(req,res) => {

  cp.execSync("FOR /f \""+token+"\" %i IN ('docker ps -q') DO docker stop %i", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return ;   
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return ;
    }
    console.log(`stdout: ${stdout}`);
  });
  res.download("./"+ global2 + ".txt")
})

//post methode===========================================================================================
app.post('/',urlencodedParser,(req,res)=>{
    //create clone and render build page
    var linkname = req.body.link;
    req.app.locals.data = req.body;
    createclone(linkname);
    res.sendFile(__dirname+"/docker.html");
});

app.post('/test',urlencodedParser,(req,res) =>{
  //docker build and run function and route to the test
  var server_type = req.body.server;
  console.log(global2,server_type); 
  var dp1 = req.body.port;
  lp = req.body.localport;
  console.log(dp1,lp);
  if(server_type == "single"){
    cp.execSync("cd public & cd "+global2+" & docker build -t "+global2+" . & docker run -d -p "+lp+":"+dp1+" "+global2, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        alert("Something went Wrong.....")
        res.sendFile(__dirname+"/index.html")
        return ;   
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return ;
      }
        console.log(`stdout: ${stdout}`);
    });
  }
  else{
    cp.execSync("cd public & cd "+global2+" & docker-compose up -d", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        alert("Something went Wrong.....")
        res.sendFile(__dirname+"/index.html")
        return ;   
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return ;
      }
        console.log(`stdout: ${stdout}`);
    });
  }
  
  res.sendFile(__dirname+"/test.html");
});

app.post('/result',urlencodedParser,(req,res) =>{
  //test the server and generate test.txt file 
  console.log(global3,lp); 
  var totalRequests = req.body.total;
  var concurrentRequests = req.body.concurrent;
  console.log(totalRequests, concurrentRequests)
  //first part to be executed+
  cp.execSync("ab -n "+totalRequests+" -c " +concurrentRequests+ " http://localhost:"+lp+"/  >  "+global3+".txt", (error, stdout, stderr) =>
  {
    if (error) {
      console.log(`error: ${error.message}`);
      return 0;   
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return 0;
    }
      console.log(`stdout: ${stdout}`);
      return 1;
  });
  res.sendFile(__dirname+'/final.html')
});


//listening the server
app.listen(app.get('port'), () => console.log(`Example app listening on port port!`))