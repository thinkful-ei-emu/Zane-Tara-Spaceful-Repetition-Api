class LinkedList {
  insert(word, db)
    //set languages.head = word.next;
    //let tempnode = word;
    //let prevtempnode = null;

    //(while tempnode !== null) {
        //if(word.mval < tempnode.mval) {
          //languages.head = word.next.id
          //word.next = prevtempnode.next;
          //prevtempnode.next = word.id
          //break;
        //}

        //else {
          //prevtempnode.id = tempnode.id;
          //tempnode.id = tempnode.next
        //}
    //}
  }


module.exports =  LinkedList;

const list = new LinkedList;

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
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
        'incorrect_count',
      )
      .where({ language_id })
      .then(words => {
        words.sort((word1, word2) => word1.memory_score < word2.memory_score);
        words.forEach(word => {
          list.insertFirst(word.id, word.memory_score)
        })
      })
  },

  getWord(db, id){
    const head = db.select('head').from('languages').where({id:id})
    //return from word where id = languages.head
    return db 
    .from('word')
    .select('original','correct_count','incorrect_count')
    .where({id: head})
    .first()

  },

  guess(db, id) {}

  //first: check if right or wrong
  //2: edit M value
  //loop through database until finding a larger m value, and place the item there
  //set languages.head = currentword.next.id
  //"apple"

}

module.exports = LanguageService
