import { getDirectoryDetails, renderDirectoryContents } from "./commonFunctions.js";

document.addEventListener("DOMContentLoaded", ()=>{
    const selectUploadButton = document.querySelector('.select-upload-button');
    const uploadPreviewSection = document.querySelector(".upload-preview");
    const uploadSelected = document.querySelector(".upload-files-button");

    selectUploadButton.addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    let selectedFiles = []

    // file select preview popper 
    document.getElementById('fileInput').addEventListener('change', function(event) {
        selectedFiles = Array.from(event.target.files);
        selectedFiles.forEach(file => {
            const filename_p = document.createElement("p");
            filename_p.innerHTML = file.name;
            uploadPreviewSection.appendChild(filename_p);
        })
    });

    // send to server
    uploadSelected.addEventListener("click", ()=>{
        const formdata = new FormData();
        selectedFiles.forEach(file =>{
            formdata.append("files[]", file);
        })
        console.log(getDirectoryDetails())
        try{
            fetch("/user/upload-files", {
                method: "POST",
                body: formdata,
                headers:{
                    "user": getDirectoryDetails().user,
                    "path": getDirectoryDetails().path
                }
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                if(res.response === "ok"){
                    renderDirectoryContents(getDirectoryDetails());
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })


})