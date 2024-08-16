
document.addEventListener("DOMContentLoaded",()=>{
    const directoryContainer = document.querySelector(".directory-container");
    // const directoryItems = document.querySelectorAll(".directory-item-container");
    const selectorRect = document.querySelector(".selector-rect")

    // ---------------------storage variables-------------------
    let initialX, initialY , currentX, currentY  = undefined
    let left, top, width, height = undefined
    let isDrawing = false;
    //----------------------------------------------------------

    function setSelectorRectDimensions(){
        left = Math.min(initialX, currentX) - window.scrollX
        top = Math.min(initialY, currentY) - window.scrollY 
        width = Math.abs(initialX - currentX)
        height = Math.abs(initialY - currentY)
        selectorRect.style.left = left + 'px';
        selectorRect.style.top = top + 'px';
        selectorRect.style.width = width + 'px';
        selectorRect.style.height = height + 'px';
    }

    function SelectDirectoryItems(){
        function SelectingRectIntersect(item_rect){
            // x,y must be relative 
            return (item_rect.top < top + height &&
            item_rect.left < left + width && 
            item_rect.bottom > top && 
            item_rect.right > left)
        }
        const directoryItems = document.querySelectorAll(".directory-item-container");
        directoryItems.forEach(directory_item => {
            const itemRect = directory_item.getBoundingClientRect();
            if (SelectingRectIntersect(itemRect) && isDrawing){
                directory_item.classList.add("selected")
            } else {
                directory_item.classList.remove("selected")
            }
        })
    }

    directoryContainer.addEventListener("mousedown", (event)=>{
        isDrawing = true
        selectorRect.style.display = 'block';
        initialX = currentX = event.pageX;
        initialY = currentY = event.pageY;
        setSelectorRectDimensions();
        console.log("relative: ",event.clientX,event.clientY);
        console.log("absolute:", event.pageX,event.pageY)
    })

    document.addEventListener("mousemove", (event) => {
        if (!isDrawing) return; // Only draw if mouse is down
        currentX = event.pageX;
        currentY = event.pageY;
        setSelectorRectDimensions();
        SelectDirectoryItems();
    })

    document.addEventListener("mouseup", ()=>{
        if (isDrawing) {
            selectorRect.style.display = 'none';
            isDrawing = false;
            SelectDirectoryItems();
        }
    })
})