import {database, auth, Googleprovider, Facebookprovider, Twitterprovider, storage} from '../../../config/firebase_config';
import {success, error} from 'react-notification-system-redux';
import ActionTypes from './auth_action_types.js';
import firebase from 'firebase';
const notificationOpts = {
    title: 'Sample Notification',
    message: '',
    position: 'tr',
    autoDismiss: 3
};

const fetchUserRolesInternal = (uid) => {
    return new Promise((resolve, reject) => {
        database.ref('/roles/' + uid).once("value", snapshot => {
            resolve(snapshot.val());
        }).catch((error) => {
            reject(error);
        });
    });
};

const setUserLastLoggedInTime = (uid) => {
    if (uid) {
        database.ref('/roles/' + uid).update({
            lastLoggedInOn: firebase.database.ServerValue.TIMESTAMP
        });
    }
};

/**
 * Fetch Users Actions
 **/
let fetchUsersRequestedAction = () => {
    return {type: ActionTypes.fetchUsersRequested};
};

let fetchUsersRejectedAction = () => {
    return {type: ActionTypes.fetchUsersRejected};
};

let fetchUsersFulfilledAction = (payload) => {
    return {type: ActionTypes.fetchUsersFulfilled, payload};
};

export const fetchUsers = (params) => {
    return dispatch => {
        dispatch(fetchUsersRequestedAction());
        let promise;
        if (params)
        {
            promise = database.ref('/users/' + params);
        } else {
            promise = database.ref('users');
        }
        promise.on('value', snapshot => {
            dispatch(fetchUsersFulfilledAction(snapshot.val()));
        })
        return promise;
    };
};


/**
 * Login actions
 */

const loginRequestedAction = () => {
    return {type: ActionTypes.loginRequested};
}
const loginRejectedAction = (error) => {
    return {type: ActionTypes.loginRejected, payload: error};
}
const loginFulfilledAction = (user) => {
    return {type: ActionTypes.loginFulfilled, payload: user};
}

/**
 * Log in user based on provided user/pass
 * @param {*} user
 * @param {*} pass
 */
export const login = (user, pass) => {
    return dispatch => {
        dispatch(loginRequestedAction());
        const promise = auth().signInWithEmailAndPassword(user, pass);
        promise.then((user) => {
            const uid = user.uid || user.user.uid;
            setUserLastLoggedInTime(uid);
            dispatch(loginFulfilledAction(user));
        })
                .catch((error) => {
                    dispatch(loginRejectedAction(error));
                });
        return promise;
    };
};

/**
 * Register actions
 */

const registerRequestedAction = () => {
    return {type: ActionTypes.registerRequested};
}
const registerRejectedAction = (error) => {
    return {type: ActionTypes.registerRejected, payload: error};
}
const registerFulfilledAction = (user) => {
    return {type: ActionTypes.registerFulfilled, payload: user};
}
const sendEmailVerification = (user) => {
    return {type: ActionTypes.sendEmailVerification, payload: user};
}
/**
 * Register user based on provided user/pass
 * @param {*} user
 * @param {*} pass
 */
export const register = (params) => {
    const {email, password, username} = params;
    delete params.confirm_password;
    delete params.password;
    return dispatch => {
        dispatch(registerRequestedAction());
        const promise = auth().createUserWithEmailAndPassword(email, password);
        promise.then((user) => {
            database.ref('users').child(user.uid).child('profile').update({...params});
            user.updateProfile({displayName: username});
            dispatch(registerFulfilledAction(user));
        })
                .catch((error) => {
                    dispatch(registerRejectedAction(error));
                });
        return promise;
    };
};



/**
 * Social Log in user based on provided user/pass
 * @param {*} user
 * @param {*} pass
 */

export const socialLogin = (provider) => {
    return dispatch => {
        dispatch(loginRequestedAction());
        let promise;
        if (provider === 'google') {
            promise = auth().signInWithPopup(Googleprovider);
        } else if (provider === 'facebook') {
            promise = auth().signInWithPopup(Facebookprovider);
        } else if (provider === 'twitter') {
            promise = auth().signInWithPopup(Twitterprovider);
        }
        promise.then((user) => {
            const uid = user.uid || user.user.uid;
            setUserLastLoggedInTime(uid);
            dispatch(loginFulfilledAction(user.user || user));
        })
                .catch((error) => {
                    dispatch(loginRejectedAction(error));
                });
        return promise;
    };
};



/**
 * On load of Authentical HOC check for auth status, if already logged in allow access
 */
export const checkAuthStatus = () => {
    return dispatch => {
        dispatch(loginRequestedAction());
        const promise = new Promise(function (resolve, reject) {
            const unsubscribe = auth().onAuthStateChanged((user) => {
                if (user) {
                    resolve(user);
                    dispatch(loginFulfilledAction(user));
                } else {
                    dispatch(loginRejectedAction());
                    reject();
                }
                unsubscribe();
            });
        });
        return promise;
    };
}

/**
 * Logout actions
 */

const logoutRequestedAction = () => {
    return {type: ActionTypes.logoutRequested};
}
const logoutRejectedAction = () => {
    return {type: ActionTypes.logoutRejected};
}
const logoutFulfilledAction = () => {
    return {type: ActionTypes.logoutFulfilled};
}

export const logout = () => {
    return dispatch => {
        dispatch(logoutRequestedAction());
        const promise = auth().signOut();
        promise.then((user) => {
            dispatch(logoutFulfilledAction(user));
        })
                .catch((error) => {
                    dispatch(logoutRejectedAction());
                });
        return promise;
    };
};


/**
 * Save Profile Image Actions
 **/
const saveProfileImageRequestedAction = () => {
    return {type: ActionTypes.saveProfileImageRequested};
}

const  saveProfileImageRejectedAction = () => {
    return {type: ActionTypes.saveProfileImageRejected}
}

const saveProfileImageProgressAction = (payload) => {
    return {type: ActionTypes.saveProfileImageProgress, payload};
}

const saveProfileImageFulfilledAction = (payload) => {
    return {type: ActionTypes.saveProfileImageFulfilled, payload};
}

export const saveProfileImage = (params) => {
    const key = params.id;
    const name = params.name;
    const imageRef = storage.ref('images/' + key + '/' + name);
    return dispatch => {
        dispatch(saveProfileImageRequestedAction());
        const imageUploadPromise = imageRef.put(params.file);
        imageUploadPromise.on('state_changed', (snapshot) => {
            dispatch(saveProfileImageProgressAction(snapshot));
        });
        imageUploadPromise.then((snapshot) => {
            const currentUser = auth().currentUser;
            currentUser.updateProfile({photoURL: snapshot.downloadURL});
            database.ref('users').child(currentUser.uid).child('photoURL').set(snapshot.downloadURL);
            dispatch(saveProfileImageFulfilledAction(key));
        }).catch((err) => {
            dispatch(saveProfileImageRejectedAction(key));
        });
        return imageUploadPromise;
    }
};

/**
 * Delete profile Image Actions
 **/
function deleteProfileImageRequestedAction() {
    return {type: ActionTypes.deleteProfileImageRequested};
}

function deleteProfileImageRejectedAction() {
    return {type: ActionTypes.deleteProfileImageRejected}
}

function deleteProfileImageFulfilledAction(payload) {
    return {type: ActionTypes.deleteProfileImageFulfilled, payload};
}

export function deleteProfileImage(params) {
    const currentUser = auth().currentUser;
    const key = currentUser.uid;
    const imageRef = storage.ref('images/' + key);
    const usersRef = database.ref('/users/' + key + '/photoURL');
    return dispatch => {
        dispatch(deleteProfileImageRequestedAction());
        var promise = new Promise(function (resolve, reject) {
            const deleteImage = usersRef.set('');
            deleteImage.then((user) => {
                currentUser.updateProfile({photoURL: ""});
            });
        });
    }
}

/**
 * Show growl notification
 *
 * @returns
 */
export const showNotification = (title, message, fail) => {
    return dispatch => {
        if (fail) {
            dispatch(error({
                ...notificationOpts,
                title: title || "Success",
                message
            }));
        } else {
            dispatch(success({
                ...notificationOpts,
                title: title || "Success",
                message
            }));
        }
    }
}
