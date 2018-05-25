import React, { Component } from "react";
import { compose, graphql, withApollo } from "react-apollo";
import gql from "graphql-tag";

import logo from "./logo.svg";
import "./App.css";

const ServiceInfoFragment = gql`
  fragment ServiceInfo on Service {
    id
    name
    thumbnailUrl
    tags
    endpointUrl
    subscriptionEndpointUrl
    status
    lastChecked
    isSystem
  }
`;

const AllServicesQuery = gql`
  query {
    allServices {
      ...ServiceInfo
    }
  }
  ${ServiceInfoFragment}
`;

class App extends Component {
  render() {
    console.log("props", this.props);
    const { data } = this.props;

    const renderBody = () => {
      if (data.error) {
        return (
          <div className="Data-error">Error: {JSON.stringify(data.error)}</div>
        );
      }
      if (data.loading) {
        return <div className="Data-load">Loading...</div>;
      }

      const Item = props => {
        const { service } = props;
        return <li>{service.name}</li>;
      };

      return (
        <div>
          <p className="App-intro">Maana Services</p>
          <ul className="Service-list">
            {data.allServices.map(s => <Item key={s.id} service={s} />)}
          </ul>
        </div>
      );
    };

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Maana Q - React</h1>
        </header>
        {renderBody()}
      </div>
    );
  }
}

const enhancers = compose(graphql(AllServicesQuery), withApollo);
export default enhancers(App);
