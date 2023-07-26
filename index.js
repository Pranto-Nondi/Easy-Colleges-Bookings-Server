
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
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        const collegesCollection = client.db("EasyCollegeBookings").collection("colleges");
        const admissionDataCollection = client.db("EasyCollegeBookings").collection("admissionData");
        const reviewDataCollection = client.db("EasyCollegeBookings").collection("reviewData");


        // colleges related api
        app.get('/colleges', async (req, res) => {
            const result = await collegesCollection.find().toArray();
            res.send(result);
        });

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
              
                const result = await admissionDataCollection.find().toArray();
                // console.log('Found data:', result);
                res.json(result);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // API endpoint for submitting a review


        app.post('/reviews', async (req, res) => {
            const { collegeId, collegeName, review, rating } = req.body;

            try {
                const newReview = {
                    collegeId,
                    collegeName,
                    review,
                    rating,
                };


                await reviewDataCollection.insertOne(newReview);
                res.status(201).json({ message: 'Review added successfully!' });
            } catch (error) {
                console.error('Error saving review:', error);
                res.status(500).json({ error: 'An error occurred while saving the review.' });
            }
        });
        app.get('/reviews', async (req, res) => {
            try {
               
                const result = await reviewDataCollection.find().toArray();
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




























