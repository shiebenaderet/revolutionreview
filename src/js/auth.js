// ==================== FIREBASE AUTHENTICATION MODULE ====================
// Handles Google Sign-In and user authentication using Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcs3faklAleGoGj3O2I0nD2vpS6CEELqs",
    authDomain: "revolutionary-war-study-tool.firebaseapp.com",
    projectId: "revolutionary-war-study-tool",
    storageBucket: "revolutionary-war-study-tool.firebasestorage.app",
    messagingSenderId: "932389606367",
    appId: "1:932389606367:web:4dd9414f4c99bb4846aa6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Current user state
let currentUser = null;
let authStateCallback = null;

/**
 * Initialize authentication
 * Sets up auth state listener and UI
 * @returns {void}
 */
export function initAuth() {
    console.log('🔐 Firebase Auth initialized');

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateAuthUI(user);

        // Call callback if registered
        if (authStateCallback && user) {
            authStateCallback(user);
        }

        if (user) {
            console.log('✅ User signed in:', user.email);
        } else {
            console.log('👤 No user signed in');
        }
    });
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} User credential
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log('✅ Signed in successfully:', user.email);

        // Create/update user profile in Firestore
        await createUserProfile(user);

        return user;
    } catch (error) {
        console.error('❌ Sign-in error:', error);
        alert('Failed to sign in: ' + error.message);
        throw error;
    }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        currentUser = null;
        console.log('👋 User signed out');
        alert('Successfully signed out!');
    } catch (error) {
        console.error('❌ Sign-out error:', error);
        alert('Failed to sign out: ' + error.message);
    }
}

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is signed in
 */
export function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Register callback for auth state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {void}
 */
export function onAuthChange(callback) {
    authStateCallback = callback;
}

/**
 * Create or update user profile in Firestore
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
async function createUserProfile(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user profile
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
            console.log('✨ User profile created');
        } else {
            // Update last login
            await setDoc(userRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
            console.log('🔄 User profile updated');
        }
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
    }
}

/**
 * Update authentication UI
 * @param {Object|null} user - Firebase user object or null
 * @returns {void}
 */
function updateAuthUI(user) {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (user) {
        // User is signed in
        authContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <img src="${user.photoURL}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #667eea;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${user.displayName}</div>
                    <div style="font-size: 0.85em; color: #666;">${user.email}</div>
                </div>
                <button class="btn btn-secondary" onclick="signOutUser()" style="padding: 8px 16px; font-size: 0.9em;">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        `;
    } else {
        // User is signed out
        authContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                <i class="fas fa-cloud" style="font-size: 3em; margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">Sign In to Save Your Progress</h3>
                <p style="margin-bottom: 20px; opacity: 0.9;">Sign in with your Google account to sync your progress across devices and keep your data safe in the cloud!</p>
                <button class="btn btn-primary" onclick="signInUser()" style="background: white; color: #667eea; font-size: 1.1em; padding: 12px 30px; display: inline-flex; align-items: center; gap: 10px;">
                    <i class="fab fa-google"></i> Sign In with Google
                </button>
                <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
                    <i class="fas fa-lock"></i> Secure authentication powered by Google
                </div>
            </div>
        `;
    }
}

/**
 * Get Firestore database instance
 * @returns {Object} Firestore database
 */
export function getDatabase() {
    return db;
}

/**
 * Get current user's Firestore document reference
 * @returns {Object|null} Document reference or null if not authenticated
 */
export function getUserDocRef() {
    if (!currentUser) return null;
    return doc(db, 'users', currentUser.uid);
}
