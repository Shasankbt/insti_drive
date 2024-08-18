import fs from 'fs';
import express from 'express';
import path from 'path';
import {exec} from 'child_process'
const fs_promises = fs.promises;

import userRoutes from './router/user.js';

const app = express();
const PORT = 5000;

app.listen(PORT);
app.set('view-engine','ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



export const dataDir = "data/"



// getDirContentsList(path.join(dataDir, "testdir"))

// app.get("/user/", (req,res) => {
    
// })

app.get("/user/:userId/path/*?", async (req, res)=>{
    const userId = req.params.userId;

    // console.log("user:",userId,"path:",pathId);

    // const path = userId + "/" + pathId;

    // const dir_contents_list = await getDirContentsList(path);
    // console.log(dir_contents_list)
    // res.json(dir_contents_list)

    

    console.log("listening in port", PORT)
    res.render("home.ejs");
})


// all the user post functions defined 
app.use("/user", userRoutes);



