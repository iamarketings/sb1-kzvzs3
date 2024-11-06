import express from 'express';
import { User } from '../models/User.js';
import { Chatbot } from '../models/Chatbot.js';

export const router = express.Router();

// Middleware d'authentification
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes principales
router.get('/', (req, res) => {
  res.render('home', { 
    user: req.session.user, 
    path: req.path,
    error: null 
  });
});

// Route de test pour le chatbot juridique
router.get('/test-juridique', (req, res) => {
  res.render('test-juridique', { 
    user: req.session.user,
    path: req.path,
    error: null
  });
});

router.get('/services', (req, res) => {
  res.render('services', { 
    user: req.session.user, 
    path: req.path,
    error: null 
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', { 
    user: req.session.user, 
    path: req.path,
    error: null 
  });
});

// Routes d'authentification
router.get('/login', (req, res) => {
  res.render('login', { 
    error: null, 
    path: req.path 
  });
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user && await User.comparePassword(req.body.password, user.password)) {
      req.session.user = { id: user.id, username: user.username };
      res.redirect('/dashboard');
    } else {
      res.render('login', { 
        error: 'Email ou mot de passe incorrect', 
        path: req.path 
      });
    }
  } catch (error) {
    res.render('login', { 
      error: 'Une erreur est survenue', 
      path: req.path 
    });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { 
    error: null, 
    path: req.path 
  });
});

router.post('/register', async (req, res) => {
  try {
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    res.redirect('/login');
  } catch (error) {
    res.render('register', { 
      error: 'Erreur lors de l\'inscription', 
      path: req.path 
    });
  }
});

// Routes du dashboard et des chatbots
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const chatbots = await Chatbot.findByUserId(req.session.user.id);
    res.render('dashboard', { 
      user: req.session.user, 
      chatbots,
      path: req.path,
      error: null
    });
  } catch (error) {
    res.render('dashboard', { 
      user: req.session.user, 
      chatbots: [],
      error: 'Erreur lors du chargement des chatbots',
      path: req.path 
    });
  }
});

router.get('/chatbot/new', isAuthenticated, (req, res) => {
  res.render('chatbot/create', { 
    user: req.session.user,
    path: req.path,
    error: null
  });
});

router.post('/chatbot/create', isAuthenticated, async (req, res) => {
  try {
    const settings = {
      usage_type: req.body.usage_type,
      profile_type: req.body.profile_type,
      data_source: req.body.data_source,
      integration_type: req.body.integration_type,
      flowiseId: req.body.flowiseId,
      flowiseHost: req.body.flowiseHost
    };

    await Chatbot.create({
      userId: req.session.user.id,
      name: `Chatbot ${req.body.profile_type}`,
      description: `Assistant ${req.body.profile_type}`,
      settings: JSON.stringify(settings)
    });
    res.redirect('/dashboard');
  } catch (error) {
    res.render('chatbot/create', { 
      user: req.session.user,
      error: 'Erreur lors de la création du chatbot',
      path: req.path 
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});