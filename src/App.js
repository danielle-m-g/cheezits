import React, { Component } from "react";
import FileUpload from "./FileUpload";
import Graph from "./Graph";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [] 
    };
  }

  handleFileDataUpload = (json) => { 
    this.setState({ data: json });
  }

  render() {
    return (
      <div>
        <FileUpload setData={this.handleFileDataUpload}></FileUpload> 
        <div>
          <Graph csv_data={this.state.data}></Graph> 
        </div>
      </div>
    );
  }
}

export default App;
