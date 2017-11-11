const actionTypes = {
    loginRequested: 'LOGIN_REQUESTED',
    loginRejected: 'LOGIN_REJECTED',
    loginFulfilled: 'LOGIN_FULFILLED',
    registerRequested: 'REGISTER_REQUESTED',
    registerRejected: 'REGISTER_REJECTED',
    registerFulfilled: 'REGISTER_FULFILLED',
    logoutRequested: 'LOGOUT_REQUESTED',
    logoutRejected: 'LOGOUT_REJECTED',
    logoutFulfilled: 'LOGOUT_FULFILLED',
    fetchUsersRequested: 'FETCH_USERS_REQUESTED',
    fetchUsersRejected: 'FETCH_USERS_REJECTED',
    fetchUsersFulfilled: 'FETCH_USERS_FULFILLED',
    sendEmailVerification: 'SEND_EMAIL_VERIFICATION',
    
    /**Save Profile Image */
    
    saveProfileImageRequested: 'SAVE_PROFILE_IMAGE_REQUESTED',
    saveProfileImageRejected: 'SAVE_PROFILE_IMAGE_REJECTED',
    saveProfileImageProgress: 'SAVE_PROFILE_IMAGE_PROGRESS',
    saveProfileImageFulfilled: 'SAVE_PROFILE_IMAGE_FULFILLED',
    /**Save Profile Image */
    
    saveUserProfileImageRequested: 'SAVE_USER_PROFILE_IMAGE_REQUESTED',
    saveUserProfileImageRejected: 'SAVE_USER_PROFILE_IMAGE_REJECTED',
    saveUserProfileImageFulfilled: 'SAVE_USER_PROFILE_IMAGE_FULFILLED',
    
    /*Delete Profile Image */
    deleteProfileImageRequested: 'DELETE_PROFILE_IMAGE_REQUESTED',
    deleteProfileImageRejected: 'DELETE_PROFILE_IMAGE_REJECTED',
    deleteProfileImageFulfilled: 'DELETE_PROFILE_IMAGE_FULFILLED'
    
    
};
export default actionTypes;