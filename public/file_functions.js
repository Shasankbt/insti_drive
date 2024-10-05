import { selectedDirectoryItems } from "./ui_functions.js"
import { DIRECTORY_TYPES , getDirectoryDetails ,renderDirectoryContents } from "./commonFunctions.js";
import { getSessionDirectoryContents } from "./session_data.js"

document.addEventListener("DOMContentLoaded", ()=>{
    const fileFunctionsContainer = document.querySelector(".file-functions-container");

    // --------------------------- delete button ----------------------------------------------
    const deleteButton = fileFunctionsContainer.querySelector(".delete-button");
    const directoryType = deleteButton.getAttribute("data-directory-id");
    deleteButton.addEventListener("click", ()=>{
        console.log(selectedDirectoryItems)
        if(directoryType == DIRECTORY_TYPES.files) {    
            fetch("/user/delete-files", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "selected-items": selectedDirectoryItems.map(item => item.querySelector("p").innerHTML),
                    "req-details" : getDirectoryDetails("files") 
                })
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                if(res.response === "ok"){
                    renderDirectoryContents(getDirectoryDetails());
                }
            })
        } 
    })

    // --------------------------------- restore button ------------------------------------------
    const restoreButton = fileFunctionsContainer.querySelector(".restore-button");
    restoreButton.addEventListener('click', ()=>{
        console.log(selectedDirectoryItems)
        console.log(getSessionDirectoryContents(getDirectoryDetails().user + "/", DIRECTORY_TYPES.trash))
        // fetch("/user/restore-files", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         "selected-items": selectedDirectoryItems.map(item => item.querySelector("p").innerHTML),
        //         "req-details" : getDirectoryDetails("files") 
        //     })
        // })
        // .then(res => res.json())
        // .then(res => {
        //     console.log(res)
        //     if(res.response === "ok"){
        //         renderDirectoryContents(getDirectoryDetails());
        //     }
        // })
    })
})