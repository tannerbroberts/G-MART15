import { useEffect } from 'react';

// Extend the Window interface to include the gapi property
declare global {
  interface Window {
    gapi: any;
  }
}

export default function GoogleSignin() {
  useEffect(() => {
    // Load the Google Sign-In library script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Initialize the Google Sign-In button after the script loads
    script.onload = () => {
      if (window.gapi) {
        window.gapi.signin2.render('google-signin-button', {
          client_id: '972699738165-t6gefqgti47b8rd1n7o2jdgdcdnritnn.apps.googleusercontent.com',
          scope: 'profile email',
          width: 240,
          height: 50,
          longtitle: true,
          theme: 'dark',
          onsuccess: onSignIn,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Callback function for successful sign-in
  interface GoogleUser {
    getBasicProfile: () => GoogleUserProfile;
  }

  interface GoogleUserProfile {
    getId: () => string;
    getName: () => string;
    getEmail: () => string;
  }

  const onSignIn = (googleUser: GoogleUser) => {
    const profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Email: ' + profile.getEmail());
  };

  return (
    <div id="google-signin-button"></div>
  );
}