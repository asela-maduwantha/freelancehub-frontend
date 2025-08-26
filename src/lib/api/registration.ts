import apiClient from "../../api/axios-instance";

export interface PasskeyRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key";
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment?: "platform" | "cross-platform";
    userVerification: "required" | "preferred" | "discouraged";
    residentKey?: "required" | "preferred" | "discouraged";
  };
  timeout: number;
  attestation: "none" | "indirect" | "direct";
}

export interface PasskeyCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    attestationObject: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
  };
  type: "public-key";
}

export const passkeyApi = {
  // Initiate passkey registration
  async initiateRegistration(deviceName: string): Promise<PasskeyRegistrationOptions> {
    try {
      const response = await apiClient.post('/auth/passkey/register/begin', {
        deviceName
      });
      return response.data as PasskeyRegistrationOptions;
    } catch (error) {
      console.error('Error initiating passkey registration:', error);
      throw error;
    }
  },

  // Create WebAuthn credential
  async createCredential(options: PasskeyRegistrationOptions): Promise<PasskeyCredential> {
    try {
      // Convert base64url strings to ArrayBuffers
      const challenge = this.base64urlToBuffer(options.challenge);
      const userId = this.base64urlToBuffer(options.user.id);

      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          ...options,
          challenge,
          user: {
            ...options.user,
            id: userId,
          },
        },
      };

      const credential = await navigator.credentials.create(credentialCreationOptions);
      
      if (!credential || credential.type !== 'public-key') {
        throw new Error('Failed to create passkey credential');
      }

      const publicKeyCredential = credential as PublicKeyCredential;
      const response = publicKeyCredential.response as AuthenticatorAttestationResponse;

      return {
        id: publicKeyCredential.id,
        rawId: publicKeyCredential.rawId,
        response: {
          attestationObject: response.attestationObject,
          clientDataJSON: response.clientDataJSON,
        },
        type: 'public-key',
      };
    } catch (error) {
      console.error('Error creating WebAuthn credential:', error);
      throw error;
    }
  },

  // Complete passkey registration
  async completeRegistration(credential: PasskeyCredential, deviceName: string): Promise<void> {
    try {
      // Convert ArrayBuffers to base64url strings for transmission
      const registrationData = {
        id: credential.id,
        rawId: this.bufferToBase64url(credential.rawId),
        response: {
          attestationObject: this.bufferToBase64url(credential.response.attestationObject),
          clientDataJSON: this.bufferToBase64url(credential.response.clientDataJSON),
        },
        type: credential.type,
        deviceName,
      };

      await apiClient.post('/auth/passkey/register/complete', registrationData);
    } catch (error) {
      console.error('Error completing passkey registration:', error);
      throw error;
    }
  },

  // Initiate passkey authentication
  async initiateAuthentication(): Promise<any> {
    try {
      const response = await apiClient.post('/auth/passkey/authenticate/begin');
      return response.data;
    } catch (error) {
      console.error('Error initiating passkey authentication:', error);
      throw error;
    }
  },

  // Complete passkey authentication
  async completeAuthentication(assertion: any): Promise<any> {
    try {
      const response = await apiClient.post('/auth/passkey/authenticate/complete', assertion);
      return response.data;
    } catch (error) {
      console.error('Error completing passkey authentication:', error);
      throw error;
    }
  },

  // Get user's passkeys
  async getUserPasskeys(): Promise<Array<{
    id: string;
    deviceName: string;
    createdAt: string;
    lastUsed?: string;
  }>> {
    try {
      const response = await apiClient.get('/auth/passkey/devices');
      return response.data as Array<{
        id: string;
        deviceName: string;
        createdAt: string;
        lastUsed?: string;
      }>;
    } catch (error) {
      console.error('Error fetching user passkeys:', error);
      return [];
    }
  },

  // Delete a passkey
  async deletePasskey(passkeyId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/passkey/devices/${passkeyId}`);
    } catch (error) {
      console.error('Error deleting passkey:', error);
      throw error;
    }
  },

  // Utility functions for base64url encoding/decoding
  base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  },

  bufferToBase64url(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  // Check if WebAuthn is supported
  isSupported(): boolean {
    return !!(navigator.credentials && navigator.credentials.create);
  },

  // Check if platform authenticator is available
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    try {
      if (!this.isSupported()) return false;
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  },
};
