# Convert Things to Falcor JSON Graph

This makes it easy to bring [Falcor](http://netflix.github.io/falcor/) into established projects, by transforming existing JSON REST responses into conformant [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) objects.

# Install

```
npm install json-graphify
```

# Example

```js
import graphify from 'json-graphify';

const convertUser = graphify({
  to: 'usersById',
  munge: [{
    select: [ 'avatar' ],
    edit: id => $ref(['mediaById', id])
  }],
  move: [{
    from: [ 'alter_ego' ],
    to: [ 'usersById', '$id' ]
  }]
});

const user = {
  id: '1',
  username: 'superman',
  avatar: '2',
  alter_ego: { id: '3', username: 'lexluthor' }
};

const jsong = convertUser.toGraph(user);

console.log(user);

// Output JSON Graph
{
  usersById: {
    1: {
      id: '1',
      username: 'superman',
      avatar: { $type: 'ref', value: [ 'mediaById' , '2' ] },
      alter_ego: { $type: 'ref', value: [ 'usersById' , '3' ] }
    },
    3: {
      id: '3',
      username: 'lexluthor'
    }
  }
}
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

  // these declarations describe arbitrary operations
  // on incoming JSON objects prior to being transformed
  // into graphs. See "munge objects" below for more
  // details.
  munge: [ ... ],

  // These declarations control the transformation
  // from the existing object structure to JSON graph.
  // See "move objects" below for more details.
  move: [ ... ]
});
```

## Move objects

An array of these are passed as an option to the factory method (see above).
A move object has the form `{ from, to }`.
`from` is a path from the root of the input object, which matches zero or more sub-roots in the object tree.
`to` is a path from the root of the output graph, pointing to those subtrees' new home.

```js
{
  // `$index` matches any positive integer, thus
  // if the incoming object has an `avatars` array,
  // this path will match every item in it.
  from: [ 'avatars', '$index' ],

  // `$id` will be replaced by the avatar object's
  // `id` attribute, creating an `mediaById` hash
  // in the output graph.
  to: [ 'mediaById', '$id' ]
}
```

## Munge objects

An array of these are passed as an option to the factory method (see above).
A munge object has the form `{ select, edit }`.
`select` is a path from the root of the input object, which matches zero or more sub-roots in the object tree.
`edit` is a function which operates on the found value.
Whatever `edit` returns becomes the new value.
If it returns `undefined`, the value is deleted.

```js
{
  // if the input object has an `avatar` property
  // this selector will match it.
  select: [ 'avatar' ],

  // the value of `inputObject.avatar` is passed to
  // this function, which converts it to a JSON
  // graph reference.
  edit: id => ({ $type: 'ref', value: [ 'mediaById', id ] })
}
```

## `convert.toPathValues()`

This converts an input object into an array of `{ path, value }` objects that can be returned from a Falcor router.

```js
const user = await fetchJson('/api/users/123');
const paths = convertUser.toPathValues(user);
return paths;
```

## `convert.toGraph()`

This converts an input object into a JSON graph that can be used to populate a Falcor model.

```js
const user = await fetchJson('/api/users/123');
const jsongFrag = convertUser.toGraph(user);
```

