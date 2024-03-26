const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb'); 

const mongoUri = "mongodb+srv://raman:Ng1yxagoSmFuTlmk@cluster0.yy0olr1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
  const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    return client.db(); // default database
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas', error);
    return null;
  }
}

const app = express();
app.use(bodyParser.json());

connectToMongoDB().then((db) => {
  if (!db) {
    console.error('Failed to connect to MongoDB Atlas');
    process.exit(1);
  }

  // GET API to retrieve all users
  app.get('/users', async (req, res) => {
    try {
      const users = await db.collection('users').find().toArray();
      res.json({
        message: "Users retrieved",
        success: true,
        users: users
      });
    } catch (err) {
      console.error('Error retrieving users:', err);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  });

  // GET API to retrieve a single user by ID
  app.get('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }); 
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      res.json({ success: true, user: user });
    } catch (err) {
      console.error('Error retrieving user:', err);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  });
  

  // PUT API to update a user
  app.put('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const { email, firstName } = req.body;
      await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { email, firstName } }); 
      res.json({ message: "User updated", success: true });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  });
  
// POST API to add a new user
app.post('/users', async (req, res) => {
    try {
      const { email, firstName } = req.body;
      await db.collection('users').insertOne({ email, firstName });
      res.json({ message: "User added", success: true });
    } catch (err) {
      console.error('Error adding user:', err);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  });
  
  // DELETE API to delete a user by ID
  app.delete('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      await db.collection('users').deleteOne({ _id: new ObjectId(userId) }); 
      res.json({ message: "User deleted", success: true });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  });
  

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB Atlas:', error);
});
