require('dotenv').config();
const express = require('express');
const path = require('path');

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

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
