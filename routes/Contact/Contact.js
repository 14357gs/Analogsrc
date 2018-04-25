import React from 'react';

class Contact extends React.Component {

    constructor (props) {
      super(props);
      this.state = {

      }
    }

    componentDidMount() {
        //console.log('Contact View Props', this.props);

    }

    componentWillReceiveProps(nextProps) {

        console.log('next Props:', nextProps);
    }
  render() {
      return(
          <div className="container">
                <p>Contact Page...</p>
          </div>
        )
    }
}

export default Contact;
