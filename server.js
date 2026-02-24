require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route API pour valider le code secret
app.post('/api/validate-code', (req, res) => {
  const { code } = req.body;
  const secretCode = process.env.SECRET_CODE;

  if (!code) {
    return res.status(400).json({ 
      success: false, 
      message: 'Code requis' 
    });
  }

  if (code === secretCode) {
    return res.json({ 
      success: true, 
      message: 'Code correct !' 
    });
  } else {
    return res.json({ 
      success: false, 
      message: 'Code incorrect' 
    });
  }
});

// Route API pour envoyer un mail
app.post('/api/send-mail', async (req, res) => {
  const { mailTo, mailName, mailScore, mailMessage } = req.body;

  if (!mailTo || !mailTo.includes('@')) {
    return res.status(400).json({ success: false, error: 'Adresse email invalide.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 2px solid #2bee6c; border-radius: 16px; overflow: hidden;">
      <div style="background: #2bee6c; padding: 24px; text-align: center;">
        <h1 style="color: #102216; margin: 0; font-size: 28px;">🐦 Flappy Math Bird</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 18px; color: #1f2937;"><strong>${mailName}</strong> t'a partagé son score :</p>
        <div style="background: #f0fdf4; border: 2px dashed #2bee6c; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
          <span style="font-size: 56px; font-weight: 900; color: #102216;">${mailScore}</span>
          <p style="color: #6b7280; margin: 4px 0 0;">points</p>
        </div>
        <p style="color: #374151;">${mailMessage.replace(/\n/g, '<br>')}</p>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Essaie de le battre sur Flappy Math Bird !</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Flappy Math Bird" <${process.env.MAIL_USER}>`,
      to: mailTo,
      subject: `🐦 ${mailName} t'a envoyé son score Flappy Math Bird !`,
      html: htmlBody,
      text: `${mailName} a obtenu un score de ${mailScore}. ${mailMessage}`
    });
    res.json({ success: true, message: 'Mail envoyé avec succès !' });
  } catch (err) {
    console.error('Erreur mail:', err);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi : ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
