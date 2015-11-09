# Convert Things to Falcor JSON Graph

This makes it easy to bring [Falcor](http://netflix.github.io/falcor/) into established projects, by transforming existing JSON REST responses into conformant [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) objects.

# Install

```
npm install json-graphify
```

# API Documentation

## Main factory function

This module exports a factory function which creates an object transformer based a set of declarative rules you provide.
The resultant converter is stateless, and can be kept in memory and endlessly re-used to transform JSON objects into conformant JSON graph fragments.
You can create a separate converter for each different type returned from your API.

```js
import graphify from 'json-graphify';

// Create an object that we can use to convert user
// objects returned from the "/api/users/{id}" endpoint
// into JSON graph output.
export default const convertUser = graphify({

  // Objects passed to this converter will
  // live in the top-level "usersById" hash
  // in the returned JSON graph.
  name: 'usersById',

  // Objects passed to this converter will
  // be assumed to have an "id" property.
  // Optional. Defaults to "id".
  idAttribute: 'id',

  // These declarations control the transformation
  // from the existing object structure to JSON graph.
  // See "pattern objects" below for more details.
  patterns: [ ... ]
});
```

## Pattern objects

An array of these are passed as an option to the factory method (see above).
A pattern object is an object with the shape `{ from, to }`.
`from` is a path (an array of strings) matching sub-roots found in incoming JSON objects.
`to` is another path pointing to the sub-root's new home in the resultant JSON graph.
Here's an example:

```js
{ from: ['avatar'], to: ['mediaById', '$id'] }
```

The above means *move the avatar sub-object to the `mediaById` hash in the graph, leaving a $ref in its place.*
In the above, `$id` is a special placeholder that's replaced by the actual id at conversion time.
If the avatar has an id property other than the usual "id", then you can add an `idAttribute` to the pattern to declare a custom id attribute.

```js
{ from: ['avatar'], to: ['mediaById', '$id'], idAttribute: 'media_id' }
```

For example of patterns in action, suppose your user objects have nested `avatar` properties like so:

```js
{
  id: '1',
  username: 'greim',
  email: 'greim@example.com',
  avatar: { id: '2', src: 'http://media.example.com/a45s3c.jpg' }
}
```

The `avatar` object was hydrated into the user response by the REST API server, but could also have been fetched directly from `/api/media/2`.
Thus it makes sense to move the avatar object to the top level and leave behind a $ref to it, which is exactly what the above pattern does.

The `from` path can also be adapted to handle arrays of things, using the special `$index` placeholder to match any positive integer.

```js
{ from: ['avatars','$index'], to: ['mediaById','$id'] }
```

## `convert.toPathValues()`

Usually you'll want to to turn a JSON object into an array of `{ path, value }` objects to be returned from a Falcor router, which is what this method does.

```js
const user = await fetchJson('/api/users/123');
const paths = convertUser.toPathValues(user);
return paths;
```

## `convert.toGraph()`

To turn a JSON object directly into a graph, pass your JSON object to the `toGraph()` method.
This might be useful for example in boostrapping a client-side Falcor Model cache.

```js
const user = await fetchJson('/api/users/123');
const jsongFrag = convertUser.toGraph(user);
```

# Conversion example

Let's look at a full example containing patterns, input JSON, and output JSON Graph all together.
Here's the converter and the patterns upon instantiation.

```js
// create a converter for user objects
const convertUser = graphify({
  name: 'usersById',
  patterns: [
    { from: ['nemesis'], to: ['usersById','$id'] },
    { from: ['avatars','$index'], to: ['mediaById','$id'] },
  ]
});
```

Here's the input JSON.
Normally this would be fetched from a server but we'll just create it with literals.

```js
// user object example
const user = {
  id: '1',
  username: 'greim',
  email: 'greim@example.com',
  avatars: [{
    id: '2',
    src: 'http://media.example.com/ac34df.jpg'
  }, {
    id: '3',
    src: 'http://media.example.com/92b347.jpg'
  }]
  nemesis: {
    id: '4',
    username: 'antigreim',
    email: 'antigreim@example.com'
  }
};
```

Now let's convert that to JSON graph using the rules declared above:

```js
// convert the user object to a graph
const jsongFrag = convertUser.toGraph(user);
console.log(jsongFrag);

// output
{
  usersById: {
    '1': {
      id: '1',
      username: 'greim',
      email: 'greim@example.com',
      avatars: {
        length: 2,
        0: { $type: 'ref', value: [ 'mediaById', '2' ] },
        1: { $type: 'ref', value: [ 'mediaById', '3' ] }
      }
      nemesis: { $type: 'ref', value: [ 'usersById', '4' ] }
    },
    '4': {
      id: '4',
      username: 'antigreim',
      email: 'antigreim@example.com'
    }
  },
  mediaById: {
    '2': {
      id: '2',
      src: 'http://media.example.com/ac34df.jpg'
    },
    '3': {
      id: '3',
      src: 'http://media.example.com/92b347.jpg'
    }
  }
}
```

# Example with Falcor Router

To use in a router, return the result of the `toPathValues()` method.

```js
// create a converter for users
const convertUser = graphify({
  name: 'users',
  patterns: [ ... ]
});

// create a falcor router
const MyRouter = FalcorRouter.createClass([{
  route: "users[{keys:ids}]",
  get: async function(pathSet) {
    const ids = pathSet.ids;
    const userPromises = ids.map(id => fetchJson(`/api/users/${id}`));
    const rawUsers = yield Promise.all(userPromises);
    return concat(rawUsers.map(convertUser.toPathValues)); // <-- conversion!
  }
}]);

// array concatenation util
function concat(arrs) {
  return arrs.reduce((a, b) => a.concat(b), []);
}
```

