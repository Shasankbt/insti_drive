async function loadDirectoryContents(directory_path){
    return new Promise((resolve, reject) => {
        fetch("/user/load-directory-contents", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "path" : directory_path
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

async function renderDirectoryContents(directory_path){
    const directoryContainer = document.querySelector(".directory-container")
    const directoryItemContainerTemplate = document.querySelector("[directory-item-container-template]")
    console.log(directoryItemContainerTemplate)

    directory_contents = await loadDirectoryContents(directory_path);

    if(directory_contents.response === "error")
        ;// add error case fn

    directory_contents["res-data"].forEach(direcory_item => {
        const directory_item_card = directoryItemContainerTemplate.content.cloneNode(true).children[0]
        directory_item_card.querySelector('.item-name').innerHTML = direcory_item.filename;
        if(direcory_item.directory === "yes")
            directory_item_card.querySelector("img").src = "folder.svg"
        directoryContainer.appendChild(directory_item_card);
    })

}

document.addEventListener("DOMContentLoaded", ()=>{
    renderDirectoryContents("data/testdir");
})

