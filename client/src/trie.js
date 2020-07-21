/**
 * A trie, also called digital tree or prefix tree, is a kind of search tree—an ordered tree 
 * data structure used to store a dynamic set or associative array where the keys are 
 * usually strings. Unlike a binary search tree, no node in the tree stores the 
 * key associated with that node; instead, its position in the tree defines the
 * key with which it is associated; i.e., the value of the key is distributed 
 * across the structure.
 * 
 * https://en.wikipedia.org/wiki/Trie
 */
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
  
    /**
     * Add a string and associated course to the trie. Recursive Implementation.
     * @param {The string to enter into the trie} string 
     * @param {The course where the string was taken from} course 
     */
    addWord(string, course) {
      const addWordHelper = (node, str, course) => {
        if (!node.children[str[0]]) {
          node.children[str[0]] = new TrieNode(str[0]);
          if (str.length === 1) {
            node.children[str[0]].endWord = 1;
            node.children[str[0]].courses.push(course)
          }
        } else {

          //have already hit this end-point in the trie before, so just add the course
          if(node.children[str[0]].courses.length > 0){
            node.children[str[0]].courses.push(course)
          }
        }
        if (str.length > 1) {
          addWordHelper(node.children[str[0]], str.slice(1), course);
        }
      };
      addWordHelper(this, string, course);
    }

    /**
     * Return all strings and their associated courses for a given prefix.
     * @param {The prefix of a string you are searching for} string 
     */
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
  }