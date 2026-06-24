import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDAmFnZd7CHGtzf6NfNPdF2DPKhwnGz46M",
    authDomain: "fir-chatting-e5e6b.firebaseapp.com",
    databaseURL: "https://fir-chatting-e5e6b-default-rtdb.firebaseio.com",
    projectId: "fir-chatting-e5e6b",
    storageBucket: "fir-chatting-e5e6b.firebasestorage.app",
    messagingSenderId: "499322592834",
    appId: "1:499322592834:web:e6df99db1a7a000f2197db"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const backBtn =
document.getElementById("backBtn");

backBtn.addEventListener("click",()=>{

window.location.href="settings.html";

});

const searchToggle =
document.getElementById("searchToggle");

onAuthStateChanged(auth, async(user)=>{
    
if(!user)return;

const snap=await getDoc(

doc(
db,
"advancedSettings",
user.uid
)

);

if(snap.exists()){

searchToggle.checked=
snap.data().searchEnabled===true;

}

});

searchToggle.addEventListener("change",async()=>{

const user=auth.currentUser;

if(!user)return;

await setDoc(

doc(
db,
"advancedSettings",
user.uid
),

{

searchEnabled:
searchToggle.checked

},

{

merge:true

}

);

console.log("Saved:", searchToggle.checked);

const test = await getDoc(
    doc(db, "advancedSettings", user.uid)
);

console.log(test.data());

alert("Saved Successfully");

});