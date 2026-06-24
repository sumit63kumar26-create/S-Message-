import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
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

const friendsList =
document.getElementById("friendsList");

document
.getElementById("backBtn")
.addEventListener("click",()=>{

    window.location.href="settings.html";

});

async function loadFriends(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;

    friendsList.innerHTML="";

    let count = 0;

    const snapshot = await getDocs(
        collection(db,"friends")
    );

    snapshot.forEach((doc)=>{

        const data = doc.data();

        let friendName="";

        if(data.user1Uid===currentUser.uid){

            friendName=data.user2Username;

        }else if(data.user2Uid===currentUser.uid){

            friendName=data.user1Username;

        }else{

            return;

        }

        count++;

        const div=document.createElement("div");

        div.className="friendCard";

        div.innerHTML=`

<div class="friendName">

${friendName}

</div>

`;

        friendsList.appendChild(div);

    });

    friendsCount.innerText=count;

    if(count===0){

        friendsList.innerHTML=`

<div class="empty">

No Friends

</div>

`;

    }

}

onAuthStateChanged(auth,(user)=>{

    if(user){

        loadFriends();

    }else{

        window.location.href="index.html";

    }

});