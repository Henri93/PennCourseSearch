import React from "react";
import "../style/class.css"

export default class ClassInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        // check that the selected class has all proper fields
        const hasClass = this.props.selectedClass !== null;
        const hasTitle = hasClass && this.props.selectedClass.title && this.props.selectedClass.title !== "";
        const hasId = hasClass && this.props.selectedClass.id && this.props.selectedClass.id !== "";
        const hasPrefixTitle = hasClass && this.props.selectedClass.prefixTitle && this.props.selectedClass.prefixTitle !== "";
        const hasDescription = hasClass && this.props.selectedClass.description && this.props.selectedClass.description !== null;
        var descriptionList = hasDescription ? this.props.selectedClass.description : [];
        
        return (
            <div className="align-items-center h-md-100 p-5 justify-content-center">
                
                <div className="class_title d-md-flex ">{hasTitle && hasId ? this.props.selectedClass.title : ""}</div>
                <div className="class_code d-md-flex ">{hasId ? this.props.selectedClass.id : ""}</div>
                <div className="class_category d-md-flex ">{hasPrefixTitle ? this.props.selectedClass.prefixTitle : ""}</div>

                <div className="class_description">

                {descriptionList.map(function(name, index){
                    return <div className="class_description_item d-md-flex" key={ index }>{name}</div>;
                })}
                </div>

                <a className="class_review d-md-flex" href={hasId ? 'https://penncoursereview.com/course/'+this.props.selectedClass.prefix+'-'+this.props.selectedClass.number : "#"}>
                {hasId ? "Penn Course Review" : ""}
                </a>

                
            </div>

        );
    }
}