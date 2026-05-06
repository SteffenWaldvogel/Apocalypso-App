/**
 * Claims GM role for a given email on the seeded campaign.
 * Usage: npx tsx scripts/claim-gm.ts <email> <password>
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB4M7j-TqKjYWYMtcql-QJfBFkVz4hPuYo",
  authDomain: "apocalypso-3fd48.firebaseapp.com",
  projectId: "apocalypso-3fd48",
  storageBucket: "apocalypso-3fd48.firebasestorage.app",
  messagingSenderId: "35956046402",
  appId: "1:35956046402:web:5ce31ca4ec8f1fddd70bdb",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

const email = process.argv[2] || "test@apocalypso.dev"
const password = process.argv[3] || "testpass123"
const campaignId = "apocalypso-sigmaringen"

async function claimGM() {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const uid = cred.user.uid
  console.log(`Logged in as ${email} (UID: ${uid})`)

  // Update campaign gmId
  await updateDoc(doc(db, `campaigns/${campaignId}`), { gmId: uid })
  console.log(`Set gmId to ${uid}`)

  // Add as GM member
  await setDoc(doc(db, `campaigns/${campaignId}/members/${uid}`), {
    userId: uid,
    role: "gm",
    displayName: email,
  })
  console.log(`Added as GM member`)

  console.log(`\nDone! Log in at: https://apocalypso-3fd48.web.app`)
  console.log(`Then go to: https://apocalypso-3fd48.web.app/campaign/${campaignId}`)
  process.exit(0)
}

claimGM().catch(console.error)
