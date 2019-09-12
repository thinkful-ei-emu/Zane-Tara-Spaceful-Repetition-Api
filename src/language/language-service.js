class LinkedList {
  setHead(word, db) {
    if (word.next) {
      return db("language")
        .update({ head: word.next })
        .where({ id: word.language_id });
    }
  }

  async insert(word, db) {
    await this.setHead(word, db);
    let tempnode = word;
    let prevtempnode = null;

    for (let i = 0; i <= word.memory_value; i++) {
      if (tempnode.next) {
        prevtempnode = { ...tempnode };
        tempnode = await db
          .from("word")
          .select("*")
          .where({ id: tempnode.next })
          .first();
      } else {
        prevtempnode = { ...tempnode };
        break;
      }
    }

    return db("word")
      .where({ id: word.id })
      .update({ next: prevtempnode.next })

      .then(() => {
        return db("word")
          .where({ id: prevtempnode.id })
          .update({ next: word.id });
      });
  }
}

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  getWord(db, id) {
    let head = db
      .select("head")
      .from("language")
      .where({ id: id })
      .first();
    //return from word where id = languages.head
    return db
      .from("word")
      .select("*")
      .where({ id: head })
      .first();
  },

  async guess(db, id, guess) {
    const word = await this.getWord(db, id);
    //If the word is correct move the word back in the list by multiples of two exe 2,4,8
    if (guess === word.translation) {
      const newMem = word.memory_value * 2;
      correct = true;
      return db("word")
        .increment("correct_count", 1)
        .where({ id: word.id })
        .then(() => {
          return db("language")
            .increment("total_score", 1)
            .where({ id: id });
        })
        .then(() => {
          return db("word")
            .update({ memory_value: newMem })
            .where({ id: word.id });
        })
        .then(() => this.shift(db, id, correct));
    }
    //otherwise we reset the mem_value to 1 and move it back one space in the list.
    else {
      const newMem = 1;
      correct = false;
      return db("word")
        .increment("incorrect_count", 1)
        .where({ id: word.id })
        .then(() => {
          return db("word")
            .update({ memory_value: newMem })
            .where({ id: word.id });
        })
        .then(() => this.shift(db, id, correct));
    }
  },
// this shifts the location of the items within the List adjusting their next pointers to appropriate places.
  async shift(db, id, correct) {
    const list = new LinkedList();
    const word = await this.getWord(db, id);
    return list.insert(word, db).then(() => {
      return db
        .from("word")
        .where({ id: word.id })
        .select("correct_count", "incorrect_count", "translation")
        .first()
        .then(res => {
          return {
            wordCorrectCount: res.correct_count,
            wordIncorrectCount: res.incorrect_count,
            answer: res.translation,
            isCorrect: correct
          };
        });
    });
  }
};

module.exports = LanguageService;
