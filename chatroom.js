import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    setDoc,
    limit
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

// DOM Elements
const friendName = document.getElementById("friendName");
const menuBtn =
document.getElementById("menuBtn");

const popupMenu =
document.getElementById("popupMenu");

const blockUserBtn =
document.getElementById("blockUserBtn");
const friendStatus = document.getElementById("friendStatus");
const backBtn = document.getElementById("backBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");

// URL Parameters
const params = new URLSearchParams(window.location.search);
const friendUid = params.get("uid");

let currentUid = null;

// Back button
backBtn.addEventListener("click", () => {
    window.location.href = "chat.html";
});

// Chat ID generator
function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
}

// Load friend info
function loadFriend() {

    if (!friendUid) return;

    onSnapshot(
        doc(db, "users", friendUid),
        (friendDoc) => {

            if (!friendDoc.exists()) return;

            const friend = friendDoc.data();

            friendName.innerText = friend.username;

            if (friend.online) {

                friendStatus.innerText = "🟢 Online";

            } else {

                if (friend.lastSeen) {

                    const time = new Date(friend.lastSeen);

                    friendStatus.innerText =
                        "Last seen " +
                        time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        });

                } else {

                    friendStatus.innerText = "Offline";

                }

            }

        }
    );

}

async function checkBlockStatus(){

    const currentUser = auth.currentUser;

    if(!currentUser) return false;

    // Kya maine is user ko block kiya hai?
    const iBlocked = await getDocs(
        query(
            collection(db,"blockedUsers"),
            where("blockerUid","==",currentUser.uid),
            where("blockedUid","==",friendUid),
            limit(1)
        )
    );

    if(!iBlocked.empty){

        blockUserBtn.innerText = "✅ Unblock User";
blockUserBtn.dataset.mode = "unblock";

        messageInput.disabled = true;
        sendBtn.disabled = true;

        messageInput.placeholder =
        "You blocked this user.";

        return true;

    }

    // Kya is user ne mujhe block kiya hai?
    const blockedMe = await getDocs(
        query(
            collection(db,"blockedUsers"),
            where("blockerUid","==",friendUid),
            where("blockedUid","==",currentUser.uid),
            limit(1)
        )
    );

    if(!blockedMe.empty){

        messageInput.disabled = true;
        sendBtn.disabled = true;

        messageInput.placeholder =
        "You are blocked.";

        return true;

    }
    
    blockUserBtn.innerText = "🚫 Block User";
blockUserBtn.dataset.mode = "block";

    return false;

}

menuBtn.addEventListener("click", (e)=>{

    e.stopPropagation();

    if(
        popupMenu.style.display==="block"
    ){

        popupMenu.style.display="none";

    }else{

        popupMenu.style.display="block";

    }

});

document.addEventListener("click",()=>{

    popupMenu.style.display="none";

});
blockUserBtn.addEventListener("click", async () => {
    
    if (blockUserBtn.dataset.mode === "unblock") {

    const currentUser = auth.currentUser;

    const snapshot = await getDocs(
        query(
            collection(db, "blockedUsers"),
            where("blockerUid", "==", currentUser.uid),
            where("blockedUid", "==", friendUid)
        )
    );

    if (!snapshot.empty) {

        await deleteDoc(
            doc(
                db,
                "blockedUsers",
                snapshot.docs[0].id
            )
        );

        alert("User Unblocked");

        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.placeholder = "Type a message";

        checkBlockStatus();

        return;
    }

}

    popupMenu.style.display = "none";
    
    const ok = confirm("Block this user?");
    
    if (!ok) return;
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    const alreadyBlocked = await getDocs(
        query(
            collection(db, "blockedUsers"),
            where("blockerUid", "==", currentUser.uid),
            where("blockedUid", "==", friendUid)
        )
    );
    
    if (!alreadyBlocked.empty) {
        alert("User already blocked.");
        return;
    }
    
    await addDoc(
    collection(db, "blockedUsers"),
    {
        blockerUid: currentUser.uid,
        blockedUid: friendUid,
        blockedUsername: friendName.innerText,
        blockedAt: Date.now()
    }
);
    
    alert("User Blocked Successfully.");
    
    window.location.href = "chat.html";
    
});

// Load messages
function loadMessages(chatId, userId) {

    let deletedAt = 0;

    const chatDocId = userId + "_" + friendUid;

    getDoc(
        doc(db, "userChats", chatDocId)
    ).then((chatDoc) => {

        if (
            chatDoc.exists() &&
            chatDoc.data().deletedAt
        ) {
            deletedAt = chatDoc.data().deletedAt;
        }

    });

    const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("timestamp")
    );

    onSnapshot(q, (snapshot) => {

        chatMessages.innerHTML = "";

        snapshot.forEach((docSnapshot) => {

            const msg = docSnapshot.data();

            if (msg.timestamp <= deletedAt) {
                return;
            }

            const messageId = docSnapshot.id;
            
            const time = new Date(msg.timestamp);
            const messageTime = time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
            
            const div = document.createElement("div");
            div.style.margin = "10px 0";
            
            if (msg.senderUid === userId) {
                div.style.textAlign = "right";
                div.innerHTML = `
                    <span style="
                        background:#2a2a2a;
                        color:white;
                        padding:10px 15px;
                        border-radius:18px;
                        display:inline-block;
                        max-width:75%;
                    ">
                        ${msg.message}
                        <br>
                        <small style="
                            display:block;
                            margin-top:5px;
                            opacity:0.7;
                            font-size:11px;
                        ">
                            ${messageTime}
                        </small>
                    </span>
                `;
                
                // Delete message on right-click
                div.addEventListener("contextmenu", async (e) => {
                    e.preventDefault();
                    const ok = confirm("Delete this message for everyone?");
                    
                    if (!ok) return;
                    
                    try {
                        await deleteDoc(doc(db, "messages", messageId));
                        alert("Message Deleted");
                    } catch (error) {
                        alert(error.message);
                    }
                });
            } else {
                div.style.textAlign = "left";
                div.innerHTML = `
                    <span style="
                        background:#0084ff;
                        color:white;
                        padding:10px 15px;
                        border-radius:18px;
                        display:inline-block;
                        max-width:75%;
                    ">
                        ${msg.message}
                        <br>
                        <small style="
                            display:block;
                            margin-top:5px;
                            opacity:0.7;
                            font-size:11px;
                        ">
                            ${messageTime}
                        </small>
                    </span>
                `;
            }
            
            chatMessages.appendChild(div);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    });
}

// Auth state handler
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUid = user.uid;
        
        await updateDoc(
    doc(db, "users", user.uid),
    {
        online: true
    }
);

        loadFriend();
        
        await checkBlockStatus();
        
        const chatId = getChatId(user.uid, friendUid);
        loadMessages(chatId, user.uid);
        
        // Send message (only attach listener once)
        sendBtn.addEventListener("click", async () => {
            const blocked = await checkBlockStatus();

if (blocked) {

    alert("You cannot send messages.");

    return;

}
            const text = messageInput.value.trim();
            if (!text) return;
            
            await addDoc(
                collection(db, "messages"),
                {
                    chatId: chatId,
                    senderUid: user.uid,
                    receiverUid: friendUid,
                    message: text,
                    timestamp: Date.now()
                }
            );
            
            const senderChatId =
    user.uid + "_" + friendUid;

const receiverChatId =
    friendUid + "_" + user.uid;

await setDoc(
    doc(db, "userChats", senderChatId),
    {
        hiddenFor: []
    },
    {
        merge: true
    }
);

await setDoc(
    doc(db, "userChats", receiverChatId),
    {
        hiddenFor: []
    },
    {
        merge: true
    }
);
            
            messageInput.value = "";
        });
    } else {
        window.location.href = "index.html";
    }
});

window.addEventListener("beforeunload", async () => {

    const user = auth.currentUser;

    if (!user) return;

    await updateDoc(
        doc(db, "users", user.uid),
        {
            online: false,
            lastSeen: Date.now()
        }
    );

});