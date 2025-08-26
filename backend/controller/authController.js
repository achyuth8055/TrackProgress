import { OAuth2Client } from 'google-auth-library';
import { auth } from '../config/firebase.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { idToken } = req.body; // Assume frontend sends Google ID token
  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Use Firebase Admin to create/get user
    const userRecord = await auth.getUserByEmail(payload.email);
    // Or create if not exists: await auth.createUser({ email: payload.email, ... });

    res.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};