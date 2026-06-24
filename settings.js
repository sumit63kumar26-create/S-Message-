import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
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

const friendsCount =
document.getElementById("friendsCount");

const blockedCount =
document.getElementById("blockedCount");

document
.getElementById("backBtn")
.addEventListener("click",()=>{

window.location.href="chat.html";

});

async function loadCounts() {
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    let friends = 0;
    
    const snapshot = await getDocs(
        collection(db, "friends")
    );
    
    snapshot.forEach((doc) => {
        
        const data = doc.data();
        
        if (
            data.user1Uid === currentUser.uid ||
            data.user2Uid === currentUser.uid
        ) {
            friends++;
        }
        
    });
    
    friendsCount.innerText = friends;
    
let blocked = 0;

const blockedSnapshot = await getDocs(
    collection(db, "blockedUsers")
);

blockedSnapshot.forEach((doc) => {
    
    const data = doc.data();
    
    if (data.blockerUid === currentUser.uid) {
        
        blocked++;
        
    }
    
});

blockedCount.innerText = blocked;    
}

document
.getElementById("friendsCard")
.addEventListener("click",()=>{

    window.location.href="friends.html";

});

document
.getElementById("blockedCard")
.addEventListener("click",()=>{

window.location.href="blocked.html";
});

document
.getElementById("notificationCard")
.addEventListener("click",()=>{

alert("Notifications Coming Soon");

});

document
.getElementById("advancedCard")
.addEventListener("click",()=>{

window.location.href="advanced.html";
});

document
.getElementById("aboutCard")
.addEventListener("click",()=>{

window.location.href = "about.html";
});

document
.getElementById("logoutBtn")
.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="index.html";

});

onAuthStateChanged(auth, (user) => {

    if (user) {

        loadCounts();

    } else {

        window.location.href = "index.html";

    }

});