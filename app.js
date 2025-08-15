const firebaseConfig = {
  apiKey: "AIzaSyBgr4yFrnxNBxxRlsvcg_iocMNrWTQebgc",
  authDomain: "sensors-and-microcontrollers.firebaseapp.com",
  projectId: "sensors-and-microcontrollers",
  storageBucket: "sensors-and-microcontrollers.firebasestorage.app",
  messagingSenderId: "828861970951",
  appId: "1:828861970951:web:d037f5c8883c538ae348a2",
  measurementId: "G-FY2C840CJM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const postsContainer = document.getElementById('posts');

db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
  postsContainer.innerHTML = '';
  snapshot.forEach(doc => {
    const post = doc.data();
    postsContainer.innerHTML += `
      <div class="post">
        <img src="${post.imageUrl}" alt="Post image">
        <h2>${post.title}</h2>
        <p>${post.description}</p>
      </div>
    `;
  });
});
