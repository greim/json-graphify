# Convert Things to Falcor JSON Graph


This makes it easy to bring Falcor into non-greenfield projects by transforming objects obtained from pre-existing JSON REST APIs into conformant JSON graph objects.

# Install

```
npm install json-graphify
```

# API Documentation

## Main factory function

This module exports a factory function which creates custom converters based on options you pass to it.
You can then use a converter to transform JSON objects to conformant JSON graphs.
Typically, you'd create separate converters for every different type of object returned from your API.

```js
import converter from 'json-graphify';

// Create an object that we can use to convert user
// objects returned from the "/api/users/{id}" endpoint
// into JSON graph output.
export default const convertUser = converter({

  // Objects passed to this converter will
  // live in the top-level "usersById" hash
  // in the returned JSON graph.
  name: 'usersById',

  // Objects passed to this converter will
  // be assumed to have an "id" property.
  // Optional. Defaults to "id".
  idProp: 'id',

  // These declarative patterns control the
  // transformation from the existing object
  // structure to JSON graph. See "pattern objects"
  // below for more details.
  patterns: [ ... ]
});
```

## Pattern objects

A pattern object is an object with the shape `{ from, to }`.
`from` is a path (an array of strings) matching things found in JSON objects that will be converted.
`to` is a corresponding path of where to place the thing in the resultant JSON graph.
Here's an example:

```js
{ from: ['avatar'], to: ['media', '$id'] }
```

The above means *take the avatar sub-object and move it to the top-level `media` hash in the graph, leaving a $ref in its place.*
In the above, `$id` is a special placeholder that will be replaced by the actual id at conversion time.
For example, suppose your user objects have nested `avatar` properties like so:

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

Now, what if instead of a singular `avatar`, we have an array of `avatars`?
In that case we change our pattern to this:

```js
{ from: ['avatars','$index'], to: ['mediaById','$id'] }
```

`$index` is a special placeholder value which matches any array index, AKA positive integer.

## `convert.toGraph()`

To turn a JSON object into a graph, pass your JSON object to the `toGraph()` method.

```js
const user = await fetchJson('/api/users/123');
const jsongFrag = convertUser.toGraph(user);
```

## `convert.toPaths()`

More often you'll want to to turn a JSON object into an array of `{ path, value }` objects to be returned from a Falcor router, which is what the `toPaths()` method does.

```js
const user = await fetchJson('/api/users/123');
const paths = convertUser.toPaths(user);
return paths;
```

# Conversion example

Let's look at a full example contain a set of patterns, input JSON, and output JSON graph all together.
Here's the converter and the patterns upon instantiation.

```js
const convertUser = converter({
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

```js
const MyRouter = FalcorRouter.createClass([{
  route: "users[{keys:ids}]",
  get: async function(pathSet) {
    const ids = pathSet.ids;
    const userPromises = ids.map(id => fetchJson(`/api/users/${id}`));
    const rawUsers = yield Promise.all(userPromises);
    return concat(rawUsers.map(convertUser.toPaths));
  }
}]);

function concat(arrs) {
  return arrs.reduce((a, b) => a.concat(b), []);
}
```

