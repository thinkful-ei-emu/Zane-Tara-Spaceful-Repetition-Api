const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    res.json({nextWord: 'manzana',
      totalScore: 10,
      wordCorrectCount: 2,
      wordIncorrectCount: 2})
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    const guess = req.body;
    (guess==="apple" ? res.json({
      "nextWord": "queso",
      "wordCorrectCount": 3,
      "wordIncorrectCount": 2,
      "totalScore": 11,
      "answer": "apple",
      "isCorrect": true
    }) :
    res.json({
      "nextWord": "queso",
      "wordCorrectCount": 3,
      "wordIncorrectCount": 2,
      "totalScore": 11,
      "answer": "apple",
      "isCorrect": false
    }))
    
  })

module.exports = languageRouter
