class LinkedList {
  setHead(word,db){
    return db('language')
    .update({head:word.next})
    .where({id:word.language_id})
    
  }
  
  insert(word, db){
    let tempnode = word;
    let prevtempnode = null;

    while( tempnode !== null) {
        if(word.memory_value < tempnode.memory_value) {
          if(tempnode===word){
           break;
          }
          
          setHead(word,db)
         db('word')
         .update({next:prevtempnode.next})
         .where({id:word.id});
          db('word')
          .update({next:word.id})
          .where({id:prevtempnode.id})
         
          break;
        }

        else {
          let tempID=tempnode.id;
          prevtempnode = {...tempnode};
          //tempnode = tempnode.next
        //}
    //}

    // apple
    // [orange,cherry]
  
}
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
