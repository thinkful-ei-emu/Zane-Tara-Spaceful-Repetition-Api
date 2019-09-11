const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      language: req.language,
      words
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  try {
    const words = await LanguageService.getWord(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      nextWord: words.original,
      totalScore: req.language.total_score,
      wordCorrectCount: words.correct_count,
      wordIncorrectCount: words.incorrect_count
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.route('/guess').post(jsonBodyParser, async (req, res, next) => {
  try{
    const { guess } = req.body;
    const data = await LanguageService.guess(req.app.get('db'), req.language.id, guess)
    console.log('data in router', data);
    res.json(data);
    next();
  }
  catch(error){
    next(error)

  }

    

});

module.exports = languageRouter;
