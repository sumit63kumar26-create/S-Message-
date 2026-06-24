import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
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

const blockedList =
    document.getElementById("blockedList");

document
    .getElementById("backBtn")
    .addEventListener("click", () => {
        
        window.location.href = "settings.html";
        
    });

async function loadBlockedUsers() {
    
    const currentUser =
        auth.currentUser;
    
    if (!currentUser) return;
    
    blockedList.innerHTML = "";
    
    const snapshot =
        await getDocs(
            
            query(
                
                collection(db, "blockedUsers"),
                
                where(
                    "blockerUid",
                    "==",
                    currentUser.uid
                )
                
            )
            
        );
blockedCount.innerText = snapshot.size;

    if (snapshot.empty) {
        
        blockedList.innerHTML = `
        <p style="
        color:gray;
        text-align:center;
        margin-top:40px;
        ">
        No Blocked Users
        </p>
        `;
        
        return;
        
    }
    
    snapshot.forEach((docSnap) => {
        
        const data =
            docSnap.data();
        
        const div =
            document.createElement("div");
        
        div.className = "userCard";
        
        div.innerHTML = `

       <span>${data.blockedUsername}</span>

        <button class="unblockBtn">

        Unblock

        </button>

        `;
        
        div
            .querySelector(".unblockBtn")
            .addEventListener("click", async () => {
                
                const ok =
                    confirm("Unblock this user?");
                
                if (!ok) return;
                
                await deleteDoc(
                    
                    doc(
                        db,
                        "blockedUsers",
                        docSnap.id
                    )
                    
                );
                
                alert("User Unblocked");
                
                loadBlockedUsers();
                
            });
        
        blockedList.appendChild(div);
        
    });
    
}

onAuthStateChanged(auth, (user) => {
    
    if (user) {
        
        loadBlockedUsers();
        
    } else {
        
        window.location.href = "index.html";
        
    }
    
});