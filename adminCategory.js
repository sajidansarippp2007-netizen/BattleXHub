import {
    database,
    ref,
    push,
    set,
    onValue,
    remove
} from "./firebase.js";
import {
showSuccess,
showError,
showConfirm
} from "./popup.js";
const categoryName = document.getElementById("categoryName");
const categoryBanner = document.getElementById("categoryBanner");
const createCategoryBtn = document.getElementById("createCategoryBtn");
const categoryList = document.getElementById("categoryList");

// Create Category

createCategoryBtn.onclick = async () => {

    if (
        categoryName.value == "" ||
        categoryBanner.value == ""
    ){
        showError("Fill all fields");
        return;
    }

    const newRef = push(ref(database,"categories"));

    await set(newRef,{
        name: categoryName.value,
        banner: categoryBanner.value
    });

    showSuccess("Category Created");

    categoryName.value = "";
    categoryBanner.value = "";

};

// Show Categories

onValue(ref(database,"categories"), (snapshot)=>{

    categoryList.innerHTML = "";

    if(!snapshot.exists()) return;

    snapshot.forEach((child)=>{

        const data = child.val();

        categoryList.innerHTML += `
        <div class="categoryCard">

            <img src="${data.banner}">

            <h3>${data.name}</h3>

            <button onclick="deleteCategory('${child.key}')">
            Delete
            </button>

        </div>
        `;

    });

});

// Delete Category

window.deleteCategory = async(id)=>{

    if(await showConfirm("Delete Category?")){

        await remove(ref(database,"categories/"+id));

    }

};