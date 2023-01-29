const express = require('express')
const bodyParser = require('body-parser');
const mysql = require("mysql");
var path = require("path");


const PORT = 4000
const app = express()
const HOST = '127.0.0.1';



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// create connection with mysql
const connection = mysql.createPool({
    host: 'localhost', 
    user: 'root',
    password: '12345'
    // database: 'playerData'
});



connection.query(`SHOW DATABASES`, function (err, results) {

    if (err) throw err;
    const dbs = results.map(db=>db.Database);

    // playerData already exists
    if(dbs.includes('playerData')){

        console.log("playerData already exists");

        // use playerData database 
        connection.query(`USE playerData`, function (err, result) {
        if (err) throw err;
        console.log("Schema connected");
        });

    }


    // playerData database does not exists
    else{
        console.log("playerData does not exists");

        // create database named payerData
        connection.query(`CREATE SCHEMA IF NOT EXISTS playerData`, function (err, result) {

            // create a page if the table does not exists
            connection.query(`CREATE TABLE IF NOT EXISTS playerData.players3 (
            playerId INT NOT NULL PRIMARY KEY,
            gameId INT NOT NULL,
            points INT NOT NULL,
            timestamp VARCHAR(255) NOT NULL
            )`, function (err, result) {
            if (err) throw err;
            console.log("table created");
            });


        if (err) throw err;
        console.log("Schema created");  
        });
    }

});



// display page it should open to when started
app.get('/', (req, res) => {
    res.redirect("/enterData.html");
  })


// handle the request from enterData.html
app.post('/saveData', (req, res) => {
    
    var playerId = req.body.playerId;
    var gameId = req.body.gameId;
    var points = req.body.points;
    var timestamp = req.body.timestamp;

  
    connection.getConnection((err, connection) => {
      if (err) throw err;
      console.log("CONNECTION ESTABLISHED")
  
      connection.query(`INSERT INTO playerData.players3 (playerId, gameId, points, timestamp) VALUES ('${playerId}','${gameId}', '${points}', '${timestamp}')`, (err, rows) => {
        connection.release();
  
        if (err) {
          console.log(err);
        }
      })
    })
  })



// used in showTop.html
// get the top 100 scores from database
app.get('/getTop', (req, res) => {

    console.log("CONNECTED");
  
    connection.getConnection((err, connection) => {
  
      if (err) throw err;
      console.log("CONNECTION ESTABLISHED");
  
      connection.query('SELECT * FROM playerData.players3 ORDER BY points DESC LIMIT 100', (err, rows) => {
        connection.release();
  
        if (!err) {
          res.send({ rows });
        }
        else {
          console.log(err);
        }
      })
    })
  })



app.use('/', express.static(__dirname));

app.listen(PORT, () => { console.log(`Server running on port: ${PORT}`) });