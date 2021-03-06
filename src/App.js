import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import './App.css';

import HomePage from './pages/homepage/homepage.component';
import ShopPage from './pages/shop/shop.component';
import SignInAndSignUpPage from './pages/sign-in-and-sign-up/sign-in-and-sign-up.component';
import CheckoutPage from './pages/checkout/checkout.component';

import Header from './components/header/header.component';
import { auth, createUserProfileDocument, /* addCollectionAndDocuments */ } from './firebase/firebase.utils';
import { setCurrentUser } from './redux/user/user.actions';

// Use reselect
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser } from './redux/user/user.selector';
// import { selectCollectionsForPreview } from './redux/shop/shop.selectors'

class App extends React.Component {
  unsubscribeFromAuth = null;

  componentDidMount() {
    // Usually fire off api call, but that's a one off. We don't want to remount the app. We just want to figure out when authentication is done.
    // That's an open subscription, we need to close subscriptions as well because we don't want any memory leaks in our JS

    // Get user authentication session persistence
    // Firebase keep track of all the session that is open. User persistence.
    // oAuth is hard to setup without firebase

    // Create User SESSIONS
    // Remember the user on the backend database, and also frontend, need to remember the user as he moves thru ecommerce website

    const { setCurrentUser, /* collectionsArray */ } = this.props;
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        // If there was a document there, get back.
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot((snapShot) => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data(),
          });
        });
      } else {
        setCurrentUser(userAuth);

        // DONE ONCE - did all this so we don't have to manually enter each collection and item into Firebase
        // addCollectionAndDocuments('collections', collectionsArray.map(({ title, items }) => ({ title, items })));
      }
    });
  }

  // Calling the unsubscribe function when the component is about to unmount - make sure we don't get memory leaks in our application related to listeners still being open even if the component that cares abotu the listener is no longer on the page.
  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render() {
    return (
      <div>
        <Header />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/shop" component={ShopPage} />
          <Route exact path="/checkout" component={CheckoutPage} />
          <Route
            exact
            path="/signin"
            render={() =>
              this.props.currentUser ? (
                <Redirect to="/" />
              ) : (
                  <SignInAndSignUpPage />
                )
            }
          />
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser,
  // collectionsArray: selectCollectionsForPreview
});

const mapDispatchToProps = (dispatch) => ({
  // Goes to a function that gets the user object, and calls dispatch.
  // What dispatch is? - It's a way for redux to know whatever you are passing me, it's going to be action object I will pass to everyone else
  setCurrentUser: (user) => dispatch(setCurrentUser(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
