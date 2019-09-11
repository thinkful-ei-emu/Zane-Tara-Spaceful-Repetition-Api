class LinkedList {
  setHead(word, db) {
    if (word.next) {
      return db('language')
        .update({ head: word.next })
        .where({ id: word.language_id });
    } else {
    }
  }

  insert(word, db) {
    let tempnode = word;
    let prevtempnode = null;

    for (let i = 0; i < tempnode.memory_value; i++) {
      prevtempnode = { ...tempnode };
      tempnode = db
        .from('word')
        .select('*')
        .where({ id: tempnode.next })
        .first();
    }

    return this.setHead(word, db)
      .then((res) => {
        return db('word')
          .where({ id: word.id })
          .update({ next: prevtempnode.next });
      })
      .then(() => {
        return db('word')
          .where({ id: prevtempnode.id })
          .update({ next: word.id });
      });
  }
}

const list = new LinkedList();

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id })
      // .then((words) => {
      //   words.sort((word1, word2) => word1.memory_score < word2.memory_score);
      //   words.forEach((word) => {
      //     list.insertFirst(word.id, word.memory_score);
      //   });
      // });
  },

  getWord(db, id) {
    let head = db
      .select('head')
      .from('language')
      .where({ id: id })
      .first();
    //return from word where id = languages.head
    return db
      .from('word')
      .select('original', 'correct_count', 'incorrect_count')
      .where({ id: head })
      .first();
  },

  guess(db, id, guess) {
    const list = new LinkedList();
    let head = db
      .select('head')
      .from('language')
      .where({ id: id })
      .first();
    let correct;
    return db
      .from('word')
      .select('*')
      .where({ id: head })
      .first()
      .then((word) => {
        if (guess === word.translation) {
          head.memory_value *= 2;
          correct = true;
          db('word')
            .increment('correct_count', 1)
            .where({ id: word.id })
            .then((res) => {
              db('language')
                .increment('total_score', 1)
                .where({ id: id });
            });
        } else {
          correct = false;
          db('word')
            .increment('incorrect_count', 1)
            .where({ id: word.id })
            .then((res) => {
              db('language')
                .increment('total_score', -1)
                .where({ id: id });
            });
        }
        return list.insert(word, db).then(() => {
          console.log('we inserted');
          return db
            .from('word')
            .where({ id: word.id })
            .select('correct_count', 'incorrect_count', 'translation')
            .first()
            .then((res) => {
              console.log('res', res);
              return {
                correctCount: res.correct_count
              };
            });
        });
      });
  }
};

// {
//   "nextWord": "test-next-word-from-generic-guess", //word
//   "wordCorrectCount": 777, word
//   "wordIncorrectCount": 777, word
//   "totalScore": 777, language
//   "answer": "test-answer-from-generic-guess", word
//   "isCorrect": true
// }

module.exports = LanguageService;
