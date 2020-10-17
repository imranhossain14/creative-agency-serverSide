const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const fs = require('fs-extra');
const fileUpload= require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors')

// Database connection configuration here
const uri = "mongodb+srv://volunteer-imran:imran123456@cluster0.jsbl6.mongodb.net/creativeAgency?retryWrites=true&w=majority"


// Make ready app for use with express , cors and bodyParser
const app = express();
const port = 5000;

// nicher duita middlewire client and server er access er permission diche(cros) r body er data gula pares(bodyparse) kore json akare niye astese
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('Orders'));
app.use(fileUpload())


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// all connection are here --------------------------------------------------------------------

client.connect(err => {
  const adminCollection = client.db("creativeAgency").collection("admin");
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const serviceCollection = client.db("creativeAgency").collection("service");
  


  // client ja post korbe tar request r server end a ja kaj kora hobe tar response pathabo
  //Create er jah CRUD er
// ALL APIs are here ---------------------------------------------------------------

// Adding Order to database --------------------------------
  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const projectName = req.body.projectName;
    const projectDetails = req.body.projectDetails;
    const filePath = `${__dirname}/Orders/${file.name}`;
    file.mv(filePath,err=>{
      if(err){
        console.log(err);
        res.status(500).send({msg:"Failed to Upload image"})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image ={
        contentType: req.files.file.mimetype,
        size : req.files.file.size,
        img : Buffer(encImg, 'base64')
      };
      orderCollection.insertOne({name,email,projectName,projectDetails,image})
      .then(result=>{
        fs.remove(filePath,error=>{
          if(error){
            console.log(error)
            res.status(500).send({msg:"Failed to Upload an image"})
          }
            res.send(result);
        })
      })   
    })
  })

   //Read Operation of CRUD-------------------------------------------------------------------------
  app.get('/orders', (req, res) => {
    orderCollection.find({
        email: req.query.email
      })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })

// Service adding operation here ------------------------------------------------------------------
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const serviceTitle = req.body.serviceTitle;
    const description = req.body.description;
    const serviceName = req.body.serviceName;
    const filePath = `${__dirname}/Services/${file.name}`;
    file.mv(filePath,err=>{
      if(err){
        console.log(err);
        res.status(500).send({msg:"Failed to Upload image"})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image ={
        contentType: req.files.file.mimetype,
        size : req.files.file.size,
        img : Buffer(encImg, 'base64')
      };
      serviceCollection.insertOne({serviceTitle,description,image,serviceName})
      .then(result=>{
        fs.remove(filePath,error=>{
          if(error){
            console.log(error)
            res.status(500).send({msg:"Failed to Upload an image"})
          }
            res.send(result);
        })
      })   
    })
  })


  // Service send to client operation ------------------------------------------------------
  app.get('/services', (req, res) => {
    serviceCollection.find({
        email: req.query.email
      })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })


    // Order send to client operation -----------------------------------------------------------------
  app.get('/allOrders', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })



// save review in database---------------------------------------------------------------------
     app.post("/addReviews", (req, res) => {
    const Product = req.body;
    reviewCollection.insertOne(Product)
      .then(result => {
        console.log("data added Successfully");

      })
  })

    // All Reviews send to client operation --------------------------------------------------
    app.get('/reviews', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // Add new Admin in our database------------------------------------------------------
  app.post("/addAdmin", (req, res) => {
    const Product = req.body;
    adminCollection.insertOne(Product)
      .then(result => {
        console.log("data added Successfully");

      })
  })

    // Check whether the user are in our admin database or not------------------------------
  app.post('/isAdmin',(req,res)=>{
    const email = req.body.email;
    adminCollection.find({ email: email})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  app.get('/', (req, res) => {

    res.send('My Database Code is Working Fine !!!!!!!!')

  })
});


app.listen(process.env.PORT || port);