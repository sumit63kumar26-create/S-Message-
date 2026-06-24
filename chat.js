import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    setDoc,
    getDocs,
    getDoc,
    updateDoc,
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

const searchFriend =
document.getElementById("searchFriend");

const friendsCount =
    document.getElementById("friendsCount");

const friendsList =
    document.getElementById("friendsList");
    
    async function showDeleteMenu(friendName, friendUid){

    const ok = confirm(
        "Delete chat with " + friendName + "?"
    );

    if(!ok) return;

    const currentUser = auth.currentUser;

    const chatDocId =
        currentUser.uid + "_" + friendUid;

    try{

        await setDoc(
    doc(db, "userChats", chatDocId),
    {
        hiddenFor: [currentUser.uid],
        deletedAt:Date.now()
    },
    {
        merge: true
    }
);

        alert("Chat Deleted");

        loadFriends();

    }catch(error){

        alert(error.message);

    }

}
    
    let longPressTimer = null;

let longPressed = false;

async function loadFriends() {
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    const snapshot = await getDocs(
        collection(db, "friends")
    );
    
    friendsList.innerHTML = "";
    
    let count = 0;
    
    const friendDocs = snapshot.docs;

for (const friendDoc of friendDocs) {

    const friend = friendDoc.data();

    const friendDocId = friendDoc.id;

    let friendName = "";
    let targetUid = "";

    if (friend.user1Uid === currentUser.uid) {

        friendName = friend.user2Username;
        targetUid = friend.user2Uid;

    } else if (friend.user2Uid === currentUser.uid) {

        friendName = friend.user1Username;
        targetUid = friend.user1Uid;

    } else {

        continue;

    }

    const chatDocId1 =
    currentUser.uid + "_" + targetUid;

const chatDocId2 =
    targetUid + "_" + currentUser.uid;

const chatDoc1 = await getDoc(
    doc(db, "userChats", chatDocId1)
);

const chatDoc2 = await getDoc(
    doc(db, "userChats", chatDocId2)
);

const hidden1 =
    chatDoc1.exists() &&
    chatDoc1.data().hiddenFor &&
    chatDoc1.data().hiddenFor.includes(currentUser.uid);

const hidden2 =
    chatDoc2.exists() &&
    chatDoc2.data().hiddenFor &&
    chatDoc2.data().hiddenFor.includes(currentUser.uid);

if (hidden1 && hidden2) {
    continue;
}

    count++;
        
        const div = document.createElement("div");
        
        div.className = "friendCard";
        
        div.innerHTML = `
            <div class="profile">👤</div>

            <div class="info">
                <h4>${friendName}</h4>
                <p>Tap to start chatting</p>
            </div>
        `;
        
        div.addEventListener("touchstart", () => {

    longPressed = false;

longPressTimer = setTimeout(() => {

    longPressed = true;

    showDeleteMenu(friendName, targetUid);

}, 700);
});

div.addEventListener("touchend", () => {

    clearTimeout(longPressTimer);

});

div.addEventListener("click", () => {
    
    if (longPressed) {
        longPressed = false;
        return;
    }
    
    window.location.href =
        "chatroom.html?uid=" +
        encodeURIComponent(
            friend.user1Uid === currentUser.uid ?
            friend.user2Uid :
            friend.user1Uid
        );
    
});
        
        friendsList.appendChild(div);

}
    
    friendsCount.innerText =
        "Friends - " + count;
    
    if (count === 0) {
        
        friendsList.innerHTML = `
            <div class="friendCard">
                <div class="profile">👤</div>

                <div class="info">
                    <h4>No Friends</h4>
                    <p>Accept requests to start chatting</p>
                </div>
            </div>
        `;
        
    } 
  
  searchFriend.addEventListener("input", () => {

    const text =
    searchFriend.value
    .toLowerCase()
    .trim();

    const cards =
    document.querySelectorAll(".friendCard");

    cards.forEach((card)=>{

        const name =
        card.querySelector("h4")
        .innerText
        .toLowerCase();

        if(
            name.includes(text)
        ){

            card.style.display="flex";

        }else{

            card.style.display="none";

        }

    });

});  

}

onAuthStateChanged(auth, async (user) => {

    if (user) {

        const settingDoc = await getDoc(
            doc(
                db,
                "advancedSettings",
                user.uid
            )
        );

        if (
            settingDoc.exists() &&
            settingDoc.data().searchEnabled === false
        ) {

            document
            .getElementById("searchBox")
            .style.display = "none";

        }

        loadFriends();

    } else {

        window.location.href = "index.html";

    }

});
const homeNav =
    document.getElementById("homeNav");

const chatNav =
    document.getElementById("chatNav");

homeNav.addEventListener("click", () => {
    
    window.location.href = "home.html";
    
});

chatNav.addEventListener("click", () => {
    
    window.location.href = "chat.html";
    
});

const profileBtn =
document.getElementById("profileBtn");

profileBtn.addEventListener("click", () => {

    alert("Profile page is coming soon.");

});

const settingsBtn =
document.getElementById("settingsBtn");

settingsBtn.addEventListener("click", () => {

    window.location.href = "settings.html";

});