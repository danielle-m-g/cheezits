import React,{ Component } from "react";

class FileUpload extends Component{
  constructor(props) {
    super(props);
    this.state = {input: null };
  }

  upload = (event) =>{
    event.preventDefault();
    const { input} = this.state;

    if (input){
      const f = new FileReader();
      f.onload = (e) => {
        const jsonData =JSON.parse(e.target.result);
          this.props.setData(jsonData);
      };
      f.readAsText(input);
    }
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 15 }}>
        <h2>Upload a JSON File</h2>
        <form onSubmit={this.upload}>
          <input
            type="file"
            accept=".json"
            onChange={(event) => this.setState({ input: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
