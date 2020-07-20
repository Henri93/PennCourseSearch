import React from "react";
import "../style/search.css"
import Autocomplete from 'react-autocomplete';
import Loader from 'react-promise-loader';
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
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
            courseTitleTrie: null,
            documents: {},
            idf: {}
        }

        //autocomplete functions
        this.onChange = this.onChange.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.autocompleteSearch = this.autocompleteSearch.bind(this);
    }

    componentDidMount() {
        var t0 = performance.now()

        trackPromise(fetch('/api/courses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    //successful
                    let course_data = JSON.parse(data)

                    this.setState({
                        courseCodeTrie: Object.assign(new Trie, course_data.courseCodeTrie),
                        courseTitleTrie: Object.assign(new Trie, course_data.courseTitleTrie),
                        documents: course_data.documents,
                        idf: course_data.idf
                    })
                } else {
                    //display error msg
                    console.log("Fail to get courses!")
                }
                var t1 = performance.now()
                console.log("Courses Download took " + (t1 - t0) + " milliseconds.")
            }))
    }

    autocompleteSearch() {
        var results = {}

        //search by course codes
        if (this.state.courseCodeTrie !== null) {
            let courseCodes, courses = this.state.courseCodeTrie.predictWord(this.state.searchTerm.toUpperCase());
            for (const code in courses) {
                let data = courses[code]
                data['id'] = code
                data['strength'] = 1000000
                results[code] = (data)
            }
        }

        //search by course titles
        if (this.state.courseTitleTrie !== null) {
            let words, courses = this.state.courseTitleTrie.predictWord(this.state.searchTerm.toUpperCase());
            for (const code in courses) {
                let data = courses[code]
                data['id'] = code
                data['strength'] = 1000000
                results[code] = (data)
            }
        }

        //TF-IDF Calculations
        //TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document).
        //IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
        var tf_idf_scores = {}
        if (this.state.searchTerm.toUpperCase() in this.state.idf) {
            //Object.keys(documents).length = total number of documents
            let total_documents = Object.keys(this.state.documents).length
            let idf_score = Math.log(total_documents / this.state.idf[this.state.searchTerm.toUpperCase()])
            for (const course in this.state.documents) {
                if (course in results) {
                    continue
                }
                //documents[document][term] = (Number of times term t appears in a document)
                //Object.keys(documents[document]).length = (Total number of terms in the document)
                let tf = this.state.documents[course][this.state.searchTerm.toUpperCase()] / Object.keys(this.state.documents[course]).length
                let tf_idf = tf * idf_score
                if (tf_idf > 0.05) {
                    tf_idf_scores[course] = tf_idf
                }
            }
        }

        //search by tf-idf
        for (const course in tf_idf_scores) {
            if (this.state.courseCodeTrie !== null) {
                let courseCodes, courses = this.state.courseCodeTrie.predictWord(course);
                for (const code in courses) {
                    let data = courses[code]
                    data['id'] = code
                    data['strength'] = tf_idf_scores[course]
                    results[code] = (data)
                }
            }
        }

        //display nothing found if results are empty
        if (Object.keys(results).length === 0) {
            let data = { id: "", title: "No Class Found" }
            results[""] = (data)
        }

        return Object.values(results)
    }

    // invoked when the user types something. A delay of 200ms is
    // already provided to avoid DDoS'ing your own servers
    onChange(e) {
        this.setState({
            searchTerm: e.target.value
        }, () => {
            //Handle the remote request for autocomplete
            if (this.state.searchTerm !== "" && this.state.searchTerm.length > 1) {

                var t0 = performance.now()
                let autocompleteResults = this.autocompleteSearch()
                this.setState({
                    autocompleteData: autocompleteResults
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
                        promiseInProgress &&

                        <div
                            style={{
                                width: "100%",
                                height: "100",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Loader promiseTracker={usePromiseTracker} />
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
                            sortItems={(a, b) => {
                                return b['strength'] - a['strength']
                            }}
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