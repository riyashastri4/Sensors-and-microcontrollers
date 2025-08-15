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

const ADMIN_PASSWORD = "bokunoheromomo"; // change this

function checkPassword() {
  const input = document.getElementById('password').value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById('password-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
  } else {
    alert("Wrong password!");
  }
}

function uploadPost() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const imageFile = document.getElementById('image').files[0];

  if (!title || !description || !imageFile) {
    alert("Please fill all fields.");
    return;
  }

  const storageRef = storage.ref('images/' + Date.now() + '_' + imageFile.name);
  storageRef.put(imageFile).then(snapshot => {
    snapshot.ref.getDownloadURL().then(url => {
      db.collection('posts').add({
        title: title,
        description: description,
        imageUrl: url,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        alert("Post uploaded!");
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('image').value = '';
      });
    });
  });
}
