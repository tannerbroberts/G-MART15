import React, { useState } from 'react';

export default function PasskeySignin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Function to create a new passkey for a user
  const registerPasskey = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not supported in this browser");
      }
      
      // Generate random user ID for demonstration
      // In a real app, this would come from your user database
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);
      
      // Convert the random bytes to a base64 string for display/storage
      const userIdBase64 = btoa(String.fromCharCode.apply(null, Array.from(userId)));
      
      // Server would normally generate this challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      // Create the credential options
      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Midland G-MART15",
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: `user_${userIdBase64.substring(0, 8)}@example.com`,
          displayName: `User ${userIdBase64.substring(0, 8)}`
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform" as AuthenticatorAttachment,
          userVerification: "required" as UserVerificationRequirement,
          residentKey: "required" as ResidentKeyRequirement
        },
        timeout: 60000,
        attestation: "direct" as AttestationConveyancePreference
      };
      
      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      
      console.log('Passkey created successfully:', credential);
      
      // Here you would send the credential to your server to associate it with the user
      alert("Passkey registered successfully! In a real app, this would be saved to your server.");
      
    } catch (err) {
      console.error('Error registering passkey:', err);
      setError(err instanceof Error ? err.message : 'Failed to register passkey');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to sign in with an existing passkey
  const authenticateWithPasskey = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not supported in this browser");
      }
      
      // Server would normally generate this challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      // Create the credential options
      const publicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required" as UserVerificationRequirement,
        timeout: 60000
      };
      
      // Get the credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });
      
      console.log('Authentication successful:', credential);
      
      // Here you would send the credential to your server to verify it
      alert("Authentication successful! In a real app, this would verify you on the server.");
      
    } catch (err) {
      console.error('Error authenticating with passkey:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate with passkey');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button 
        onClick={authenticateWithPasskey}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: '#1a73e8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: 500,
          width: '280px',
          height: '48px',
          cursor: isLoading ? 'default' : 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          transition: 'background-color 0.3s'
        }}
      >
        {isLoading && !isRegistering ? 'Signing in...' : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="white"/>
            </svg>
            Sign in with Passkey
          </>
        )}
      </button>
      
      <button 
        onClick={registerPasskey}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: 'white',
          color: '#1a73e8',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: 500,
          width: '280px',
          height: '48px',
          cursor: isLoading ? 'default' : 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          transition: 'background-color 0.3s'
        }}
      >
        {isLoading && isRegistering ? 'Registering...' : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#1a73e8"/>
            </svg>
            Register New Passkey
          </>
        )}
      </button>
      
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      <p style={{ fontSize: '14px', color: '#5f6368', marginTop: '8px' }}>
        Passkeys are a simpler and more secure alternative to passwords.
        They use biometrics or device PIN to verify your identity.
      </p>
    </div>
  );
}