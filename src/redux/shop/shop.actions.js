import ShopActionTypes from './shop.types';
import { firestore, convertCollectionsSnapshotToMap } from '../../firebase/firebase.utils';

// action === javascript object
// THUNKS: action creator that turns a function to get the dispatch, similar to mapDispatchToProps
// Instead of creating an action (function) that returns an action object
// NOW, we will use a function that returns a function that gets ACCESS TO dispatch...it can fire multiple actions

export const fetchCollectionsStart = () => ({
  type: ShopActionTypes.FETCH_COLLECTIONS_START,
});

export const fetchCollectionsSuccess = collectionsMap => ({
  type: ShopActionTypes.FETCH_COLLECTIONS_SUCCESS,
  payload: collectionsMap
})

export const fetchCollectionsFailure = errorMessage => ({
  type: ShopActionTypes.FETCH_COLLECTIONS_FAILURE,
  payload: errorMessage
})

// Can handle multiple actions, handle async code inside of it. 
// Purpose of thunks
// returns a function which can now dispatch multiple actions which in turns allows us to handle asychronous activities inside an action instead of our component
// Might have multiple components that might need this data. Components don't worry about it, because data will inside the reducer
// How actions influences the state of howe we store this is fetching state on our reducer

// THUNK allows us to use DISPATCH
export const fetchCollectionsStartAsync = () => {
  return dispatch => {
    const collectionRef = firestore.collection('collections');
    dispatch(fetchCollectionsStart());

    collectionRef.get().then((snapshot) => {
      const collectionsMap = convertCollectionsSnapshotToMap(snapshot);
      dispatch(fetchCollectionsSuccess(collectionsMap))
    }).catch(error => dispatch(fetchCollectionsFailure(error.message)));
  }
}

    // Live firebase style of passing updates, authStateChanges actually work

    // Using a fetch, but it's deeply nested, not worth
    // fetch(
    //   'https://firestore.googleapis.com/v1/projects/crwn-db-8c07f/databases/(default)/documents/collections'
    // )
    //   .then((response) => response.json())
    //   .then((collections) => console.log(collections));

    // Using onSnapshot from FIREBASE
    // collectionRef.onSnapshot(async (snapshot) => {
    //   console.log('----- COLLECTION REF SNAPSHOT -----', snapshot);
    //   const collectionsMap = convertCollectionsSnapshotToMap(snapshot);
    //   console.log(collectionsMap);

    //   // Has data of when the data is finished loading
    //   // When data comes back, it is good to render the page

    //   updateCollections(collectionsMap);
    //   this.setState({ loading: false });
    // });