const admin = require('firebase-admin');
const fs = require('fs');

try {
  let serviceAccount = null;
  if (fs.existsSync('./firebase-service-account.json')) {
    serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));
    console.log('Read service account file successfully');
  } else {
    console.error('firebase-service-account.json not found!');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  console.log('Initialized admin SDK successfully');

  // Try to read/write a test doc
  const docRef = db.collection('test_connection').doc('test_doc');
  docRef.set({ testedAt: new Date().toISOString(), status: 'working' })
    .then(() => {
      console.log('✅ Firestore WRITE SUCCESSFUL!');
      return docRef.get();
    })
    .then(doc => {
      console.log('✅ Firestore READ SUCCESSFUL! Data:', doc.data());
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Firestore read/write failed:');
      console.error(err);
      process.exit(1);
    });
} catch (e) {
  console.error('❌ Initialization failed:');
  console.error(e);
  process.exit(1);
}
