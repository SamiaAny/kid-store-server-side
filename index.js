const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wiin6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log('uri',uri);

async function run() {
    try{
        await client.connect();
        const database = client.db("kidStore");
        const productCollection = database.collection("product");
        const orderCollection = database.collection("order");
        const reviewsCollection = database.collection("reviews");
        const userCollection = database.collection("users");

        //GET API FOR ALL PRODUCT
        app.get('/allproduct',async (req,res)=>{
            const result = await productCollection.find({}).toArray();
            res.json(result);
        });

        //GET API FOR SINGLE PRODUCT
        app.get('/allproduct/:id',async (req,res)=>{
            const id= req.params.id;
            const filter = {_id:ObjectId(id)};
            const product = await productCollection.findOne(filter);
            // console.log(product);
            res.json(product);
        });

        //POST API FOR INSERT PRODUCT
        app.post('/allproduct', async (req,res)=> {
            const productInfo = req.body;
            const addProduct = await productCollection.insertOne(productInfo);
            res.json(addProduct);
        });

        //DELETE PRODUCT
        app.delete('/allproduct/:id',async (req,res)=>{
            const id= req.params.id;
            const filter = {_id:ObjectId(id)};
            const product = await productCollection.deleteOne(filter);
            // console.log(product);
            res.json(product);
        });

        //POST API FOR USER
        app.post('/users', async (req,res)=>{
            console.log(req.body);
            const userInfo = req.body;
            const newUser = await userCollection.insertOne(userInfo);
            console.log(newUser);
            res.json(newUser);
        });

        //for finding admin user
        app.get('/users/:email', async (req,res)=>{
            const userEmail = req.params.email;
            const filter = { email: userEmail};
            const userAdmin = await userCollection.findOne(filter);
            let isAdmin = false;
            if(userAdmin?.role === 'admin') {
                isAdmin = true;
                res.json({admin:isAdmin});
            }
            else{
                res.status(403).json({message:''})
            }
        })

        //admin role using put 
        app.put('/users/admin',async (req,res)=>{
            const user = req.body;
            
            const filter = { email: user.email};
            const updateDoc = {
                $set: { role : 'admin'}
            };
            const result = await userCollection.updateOne(filter,updateDoc);
            // console.log(result);
            res.json(result)
        })

        //POST API FOR INSERTING ORDER COLLECTION 
        app.post('/orders', async (req,res)=> {
            const orderInfo = req.body;
            const result = await orderCollection.insertOne(orderInfo);
            // console.log(result);
            res.json(result);
        })

        //GET API FOR ORDER
        app.get('/allorder',async (req,res) => {
            const result = await orderCollection.find({}).toArray();
            // console.log(result);
            res.json(result);
        });

        //GET API FOR SINGLE ORDER INFO
        app.get('/allorder/:email',async (req,res)=> {
            const email = req.params.email;
            const filter = {email: email};
            const cursor = orderCollection.find(filter);
            const result = await cursor.toArray(); 
            res.json(result);
        });

        //PUT API UPDATE STATUS
        app.put('/allorder/:id',async (req,res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    status: 'shipped'
                }
            };
            const result = await orderCollection.updateOne(filter,updateDoc,options);
            // console.log(result);
            res.json(result);
        })

        //DELETE API 
        app.delete('/allorder/:id',async (req,res) => {
            const id = req.params.id;
            const filter = {_id:ObjectId(id)};
            const result = await orderCollection.deleteOne(filter);
            // console.log(result);
            res.json(result);
        })

        //GET API FOR lOAD ALL REVIEW
        app.get('/review',async (req,res)=>{
            const result = await reviewsCollection.find({}).toArray();
            res.json(result);
        })

        //POST API FOR INSERT REVIEW
        app.post('/review', async (req,res)=> {
            const userReview = req.body;
            const result = await reviewsCollection.insertOne(userReview);
            res.json(result);
        }) 


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('connect the server');
});

app.listen(port,()=> {
    console.log('listen to port',port);
})