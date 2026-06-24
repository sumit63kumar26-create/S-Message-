import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc as firestoreDoc,
  getDoc,
  deleteDoc,
updateDoc
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
const db = getFirestore(app);
const auth = getAuth(app);

async function loadRequests(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;

    const q = query(
        collection(db, "requests"),
        where(
            "receiverUid",
            "==",
            currentUser.uid
        ),
        where("status", "==", "pending")
    );

    const snapshot =
        await getDocs(q);
        
        alert("Requests Found: " + snapshot.size);

    requestList.innerHTML = "";

    let count = 0;

    snapshot.forEach((doc) => {

        const request = doc.data();
        const requestId = doc.id;

        count++;

        const div =
            document.createElement("div");

        div.className = "card";

div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>${request.senderUsername || "Unknown User"}</span>

        <div>
            <button class="acceptBtn">Accept</button>
            <button class="rejectBtn">Reject</button>
        </div>
    </div>
`;

const acceptBtn = div.querySelector(".acceptBtn");
const rejectBtn = div.querySelector(".rejectBtn");

acceptBtn.addEventListener("click", async () => {

    await updateDoc(
        firestoreDoc(db, "requests", requestId),
        {
            status: "accepted"
        }
    );
    
    await addDoc(
    collection(db, "friends"),
    {
        user1Uid: request.senderUid,
        user1Username: request.senderUsername,

        user2Uid: request.receiverUid,
        user2Username: request.receiverUsername,

        createdAt: Date.now()
    }
);

    alert("Accepted: " + request.senderUsername);

    loadRequests();
});

rejectBtn.addEventListener("click", async () => {
    
    await deleteDoc(
        firestoreDoc(db, "requests", requestId)
    );
    
    alert("Rejected: " + request.senderUsername);
    
    loadRequests();
});

        requestList.appendChild(div);

    });

    requestCount.innerText =
        "Requested - " + count;

    if(count === 0){

        requestList.innerHTML =
            `<div class="card">
                No Requests
            </div>`;

    }

}

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const requestCount =
    document.getElementById("requestCount");

const requestList =
    document.getElementById("requestList");

searchBtn.addEventListener("click", async () => {
  
  const searchText =
    searchInput.value.toLowerCase().trim();
  
  searchResults.innerHTML = "";
  
  if (!searchText) {
    alert("Enter username");
    return;
  }
  
  const snapshot =
    await getDocs(collection(db, "users"));
  
  let found = false;
  
  snapshot.forEach((doc) => {
    
    const user = doc.data();
    
    if (
      user.username
      .toLowerCase()
      .includes(searchText)
    ) {
      
      found = true;
      
      const div =
        document.createElement("div");
      
      div.className = "card";
      
      div.innerHTML = `
    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
    ">
        <span>${user.username}</span>

        <button class="sendRequestBtn">
            Send Request
        </button>
    </div>
`;
      
      searchResults.appendChild(div);

const sendBtn =
    div.querySelector(".sendRequestBtn");

sendBtn.addEventListener("click", async () => {

    const currentUser = auth.currentUser;

    if(!currentUser){
        alert("Please login again");
        return;
    }
    
    let currentUserData;

try {

    const currentUserDoc = await getDoc(
        firestoreDoc(db, "users", currentUser.uid)
    );

    currentUserData =
        currentUserDoc.data();
        
        const friendCheck = await getDocs(
    query(
        collection(db, "friends"),
        where("user1Uid", "in", [currentUser.uid, user.uid])
    )
);

let alreadyFriend = false;

friendCheck.forEach((doc) => {

    const data = doc.data();

    if (
        (data.user1Uid === currentUser.uid &&
         data.user2Uid === user.uid) ||

        (data.user1Uid === user.uid &&
         data.user2Uid === currentUser.uid)
    ) {
        alreadyFriend = true;
    }

});

if (alreadyFriend) {

    alert("This user is already your friend.");

    return;

}

} catch(error) {

    alert(error.message);
    return;

}

const requestCheck = await getDocs(
    query(
        collection(db, "requests"),
        where("senderUid", "==", currentUser.uid),
        where("receiverUid", "==", user.uid),
        where("status", "==", "pending")
    )
);

if (!requestCheck.empty) {

    alert("Friend request already sent.");

    return;

}

const blockCheck = await getDocs(
    collection(db, "blockedUsers")
);

let blockedByUser = false;
let youBlockedUser = false;

blockCheck.forEach((doc) => {

    const data = doc.data();

    if (
        data.blockerUid === user.uid &&
        data.blockedUid === currentUser.uid
    ) {
        blockedByUser = true;
    }

    if (
        data.blockerUid === currentUser.uid &&
        data.blockedUid === user.uid
    ) {
        youBlockedUser = true;
    }

});

if (blockedByUser) {

    alert("You're blocked by this user.");

    return;

}

if (youBlockedUser) {

    alert("You have blocked this user.");

    return;

}

    await addDoc(
    collection(db, "requests"),
    {
        senderUid: currentUser.uid,
        senderUsername:
    currentUserData.username,

        receiverUid: user.uid,
        receiverUsername: user.username,

        status: "pending",
        createdAt: Date.now()
    }
);

    alert(
        "Request sent to " +
        user.username
    );

});
    }
    
  });
  
  if (!found) {
    
    searchResults.innerHTML =
      `<div class="card">
            No Results Found
        </div>`;
    
  }
  
});

onAuthStateChanged(auth, (user) => {

    if(user){

        loadRequests();

    }

});

const homeNav =
    document.getElementById("homeNav");

const chatNav =
    document.getElementById("chatNav");

homeNav.addEventListener("click", () => {

    // Already Home Page
    return;

});

chatNav.addEventListener("click", () => {

    window.location.href = "chat.html";

});