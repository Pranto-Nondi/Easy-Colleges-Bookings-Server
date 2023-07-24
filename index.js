
const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1eww0o2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((err) => {
            if (err) {
                console.log(err)
                return err
            }
        });
        const collegesCollection = client.db("EasyCollegeBookings").collection("colleges");
        const admissionDataCollection = client.db("EasyCollegeBookings").collection("admissionData");


        // colleges related api
        app.get('/colleges', async (req, res) => {
            const result = await collegesCollection.find().toArray();
            res.send(result);
        });
        // API endpoint for searching colleges by name
        app.get('/searchColleges', async (req, res) => {
            const { name } = req.query;

            try {

                const colleges = await collegesCollection.find({
                    name: { $regex: name, $options: 'i' },
                }).toArray();

                res.send(colleges);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // id by search college
        //  app.get('/colleges/:id', async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: new ObjectId(id) };

        //     const result = await collegesCollection.findOne(query);
        //     res.send(result);
        // })

        // admission form
        app.post('/admission', async (req, res) => {
            const admissionForm = req.body;


            try {
                const result = await admissionDataCollection.insertOne(admissionForm);
                res.status(200).json({ insertedId: result.insertedId });
            } catch (error) {
                console.error('Error inserting form data:', error);
                res.status(500).json({ error: 'Failed to insert form data' });
            }
        });
        app.get('/admission/search', async (req, res) => {
            try {
                console.log('Received request for admission search');
                const result = await admissionDataCollection.find().toArray();
                // console.log('Found data:', result);
                res.json(result);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });




















        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('easyCollegeBookings is Running')
})

app.listen(port, () => {
    console.log(`easyCollegeBookings is Running on port ${port}`);
})




























