const express = require("express");
const fs = require("fs");
const mongoose = require('mongoose');

const app = express();
const PORT = 8000;

    //Connection
mongoose.connect('mongodb://127.0.0.1:27017/backend-app-2')
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log("Mongo error", err));

    //Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    jobTitle: {
        type: String,
    },
    gender: {
        type: String,
    },
},{timestamps:true});

//Model
const User = mongoose.model('user', userSchema);

//Middleware - plugin
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    fs.appendFile("log,txt",
        `${Date.now()}:${req.ip}: ${req.method}: ${req.path}\n`,
        (err, data) => {
            next();
        });

});



// Routes
app.get("/users", async(req, res) => {
        const allDbUsers =  await User.find({});
        const html = `
       <ul>
           ${allDbUsers.map((user) => `<li>${user.firstName}-${user.email}</li>`).join("")}
       
       </ul>   
   `;
    res.send(html);
});

//REST api
app.get("/api/users", async(req, res) => {
    const allDbUsers =  await User.find({});
    res.setHeader("X-myName", "yashdeep"); //Custom header
    
    return res.json(allDbUsers);
});


app
    .route("/api/users/:id")
    .get(async(req, res) => {
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User is not found" });
        return res.json(user);
    })
    .patch(async(req, res) => {
        await User.findByIdAndUpdate(req.params.id,{lastName:"Changed"});
        return res.json({status:"Success"});
    })
    .delete(async(req, res) => {
        await User.findByIdAndDelete(req.params.id);
        return res.json({ status: "Success" });
         });


app.post('/api/users', async(req, res) => {
    // TODO : Create new user
    const body = req.body;
    if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.jobTitle)
        return res.status(400).json({ msg: "All fields are required" });
    
    const result= await User.create({
          firstName: body.first_name,
          lastName:  body.last_name ,
          email: body.email,
          gender: body.gender,
          jobTitle: body.jobTitle,
    });
    console.log(result);
    return res.status(201).json({msg:"Success"});
});


app.listen(PORT, () => console.log(`Server started ar Port:${PORT}`));
