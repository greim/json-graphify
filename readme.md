# Convert Existing JSON Objects to Falcor JSON Graph

This utility makes it easy wrap pre-existing JSON REST APIs with Falcor.
Particularly, when JSON responses contain nested sub-resources that you want to pull out and put at the top level of the graph.

## Creating a converter

You create a converter once and keep it around in memory, re-using it to transfor JSON responses to your desired graph format.

```js
import createConverter from 'convert-to-jsong';

// Create an object that we can use to convert user
// objects returned from the "/api/users/{id}" endpoint
// into JSON graph output.
const userConverter = createConverter({

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
  // structure to JSON graph. More details below.
  patterns: [ ... ]
});
```

## Using a converter

To use a converter, simply pass your JSON object to its `convert()` method.

```js
const user = await fetchJson('/api/users/123');
const jsonGraphFragment = userConverter.toGraph(userObject);
// return jsonGraphFragment from a Falcor router
```

## Patterns in depth

Suppose your user objects have nested `avatar` properties like so:

```js
{
  id: '1',
  username: 'greim',
  email: 'greim@example.com',
  avatar: { id: '2', src: 'http://media.example.com/a45s3c.jpg' }
}
```

The `avatar` object was hydrated into the user response by the REST API server, but could also have been fetched directly from `/api/media/2`.
Classic resource nesting problem which is solved by JSON graph.
But we need to construct a pattern to pull it out and place it into the graph.
Here's the pattern:

```js
{ from: ['avatar'], to: ['mediaById','$id'] }
```

`from` and `to` are both paths.
`$id` is a special placeholder which will be substituted with the actual id at conversion time.

But what if instead of a singular `avatar`, we have an array of `avatars`?
In that case we change our pattern to:

```js
{ from: ['avatars','$index'], to: ['mediaById','$id'] }
```

`$index` is once again a special placeholder value which matches any positive integer (i.e. an array index).

## Conversion example

Let's look at a full example contain a set of patterns, input JSON, and output JSON graph all together.
Here's the converter and the patterns upon instantiation.

```js
const userConverter = createConverter({
  name: 'usersById',
  patterns: [
    { from: ['nemesis'], to: ['usersById','$id'] },
    { from: ['avatars','$index'], to: ['mediaById','$id'] },
  ]
});
```

Here's the input JSON.
Normally this would be fetched from a server but we'll just create it with object literals.

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
const jsonGraphFragment = userConverter.toGraph(user);
console.log(jsonGraphFragment);

// output
{
  usersById: {
    '1': {
      id: '1',
      username: 'greim',
      email: 'greim@example.com',
      avatars: [
        { $type: 'ref', value: [ 'mediaById', '2' ] },
        { $type: 'ref', value: [ 'mediaById', '3' ] }
      ]
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



