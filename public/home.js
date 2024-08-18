import {getSessionDirectoryContents, saveSessionDirectoryContents} from "/session_data.js"

function getDirectoryPath(){
    
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/').filter(segment => segment);

    const userId = pathSegments[1];
    const pathId = pathSegments.slice(3).join("/") || "";

    console.log(userId + "/" + pathId, ":" , window.location.href)
    return {
        "user" : userId,
        "path" : pathId
    };
}

function backTrackURL(){
    const current_url = new URL(window.location.href);
    const pathSegments = current_url.pathname.split('/').filter(segment => segment);
    if(pathSegments.len === 3) // at the root folder
        return current_url;
    const backtrack_path = pathSegments.slice(0,-1).join("/")
    return current_url.origin + "/" + backtrack_path + "/";
}

async function checkServerSync(directoryDetails, local_sync){
    return new Promise((resolve, reject)=>{
        console.log(directoryDetails)
        fetch("/user/get-server-sync", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "req-details": directoryDetails
            })
        })
        .then(res => {
            if(! res.ok ){
                reject(new Error(`HTTP error! Status: ${res.status}`));
            }
            return res.json();
        })
        .then(data => {
            const server_sync = data["server-sync"];
            resolve(server_sync === local_sync);        
        })
    })
}

async function loadDirectoryContents(directoryDetails){
    return new Promise((resolve, reject) => {
        fetch("/user/load-directory-contents", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "req-details" : directoryDetails
            })
        })
        .then(res => {
            if(! res.ok ){
                reject(new Error(`HTTP error! Status: ${res.status}`));
            }
            return res.json();
        })
        .then(data => {
            if (data.response === "error") 
                console.error('Error:', data['error-message']);
            console.log('Server Response:', data);
            resolve(data);         
        })
    })
}

function setDirectoryItemsAttributes(directory_item_card, direcory_item_data){
    directory_item_card.querySelector('.item-name').innerHTML = direcory_item_data.filename;
    if(direcory_item_data.directory === "yes"){
        directory_item_card.querySelector("img").src = "/folder.svg";
        const newUrl = new URL(direcory_item_data.filename + "/", window.location.href);
        console.log(newUrl.href)
        directory_item_card.setAttribute("data-url",newUrl.href);
        directory_item_card.setAttribute("data-redirectable", "yes");
    }
    directory_item_card.addEventListener("click", ()=>{
        if(directory_item_card.getAttribute("data-redirectable") === "yes"){
            console.log("changing location", directory_item_card.getAttribute("data-url"))
            window.location.href = directory_item_card.getAttribute("data-url");  
        }
    })
    return directory_item_card;
}

async function renderDirectoryContents(directoryDetails){
    const directoryContainer = document.querySelector(".directory-container")
    const directoryItemContainerTemplate = document.querySelector("[directory-item-container-template]")
    
    let directory_contents = getSessionDirectoryContents(directoryDetails.user + "/" + directoryDetails.path);

    if( ! await checkServerSync(directoryDetails, directory_contents["server-sync"])){
        console.log("syncing from the server")
        directory_contents = await loadDirectoryContents(directoryDetails);
        saveSessionDirectoryContents(directoryDetails.user + "/" + directoryDetails.path, directory_contents)
    }

    if(directory_contents.response === "error")
        ;// add error case fn

    directory_contents["res-data"].forEach(direcory_item => {
        const directory_item_card = directoryItemContainerTemplate.content.cloneNode(true).children[0]
        directoryContainer.appendChild(setDirectoryItemsAttributes(directory_item_card, direcory_item));
    })
}

document.addEventListener("DOMContentLoaded", async ()=>{
    await renderDirectoryContents(getDirectoryPath());
    document.querySelector(".back-button").addEventListener("click", ()=>{
        window.location.href = backTrackURL();
    })
})





