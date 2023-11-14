const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const code_block_model = require('./models/code_block'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const corsOptions = {
  origin: "https://moveo-task-client.vercel.app", 
  credentials: true,
};
// Enable CORS for all routes
app.use(cors(corsOptions));
// Parse JSON requests
app.use(bodyParser.json());

// Connect to MongoDB 
mongoose.connect('mongodb+srv://efratdavid8:8QV,mB+6t.weQ2S@cluster0.w2pzpxd.mongodb.net/moveotask?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    generateAndSaveCodeBlocks(); 
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.get("/", (req, res) => {
  res.json("Hello");
})

// Generate and save code blocks
async function generateAndSaveCodeBlocks() {
    const codeBlockData = [
        {
            _id: '1',
            title: 'Async/Await Example',
            code: 
    `async function fetchData() {
      try {
        const response = await fetch(url);
        const data = response.json();
        return data;
      } catch (error) {
        console.error('Error:', error);
      }
    }`, // Error: Missing 'await'
          solution: 
    `async function fetchData() {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error:', error);
      }
    }`
        },
        {
            _id: '2',
            title: 'Promise Chain',
            code: 
    `fetch(url)
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error))
      .then((result) => console.log('Additional result:', result));`, // An extra .then() block after the .catch(), which will result in a syntax error
            solution: 
    `fetch(url)
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error));`
        },
        {
            _id: '3',
            title: 'Array Filtering',
            code: 
    `const filteredArray = array.filter((item) => item > 10;`, // Error: Missing closing parenthesis ')'
            solution: 
    `const filteredArray = array.filter((item) => item > 10);`
        },
        {
            _id: '4',
            title: 'Object Destructuring',
            code: 
    `const person = {
        name: 'John',
        age: 30,
    };
            
    const { name, age } = people;`, // Error: 'people' is not defined
            solution: 
    `const person = {
        name: 'John',
        age: 30,
    };
            
    const { name, age } = person;`
        },
        {
            _id: '5',
            title: 'Template Literals',
            code: 
    `const name = 'Alice';
    const greeting = \`Hello, \{name}!\`;`, // Missing $
            solution: 
    `const name = 'Alice';
    const greeting = \`Hello, \${name}!\`;`
        },
        {
            _id: '6',
            title: 'Arrow Function',
            code: 
    `const add = (a, b) ==> a + b;`, // Wrong arrow function syntax
            solution: 
    `const add = (a, b) => a + b;`
        },
    ];

    try {
      const count = await code_block_model.countDocuments();
      if (count === 0) {
        for (const data of codeBlockData) {
          // Create a new code block document and save it to the database
          const codeBlock = new code_block_model(data);
          await codeBlock.save();
          console.log(`Saved code block with title: ${data.title}`);
        }
      } else {
        console.log('Code blocks already exist in the collection. No need to insert.');
      }  
    } catch (err) {
      console.error('Error checking or saving code blocks:', err);
    }
}


// Implement Socket.io to handle real-time code changes and updates
io.on('connection', (socket) => {
    console.log('A user connected');

    // Check if this is the first user (mentor)
    const isFirstUser = io.engine.clientsCount === 1;

    if (isFirstUser) {
        console.log('The first user is the mentor');
        // Send a flag to the client to identify as a mentor
        socket.emit('mentor', true); 
      } else {
        console.log('A student connected');
        // Send a flag to the client to identify as a student
        socket.emit('mentor', false); 
      }

    // Handle code updates from clients (students)
    socket.on('code-update', async (data) => {
        try {
            // Update the code block in the database
            const { _id, code } = data;
            const codeBlock = await code_block_model.findByIdAndUpdate(
                _id,
                { code },
                { new: true } // Return the updated code block
            );

            if (!codeBlock) {
                return;
            }

            // Broadcast the updated code to all connected clients, including mentors
            io.emit('code-updated', { _id, code: codeBlock.code, solution: codeBlock.solution});
        } catch (err) {
            console.error('Error updating code block:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

  
const codeBlockRoutes = require('./routes/code_block');
// Injecting the codeBlockRoutes within the application (mounting) on '/coding-application' path.
app.use('/coding-application', codeBlockRoutes);
  
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});





