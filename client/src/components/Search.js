import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import "../style/search.css"
import Autocomplete from 'react-autocomplete';
import ClassInfo from './ClassInfo';

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: "",
            autocompleteData: [],
            selectedClass: null
        }

        //autocomplete functions
        this.onChange = this.onChange.bind(this);
        this.onSelect = this.onSelect.bind(this);
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

                fetch('/api/search?word=' + this.state.searchTerm, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            //successful
                            this.setState({
                                autocompleteData: data.result
                            });
                        } else {
                            //display error msg
                            console.log("Fail to search for autocomplete!")
                        }
                        var t1 = performance.now()
                        console.log("Autocomplete took " + (t1 - t0) + " milliseconds.")
                    })
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


    componentDidMount() {

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
                            inputProps={{ placeholder: "Enter a class", className: "search_input", ariaLlabel: "Search" }}
                            wrapperStyle={{ width: "100%" }}
                            wrapperProps={{ className: "searchbar" }}
                            placeholder="Enter a class"
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
                                    <p className="result_text"><span className="result_code">{item.id}</span> {item.title}</p>

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