const { AccessToken } = require('livekit-server-sdk');

const ROOM_NAME = 'visioclasse';
const MAX_NAME_LENGTH = 60;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, private');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, TEACHER_ACCESS_CODE } = process.env;
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !TEACHER_ACCESS_CODE) {
    return res.status(500).json({ error: 'Configuration LiveKit/Vercel incomplète.' });
  }

  const body = req.body || {};
  const role = body.role;
  const room = body.room;
  const displayName = typeof body.name === 'string' ? body.name.trim().slice(0, MAX_NAME_LENGTH) : '';
  if (room !== ROOM_NAME || !displayName || !['teacher', 'student'].includes(role)) {
    return res.status(400).json({ error: 'Paramètres de connexion invalides.' });
  }

  if (role === 'teacher' && (typeof body.teacherCode !== 'string' || body.teacherCode !== TEACHER_ACCESS_CODE)) {
    return res.status(403).json({ error: 'Code d’accès professeur incorrect.' });
  }

  // The teacher identity is reserved, preventing students from claiming teacher privileges.
  const identity = role === 'teacher' ? 'professeur' :
    (typeof body.identity === 'string' ? body.identity.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');
  if (!identity || (role === 'student' && identity === 'professeur')) {
    return res.status(400).json({ error: 'Identité de participant invalide.' });
  }

  try {
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: displayName,
      ttl: '15m',
    });
    token.addGrant({
      roomJoin: true,
      room: ROOM_NAME,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    return res.status(200).json({ url: LIVEKIT_URL, token: await token.toJwt() });
  } catch (error) {
    console.error('LiveKit token generation failed:', error);
    return res.status(500).json({ error: 'Échec de la génération du jeton LiveKit.' });
  }
};
