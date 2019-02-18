const express = require('express');
const	bodyParser = require('body-parser');
const path = require('path');
const		cons = require('consolidate');
const		dust = require('dustjs-helpers');
const		pg = require('pg');
const		app = express();

app.engine('dust', cons.dust);

//Set default ext .dus
app.set('view engine', 'dust'); //so that the ext of dust files need not be specified in res.render
app.set('views', __dirname+'/views');

app.use(express.static(path.join(__dirname,'public')));
const config = {
  user: 'postgres', //this is the db user credential
  database: 'project1',
  password: 'Helloworld1',
  port: 5432,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
const port = process.env.PORT || 3000;

const pool = new pg.Pool(config);

//working
app.get('/', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM (select * from books order by avgrating desc limit 5)as hehe ', function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('index',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
	});
});
// Add route code Here
// app.get('/', (req, res) => {
//    res.send('Welcome to Our SCHOOL API');
// });
//
// app.get('/pool', function (req, res) {
//     pool.connect(function(err,client,done) {
//        if(err){
//            console.log("not able to get connection "+ err);
//            res.status(400).send(err);
//        }
//        client.query('SELECT * from students' ,function(err,result) {
//           //call `done()` to release the client back to the pool
//            done();
//            if(err){
//                console.log(err);
//                res.status(400).send(err);
//            }
//            res.status(200).send(result.rows);
//        });
//     });
// });
//
// app.post('/addstudent', function(req, res) {
//   const results = [];
//   // Grab data from http request
//   const data = {
//    name : req.body.studentName,
//    age : req.body.studentAge,
//    classroom : req.body.studentClass,
//    parents : req.body.parentContact,
//    admission : req.body.admissionDate,
//  }
//   // Get a Postgres client from the connection pool
//   pool.connect(function(err, client, done) {
//     // Handle connection errors
//     if(err) {
//       done();
//       console.log(err);
//       return res.status(500).json({success: false, data: err});
//     }
//     // SQL Query > Insert Data
//     client.query( 'INSERT INTO students(student_name,student_age, student_class, parent_contact, admission_date) VALUES($1,$2,$3,$4,$5) ',[data.name, data.age, data.classroom, data.parents, data.admission]);
//
//     // SQL Query > Select Data
//     // client.query('SELECT * FROM students');
//     // Stream results back one row at a time
//
//     // query.on('row', (row) => {
//     //   results.push(row);
//     // });
//     // // After all data is returned, close connection and return results
//     // query.on('end', () => {
//     //   done();
//     //   return res.json(results);
//     // });
//     client.query('SELECT * from students' ,function(err,result) {
//        //call `done()` to release the client back to the pool
//         done();
//         if(err){
//             console.log(err);
//             res.status(400).send(err);
//         }
//         res.status(200).send(result.rows);
//     });
//   });
// });


app.post('/search', (req, res)=>{
	pool.connect(function(err, client, done){
    const data = {
     name : req.body.name,
   }
   const query1 = {
  text: "SELECT * from books where title ilike '%' || $1 || '%'",
  values: [req.body.name],
};
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query(query1, function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('index1',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
	});
});
// Add
//hehe
app.listen(port, () => {
   console.log(`We are live at 127.0.0.1:${port}`);
});
