class TrieNode {
    constructor(value) {
      this.children = {};
      this.endWord = null;
      this.value = value;
      this.courses = [];
    }
}

export default class Trie extends TrieNode {
    constructor() {
      super(null);
    }
  
    addWord(string, course) {
      const addWordHelper = (node, str, course) => {
        if (!node.children[str[0]]) {
          node.children[str[0]] = new TrieNode(str[0]);
          if (str.length === 1) {
            node.children[str[0]].endWord = 1;
            node.children[str[0]].courses.push(course)
          }
        } else {
  
        }
        if (str.length > 1) {
          addWordHelper(node.children[str[0]], str.slice(1), course);
        }
      };
      addWordHelper(this, string, course);
    }

    predictWord(string) {
        var getRemainingTree = function(string, tree) {
          var node = tree;

          while (string && string !== "") {
            if(typeof node === 'undefined'){
              break
            }
            node = node.children[string[0]];
            string = string.substr(1);
          }
          return node;
        };
    
        var allWords = [];
        var allCourses = {};
        
        var allWordsHelper = function(stringSoFar, tree) {
          for (let k in tree.children) {
            const child = tree.children[k]
            var newString = stringSoFar + child.value;
            if (child.endWord) {
              allWords.push(newString);

              child.courses.forEach((course, index) =>{
                allCourses[course.prefix+course.number] = course
              })
            }
            allWordsHelper(newString, child);
          }
        };
    
        var remainingTree = getRemainingTree(string, this);
        if (remainingTree) {
          allWordsHelper(string, remainingTree);
          
          //if entire term being searched is entered, also add it
          if(remainingTree.endWord){
            allWords.push(string);

            remainingTree.courses.forEach((course, index) =>{
              allCourses[course.prefix+course.number] = course
            })
          }
        }
    
        return allWords, allCourses;
    }
    
      logAllWords() {
        console.log('------ ALL WORDS IN PREFIX TREE -----------')
        console.log(this.predictWord(''));
      }
  }