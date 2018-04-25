import React from 'react';

class About extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
        
    }
  }

  componentDidMount() {
      //console.log('About Props', this.props);

  }

  componentWillReceiveProps(nextProps) {

     // console.log('next Props:', nextProps);
  }

  render() {
      return(
          <div className="container">
                <p>About Page...</p>
          </div>
        )
    }
}

export default About;
