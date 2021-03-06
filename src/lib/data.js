import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-boost';
import { createHttpLink } from "apollo-link-http";
import config from './config';
import { slide as trns } from "svelte/transition";

export const pagetrans = trns;

export const createClient = (fetch) => new ApolloClient({
  cache: new InMemoryCache,
  link: createHttpLink({
    fetch,
    // Using GET request for GraphQL queries so that ServiceWorker can fetch them
    useGETForQueries: true,
    uri: config.drupal_base_url + '/graphql',
  }),
});

export const FrontPageQuery = gql`
query FrontPage($limit: Int = 10, $offset: Int = 0) {
  nodeQuery(
    limit: $limit,
    offset: $offset,
    filter: {
      conditions: [
        {field: "status", operator:EQUAL, value:["1"]},
        {field: "promote", operator:EQUAL, value:["1"]}
      ]
    },
    sort: [
      {field: "sticky", direction: DESC},
      {field: "changed", direction: DESC}
    ]) {
    count
    entities {
      ... on NodeArticle {
        nid,
        created,
        changed,
        type {
          targetId
        },
        status,
        uid {
          entity {
            ... on User {
              uid,
              name,
              mail,
              userPicture {
                url
              }
            }
          }
        }
        title,
        body {
          format,
          processed,
          summaryProcessed
        }
        promote,
        sticky,
        path {
          alias
        }
      }
    }
  }
}
`;

export const NodeByPathQuery = gql`
query ArticleNodeByPath($path: String!) {
  route: route(path: $path) {
    ... on EntityCanonicalUrl {
      entity {
        ... on NodeArticle {
          created
          changed
          status
          title
          fieldImage {
            url
            width
            height
            alt
            title
            derivative(style:LARGE) {
              width
              height
              url
            }
          }
          fieldTags {
            entity {
              entityLabel
            }
          }
          body {
            format
            processed
            summaryProcessed
          }
          type {
            targetId
          }
          path {
            alias
          }
          uid {
            entity {
              ... on User {
                uid
                name
                mail
                created
                userPicture {
                  url
                  derivative(style:THUMBNAIL) {
                    width
                    height
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;


export function getUserURL(entity) {
  const path = entity.path && entity.path.alias || `/user/${entity.uid}`
  return config.drupal_base_url + path;
}

export function getNodeURL(entity) {
  const path = entity.path && entity.path.alias || `/node/${entity.nid}`
  return path;
}