import fs from 'fs';
import express from 'express';
import path from 'path';
const fs_promises = fs.promises;

import userRoutes from './router/user.js';

const app = express();
const PORT = 5000;

app.listen(PORT);
app.set('view-engine','ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const dataDir = "data/"

export async function getDirContentsList(directory_path){
    directory_path = path.join(dataDir,directory_path);
    console.log("reading dir :", directory_path);
    try{
        const filenames = await fs_promises.readdir(directory_path);
        const metadata_promises = filenames.map(async (filename) => {
            const fullPath = path.join(directory_path, filename);
            const stats = await fs.promises.stat(fullPath);
            return {
                filename: filename,
                directory: stats.isDirectory() ? "yes" : "no"
            };
        })
        const files_fulldata = await Promise.all(metadata_promises)
        console.log(files_fulldata)
        return {
            "response" : "ok",
            "server-sync" : Date.now(),
            "res-data" : files_fulldata,
        }    
    } catch(error) {
        return {
            "response" : "error",
            "server-sync": Date.now(),
            "error-message": error.message
        };
    }
}

// getDirContentsList(path.join(dataDir, "testdir"))

app.get("/user/*", (req,res) => {
    console.log("listening in port", PORT)
    res.render("home.ejs");
})

// app.get("/user/:userId/path/:pathID?", async (req, res)=>{
//     const userId = req.params.userId;
//     const pathId = req.params.pathID || "";

//     console.log("user:",userId,"path:",pathId);

//     const path = userId + "/" + pathId;

//     const dir_contents_list = await getDirContentsList(path);
//     console.log(dir_contents_list)
//     res.json(dir_contents_list)
// })


// all the user post functions defined 
app.use("/user", userRoutes);



