import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

// apollo imports
import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";
import { setContext } from "apollo-link-context";

const uri = process.env.REACT_APP_MAANA_ENDPOINT;
console.log("uri", uri);

const token = process.env.REACT_APP_MAANA_AUTH_TOKEN;
console.log("token", token);

//
// Client setup
// - allow this service to be a client of a remote service
//

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

const httpLink = createHttpLink({ uri, fetch });

// Now that subscriptions are managed through RabbitMQ, WebSocket transport is no longer needed
// as it is not production-ready and causes both lost and duplicate events.
const link = token ? authLink.concat(httpLink) : httpLink;

const client = new ApolloClient({
  link,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__)
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

registerServiceWorker();
