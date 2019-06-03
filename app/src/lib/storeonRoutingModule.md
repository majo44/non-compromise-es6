### Overview
Asynchronous routing for storeon, which:
* allows **async** route handlers for prefetch the data or lazy loading of modules
* support for **abort** the routing if there was some navigation cancel eg. by fast clicking on pagination
* allows **update** routing definition in fly (eg, when you are loading some self module lazy which should add self controlled routes).
* **ignores** same routes navigation

This code is decoupled from browser history or UI code. 
Examples on integration you can find in examples.

###Sizes
* es5/commonjs is 9,41 kB , 
* es2017(async/await)/esm  is 5.21 kB,

There is a room for have a smaller size, after few renamings and removing description form symbol, es2017/esm version will be ~4kB


###Api
- `storeonRoutingModule `- is storeon module which contains the whole logic of routing
- `onNavigate(store, route, callback) ` - function which registers route callback, on provided store for provided route (path regexp). Callback is a function which will be called if route will be matched, can returns undefined or promise. In case of promise, route will be not applied (navigation will be not ended) until  the promise will be not resolve, callback is also taking the [abortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), to be notified that current processing navigation was cancelled.  Important think is that last registered handle have a higher priority, so if at the end you will register handle for route '', that handle will catch all navigations
- `navigate(store, url, [replace], [force])` - function which triggers navigation to particular url
- `cancelNavigation(store)` - function which cancel current navigation (if there is any in progress)

###Flow
1. user registers the handles by usage of `onNavigate` (can do this in stereon module, but within the @init callback),

    1.1 for each registered handle we generating unique `id`,
     
    1.2 cache the handle under that `id`, and dispatch `route register` event with provided route and handle `id`     

2. on `route register` we are storing in state provided route and id (at the top of stack)
3. on `navigate` event 

    3.1. we checking exit conditions (same route, or same route navigation in progres),
     
    3.2. if there is any ongoing navigation we are dispatch `navigation cancel` event
    
    3.3. then we are setting the `next` navigation in state,
    
    3.4. asynchronously dispatch `before navigation` event
    
4.  on `before navigation` event 

    4.1 we are looking in state for handle `id` which route matches requested url, by the matched `id` we are taking the
handle from cache,

    4.2. we creates AbortController from which we are taking the AbortSignal, 
    
    4.3. we attach to storeon handle for `navigation canceled` event to call `cancell` on AbortController 
    
    4.4. we call handle with details of navigation and abortSignal, if the result of handle call is Promise, we are waits to 
resolve, 

    4.5 we are dispatch `navigation end` event, and unregister `navigation canceled` handle

5. on `navigation canceled` we are clear the `next` navigation in state
6. on `navigation end` we move `next` to `current` ins state

###Examples

##### Creating the store with router module 
```javascript
import createStore from 'storeon';
import { storeonRoutingModule } from '@storeon/async-router';

// create store with adding route module
const store = createStore([storeonRoutingModule]);

// register some route handle
onNavigate(store, '/home', () => {
    console.log('home page');
});

// in any point of application we can call navigate
navigate(store, '/home');

// and at the end get the current route (eg for conditions in UI
store.get().routing.current.route; // => '/home'
```

##### Redirection
```javascript
import createStore from 'storeon';
import { storeonRoutingModule, onNavigate, navigate } from '@storeon/async-router';

// create store with adding route module
const store = createStore([storeonRoutingModule]);

// register route for any route and in handle navigate to other path
onNavigate(store, '', () => {
    navigate(store, '/404')
});  
``` 

##### Async route handle
###### Preloading the data
```javascript
import createStore from 'storeon';
import { storeonRoutingModule, onNavigate, navigate } from '@storeon/async-router';
 // create store with adding route module
const store = createStore([storeonRoutingModule]);

// register route for some page, where in handle we will fetch the data 
onNavigate(store, '/home', async (navigation, abortSignal) => {
    // retrieve the data from server
    const homeContent = await fetch('myapi/home.json');
    // check that navigation was not cancelled
    if (!abortSignal.aborted) {
        // set the data to state by event 
        store.dispatch('home data loaded', homeContent);    
    }
});  
``` 

###### Lazy loading of submodule
```javascript    
// app.js
import createStore from 'storeon';
import { storeonRoutingModule, onNavigate, navigate } from '@storeon/async-router';

// create store with adding route module
const store = createStore([storeonRoutingModule]);
// register the navigation to admin page, but keeps reference to unregister function
const unRegister = onNavigate(store, '/admin', async (navigation, abortSignal) => {
    // preload some lazy module
    const adminModule = await import('./lazy/adminModule.js');
    // check that navigation was not cancelled
    if (!abortSignal.aborted) {
        // unregister app level route handle for that route
        // the lazy module will take by self control over the internal routing 
        unRegister();
        // init module, here we will register event handlers on storeon in lazy loaded module 
        adminModule.adminModule(store);
        // navigate once again (with force flag) to trigger the route handle from lazy loaded module 
        navigate(store, navigation.url, false, true);
    }
});
```

```javascript    
// ./lazy/adminModule.js
import { onNavigate } from '@storeon/async-router';

/**
 * @param {*} store
 */
export function adminModule(store) {
    // registering own routing handler
    onNavigate(store, '/admin', async () => {
        console.log('ADMIN');
    });
}
```





