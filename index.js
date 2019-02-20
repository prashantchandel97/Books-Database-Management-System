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
		client.query('SELECT * FROM (select * from view2 order by average_rating desc limit 5)as hehe ', function(err, result){
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
app.get('/top20', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('select * from books where original_publication_year>=2009 order by average_rating desc limit 20 ', function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('index2',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
	});
});
app.get('/favourites', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
    const query1 = {
   text: "select books.book_id,books.isbn13,books.authors,books.original_publication_year,books.title,books.language_code,books.average_rating from(select * from viewbookidtagname where tag_name ilike $1)as hehe inner join books on books.book_id=hehe.book_id order by average_rating desc limit 50",
   values: ['all-time-favourites'],
 };
		client.query(query1, function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('indexfavourites',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
	});
});
app.get('/:leg', function(req, res, next) {
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    const query1 = {
   text: "select * from books where original_publication_year=$1",
   values:[req.params.leg],
 };
    client.query(query1, function(err, result){
      if(err){
        return console.error('error running query', err);
      }
      //myFunction(result);
      //res.sendFile(path.join(__dirname+'display.html'));
      res.render('indexfavourites',{books: result.rows});
      //console.log(res);  //uncomment to see result object on console
      //note that result.row is an array of objects
    });
  });
});

//sumit code

app.post('/login', (req, res)=>{

	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM users WHERE userid= $1 AND password=$2',[req.body.uname, req.body.psw], function(err, result){
			if(err){
				return console.error('error running query', err);

			}
			if(result.rowCount == 0){res.render('index', {'wrongid':'a'});}
			else{
				var x= result.rows[0].userid;
				res.send('Hello '+ x);
			}

		});
	});

});


app.get('/newpage', function(req, res){
		res.sendFile(__dirname+"/display.html");
		//res.sendStatus(200);
});



app.post('/add', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO book(name, id) VALUES($1,$2)',[req.body.name, req.body.id])

		done();
		res.redirect('/');

	});
});

app.post('/signup', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO users(userid, password) VALUES($1,$2)',[req.body.uid, req.body.pwd],(err,result)=>{
			if(err){
				res.render('index', {'already':['a']});
			}
		});
    res.redirect('/');
		done();

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
      year : req.body.year,
   }
   if(data.year!='')
   {
   const query1 = {
  text: "SELECT * from books where title ilike '%' || $1 || '%' and authors ilike '%' || $2 || '%' and original_publication_year=$3",
  values: [req.body.name,req.body.Author,req.body.year],
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
  }
  else
  {
    const query1 = {
   text: "SELECT * from books where title ilike '%' || $1 || '%' and authors ilike '%' || $2 || '%' ",
   values: [req.body.name,req.body.Author],
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
  }
	});
});

// Add
//hehe
app.listen(port, () => {
   console.log(`We are live at 127.0.0.1:${port}`);
});
