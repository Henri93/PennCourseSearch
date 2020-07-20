import React from "react";
import "../style/search.css"
import Autocomplete from 'react-autocomplete';
import ClassInfo from './ClassInfo';
import Trie from '../../src/trie';

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: "",
            autocompleteData: [],
            selectedClass: null,
            courseCodeTrie: null,
            courseTitleTrie: null
        }

        //autocomplete functions
        this.onChange = this.onChange.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount() {
        var t0 = performance.now()
        fetch('/api/courses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    //successful
                    let tries = JSON.parse(data)

                    this.setState({
                        courseCodeTrie: Object.assign(new Trie, tries.courseCodeTrie),
                        courseTitleTrie: Object.assign(new Trie, tries.courseTitleTrie)
                    })
                    
                    // var courses = {}
                    // data.forEach((item, index) => {
                    //     if (index === 0) return 
                    //     courses[item[0]+item[1]] = {prefix: item[0], number: item[1], title: item[2], prefixTitle: item[3], description: JSON.parse(item[4])}
                    //     this.state.courseCodeTrie.addWord(item[0]+item[1], courses[item[0]+item[1]])
                        
                    //     item[2].toUpperCase().split(" ").forEach((titleWord, index) =>{
                    //         this.state.courseTitleTrie.addWord(titleWord, courses[item[0]+item[1]])
                    //     })
                    // });
                    // console.log(this.state.courseTitleTrie);
                    // this.setState({
                    //     courses: courses
                    // });
                } else {
                    //display error msg
                    console.log("Fail to get courses!")
                }
                var t1 = performance.now()
                console.log("Courses Download took " + (t1 - t0) + " milliseconds.")
            })
    }

    // invoked when the user types something. A delay of 200ms is
    // already provided to avoid DDoS'ing your own servers
    onChange(e) {
        this.setState({
            searchTerm: e.target.value
        }, () => {
            console.log("search " + this.state.searchTerm)

            //Handle the remote request for autocomplete
            if (this.state.searchTerm !== "" && this.state.searchTerm.length > 1) {

                var t0 = performance.now()
                var results = {}
                
                //search for course codes
                if(this.state.courseCodeTrie !== null){
                    let courseCodes, courses = this.state.courseCodeTrie.predictWord(this.state.searchTerm.toUpperCase());
                    
                    for (const code in courses){
                        let data = courses[code]
                        data['id'] = code
                        results[code] = (data)
                    }
                    
                }

                //search for course titles
                if(this.state.courseTitleTrie !== null){

                    let words, courses = this.state.courseTitleTrie.predictWord(this.state.searchTerm.toUpperCase());

                    for (const code in courses){
                        let data = courses[code]
                        data['id'] = code
                        results[code] = (data)
                    }
                    // this.state.courseTitleTrie.predictWord(this.state.searchTerm.toUpperCase()).forEach((item, index) => {
                    //     Object.values(this.state.courses).filter(obj => {
                    //         return obj.title.includes(item)
                    //     }).forEach((classByTitle, index) =>{
                    //         console.log(classByTitle)
                    //         let data = classByTitle
                    //         data['id'] = classByTitle.prefix + classByTitle.number
                    //         results.push(data)
                    //     })
                    //   });
                }

                //display nothing found if results are empty
                if(Object.keys(results).length === 0){
                    let data = {id: "", title: "No Class Found"}
                    results[""] = (data)
                }

                this.setState({
                    autocompleteData: Object.values(results)
                });
                var t1 = performance.now()
                console.log("Autocomplete took " + (t1 - t0) + " milliseconds.")
            }
        });



    }

    // called when the user clicks an option or hits enter
    onSelect(e) {
        let selected = this.state.autocompleteData.find(obj => {
            return obj.id === e
        })

        this.setState({
            selectedClass: selected,
            searchTerm: selected.id
        });

        // if(selected.type === "user"){
        // 	//send to profile page
        // 	this.props.history.push('/profile/'+selected.id);
        // }else{
        // 	//send to business page
        // 	this.props.history.push('/business/'+selected.id);
        // }

        return e;
    }

    render() {
        return (

            <div class="d-md-flex h-md-100 align-items-center">

                <div class="col-md-6 p-0 bg-indigo h-md-100">
                    <div class="text-white align-items-center h-100 p-4 text-center justify-content-center">
                        <div className="title">
                            <img src="android-chrome-512x512.png" alt="Penn Course Search" className="title-logo"></img>
                            <span className="title-text">enn Course Search</span>
                        </div>
                        <Autocomplete
                            inputProps={{ placeholder: "Enter a class, code, or keyword...", className: "search_input", ariaLlabel: "Search" }}
                            wrapperStyle={{ width: "100%" }}
                            wrapperProps={{ className: "searchbar" }}
                            placeholder="Enter a class, code, or keyword..."
                            getItemValue={item => item.id}
                            value={this.state.searchTerm}
                            items={this.state.autocompleteData}
                            onChange={this.onChange}
                            onSelect={this.onSelect}
                            renderMenu={(items, value, styles) => (
                                <div className="searchmenu align-items-center justify-content-center" children={items} />
                            )}

                            renderItem={(item, isHighlighted) => (
                                <div
                                    className={`searchmenu_item ${isHighlighted ? 'item-highlighted' : ''}`}
                                    key={item.id} >
                                    <p className="result_text"><span className="result_code">{item.prefix} {item.number}</span> {item.title}</p>

                                </div>
                            )}
                        />
                    </div>
                </div>

                <div class="col-md-6 p-0 h-md-100 loginarea">
                    <ClassInfo selectedClass={this.state.selectedClass} />
                </div>

            </div>
        );
    }
}

export default Search;