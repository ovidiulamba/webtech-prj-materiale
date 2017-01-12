var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');

var app = express();

app.use(express.static(__dirname + '/app'));
app.use(cors());
app.use(bodyParser.json());


var sequelize = new Sequelize('materialedb', 'ovidiulamba', '', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });


 //configurarile pentru baza de date sequelize

//in baza de date stochez date despre exercitii si programe, cu o relatie many-to-many Ex_program

var Material = sequelize.define('material', {
	
	nume: {
		type: Sequelize.STRING,
		validate: {
			len: [1, 200]
		},
		allowNull: false
	},
	descriere: {
		type: Sequelize.STRING,
		validate: {
			len: [1, 200]
		},
		allowNull: false
	},
	pret: {
		type: Sequelize.INTEGER,
		validate: {
			len: [1, 200]
		},
		allowNull: false
	}
}, {

  timestamps: false           // this will deactivate the timestamp columns
});
Material.sync({}).then(function () {});
var Furnizor = sequelize.define('furnizor', {
	

	nume: {
		type: Sequelize.STRING,
		validate: {
			len: [5, 200]
		},
		allowNull: false
	},
	email : {
	    type : Sequelize.STRING,
	    validate : {
	        isEmail:true
	    }
	}
}, {

  timestamps: false           // this will deactivate the timestamp columns
});
Furnizor.sync({}).then(function () {});

var Material_furnizor = sequelize.define('material_furnizor', {
	id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
});
Material_furnizor.sync({}).then(function () {});



var nodeadmin = require('nodeadmin');
app.use(nodeadmin(app));

app.get('/create', function(req, res){
    sequelize
		.sync({ 
		    force: true
		})
		.then(function(){
		    res.status(201).send('created')
		})
		.catch(function(error){
		    console.warn(error)
		    res.status(500).send('not created')
		})
})

app.get('/materiale',function(req, res) {
    
    Material.findAll().then(function (materiale) {
        res.status(200).send(materiale);
    }).catch(function(error){
        console.warn(error);
        res.status(404).send('materiale not found.')
    })
})

app.get('/furnizori',function(req, res) {
    
    Furnizor.findAll().then(function (furnizori) {
        res.status(200).send(furnizori);
    }).catch(function(error){
        console.warn(error);
        res.status(404).send('furnizori not found.')
    })
})

app.get('/materiale_furnizori',function(req, res) {
    
    Material_furnizor.findAll().then(function (f) {
        res.status(200).send(f);
    }).catch(function(error){
        console.warn(error);
        res.status(404).send('furnizori not found.')
    })
})


app.get('/materiale_dupa_furnizori/:id', function(req, res) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		database: 'materialedb',
		user: 'ovidiulamba',
		password: ''
	});

	var id = req.params.id;
	connection.connect();

	connection.query('select * from materials where materialId IN(select id from material_furnizors where furnizorId="' + id + '")', function(err, data, fields) {
		if (err) throw err;
		res.header("Access-Control-Allow-Origin", "*");
		res.status(200).send(data);
	})
})



app.post('/material_furnizor',function(req, res) {
    Material_furnizor.create(req.body)
    .then(function (matf) {
        console.log(matf+ ' was created');
        res.status(200).send(matf+ ' was created')
    }).catch(function(error){
        console.warn(error);
    })
})

app.post('/material',function(req,res){
    Material.create(req.body).then(function (material) {
        console.log(material+ ' was created');
        res.status(200).send(material+ ' was created')
    }).catch(function(error){
         res.status(409).send(error)
    })
})

app.post('/adaugafurnizor',function(req,res){
    Furnizor.create(req.body).then(function (furnizor) {
        console.log(furnizor+ ' was created');
        res.status(200).send(furnizor+ ' was created')
    }).catch(function(error){
         res.status(409).send(error)
    })
})

app.delete('/furnizor/:id/material/:mId', function(req, res) {
    var mId = req.params.mId
    var id = req.params.id
    Material_furnizor
        .find({where : {materialId : mId,furnizorId:id}})
        .then(function(message){
            message.destroy()
        })
        .then(function(){
            res.status(201).send('deleted')
        })
        .catch(function(error){
            console.warn(error)
            res.status(500).send('not created')
        })
})

app.post('/adaugaMaterialFurnizor', function(req, res) {
    Material_furnizor
        .create(req.body)
        .then(function(f){
           console.log(f+ ' was created');
        res.status(200).send(f+ ' was created')
        })
        .catch(function(error){
            console.warn(error)
            res.status(500).send('not created')
        })
})


app.put('/material/:id',function(req,res){
    Material.find({where : {id : req.params.id}})
    .then(function (event) {
        event.updateAttributes(req.body)
       
    }).then(function () {

         res.status(201).send('updated')

    }).catch(function(error){
        console.warn(error);
    })
})

app.listen(process.env.PORT);