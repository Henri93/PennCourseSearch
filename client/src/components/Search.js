import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import "../style/search.css"
import Autocomplete from 'react-autocomplete';

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
        });

        console.log("search " + this.state.searchTerm)
        //Handle the remote request
        if (this.state.searchTerm !== "" && this.state.searchTerm.length > 1) {

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
                        console.log(data.result)
                        this.setState({
                            autocompleteData: data.result
                        });
                    } else {
                        //display error msg
                        console.log("Fail to search for autocomplete!")
                    }
                })
        }
    }

    // called when the user clicks an option or hits enter
    onSelect(e) {
        let selected = this.state.autocompleteData.find(obj => {
            return obj.id === e
        })

        this.setState({
            selectedClass: selected
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
                    <div class="text-white align-items-center h-100 p-5 text-center justify-content-center">
                    <span className="title-text">Penn Course Search</span>
                    <Autocomplete
                                inputProps={{ placeholder: "Enter a class", className: "search_input", ariaLlabel: "Search"}}
                                wrapperStyle={{width: "100%"}}
                                wrapperProps={{className: "searchbar"}}
                                placeholder="Enter a class"
                                getItemValue={item => item.id}
                                value={this.state.searchTerm}
                                items={this.state.autocompleteData}
                                onChange={this.onChange}
                                onSelect={this.onSelect}
                                menuStyle={{backgroundColor: "transparent", position: "relative", height: "100%", overflowY: "scroll", left: "0px", top: "10px", padding: "10px", maxHeight: "450px"}}
                                renderItem={(item, isHighlighted) => (
                                    <div
                                        style={{ "fontSize": "1.3rem", "cursor": "grab", "color": "#4a4a4a", "textAlign":"left" }}
                                        className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
                                        key={item.id} >
                                        {/* <p className="typeIcon">{item.type.toUpperCase()[0]}</p> */}
                                        <p className="resultText">{item.id}:{item.title}</p>

                                    </div>
                                )}
                            />
                    </div>
                </div>

                <div class="col-md-6 p-0 h-md-100 loginarea">
                    <div class="d-md-flex align-items-center h-md-100 p-5 justify-content-center">
                    {this.state.selectedClass !== null ?  this.state.selectedClass.title : ""}
                    <br></br>
                    {this.state.selectedClass !== null ?  this.state.selectedClass.description : ""}
                        
                </div>
                </div>

            </div>
        );
    }
}

export default Search;