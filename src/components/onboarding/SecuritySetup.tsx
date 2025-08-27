"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, Smartphone, Key, CheckCircle2, ArrowRight, ArrowLeft, QrCode, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authApi } from '@/api/services/auth';

interface SecuritySetupProps {
  onSuccess: (securityConfig: { passkeySetup: boolean; twoFactorEnabled: boolean }) => void;
  onError: (error: string) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

interface PasskeySetupState {
  supported: boolean;
  registered: boolean;
  deviceName?: string;
  error?: string;
}

interface TwoFactorState {
  enabled: boolean;
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
  verificationCode: string;
  error?: string;
}

const SecuritySetup = ({ onSuccess, onError, onBack, onSkip }: SecuritySetupProps) => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'passkey' | 'twofa' | 'complete'>('overview');
  const [loading, setLoading] = useState(false);
  
  const [passkeyState, setPasskeyState] = useState<PasskeySetupState>({
    supported: !!window.PublicKeyCredential,
    registered: false
  });
  
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState>({
    enabled: false,
    verificationCode: ''
  });

  // Check WebAuthn support
  const checkWebAuthnSupport = () => {
    if (!window.PublicKeyCredential) {
      return false;
    }
    
    // Check for platform authenticator support
    if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setPasskeyState(prev => ({ ...prev, supported: available }));
        });
    }
    
    return true;
  };

  // Setup Passkey/WebAuthn
  const setupPasskey = async () => {
    if (!passkeyState.supported) {
      setPasskeyState(prev => ({ 
        ...prev, 
        error: 'Passkeys are not supported on this device' 
      }));
      return;
    }

    setLoading(true);
    try {
      // Get registration challenge
      const challengeResponse = await authApi.getPasskeyRegistrationChallenge();
      
      if (!challengeResponse.success || !challengeResponse.data) {
        throw new Error('Failed to get registration challenge');
      }

      const challenge = challengeResponse.data;
      
      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge.challenge), c => c.charCodeAt(0)),
          rp: challenge.rp,
          user: {
            id: Uint8Array.from(challenge.user.id, c => c.charCodeAt(0)),
            name: challenge.user.name,
            displayName: challenge.user.displayName,
          },
          pubKeyCredParams: challenge.pubKeyCredParams.map(param => ({
            type: 'public-key' as const,
            alg: param.alg
          })),
          authenticatorSelection: challenge.authenticatorSelection ? {
            authenticatorAttachment: challenge.authenticatorSelection.authenticatorAttachment as AuthenticatorAttachment,
            userVerification: challenge.authenticatorSelection.userVerification as UserVerificationRequirement
          } : undefined,
          timeout: challenge.timeout || 60000,
          attestation: 'direct'
        }
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Convert credential to format expected by server
      const response = credential.response as AuthenticatorAttestationResponse;
      const registrationResponse = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        response: {
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
        },
        type: credential.type
      };

      // Register with server
      const registerResponse = await authApi.registerPasskey({
        challengeId: challenge.challenge,
        registrationResponse
      });

      if (registerResponse.success) {
        setPasskeyState(prev => ({
          ...prev,
          registered: true,
          deviceName: registerResponse.data?.deviceName || 'This Device',
          error: undefined
        }));
      } else {
        throw new Error(registerResponse.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Passkey setup error:', error);
      setPasskeyState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup passkey. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Setup Two-Factor Authentication
  const setupTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await authApi.enableTwoFactor();
      
      if (response.success && response.data) {
        setTwoFactorState(prev => ({
          ...prev,
          qrCode: response.data!.qrCode,
          secret: response.data!.secret,
          error: undefined
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to setup 2FA');
      }
    } catch (error: any) {
      setTwoFactorState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup two-factor authentication'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Verify Two-Factor Authentication
  const verifyTwoFactor = async () => {
    if (!twoFactorState.verificationCode || twoFactorState.verificationCode.length !== 6) {
      setTwoFactorState(prev => ({
        ...prev,
        error: 'Please enter a 6-digit verification code'
      }));
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyTwoFactor(twoFactorState.verificationCode);
      
      if (response.success) {
        // Generate backup codes (mock for now)
        const backupCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substr(2, 8).toUpperCase()
        );
        
        setTwoFactorState(prev => ({
          ...prev,
          enabled: true,
          backupCodes,
          error: undefined
        }));
      } else {
        throw new Error(response.error?.message || 'Invalid verification code');
      }
    } catch (error: any) {
      setTwoFactorState(prev => ({
        ...prev,
        error: error.message || 'Verification failed. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onSuccess({
      passkeySetup: passkeyState.registered,
      twoFactorEnabled: twoFactorState.enabled
    });
  };

  const downloadBackupCodes = () => {
    if (!twoFactorState.backupCodes) return;
    
    const content = `FreelanceHub 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes:\n${twoFactorState.backupCodes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freelancehub-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      <div>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Secure Your Account
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Protect your freelancing career with advanced security features. 
          Set up additional authentication methods to keep your account safe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Passkey Card */}
        <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Fingerprint className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Passkey Authentication
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Use your device's biometric authentication or security key for passwordless login.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Passwordless login</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Device-based security</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Phishing resistant</span>
            </div>
          </div>
          <Button
            onClick={() => setCurrentStep('passkey')}
            variant="outline"
            className="w-full mt-4"
            disabled={!passkeyState.supported}
          >
            {passkeyState.supported ? 'Setup Passkey' : 'Not Supported'}
          </Button>
        </div>

        {/* 2FA Card */}
        <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Two-Factor Authentication
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Add an extra layer of security with authenticator app verification codes.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Time-based codes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Backup codes included</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Works with any TOTP app</span>
            </div>
          </div>
          <Button
            onClick={() => setCurrentStep('twofa')}
            variant="outline"
            className="w-full mt-4"
          >
            Setup 2FA
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-x-3">
          {onSkip && (
            <Button
              variant="outline"
              onClick={onSkip}
            >
              Skip for Now
            </Button>
          )}
          
          <Button
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderPasskeySetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center space-y-6"
    >
      <div>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Setup Passkey
        </h2>
        <p className="text-gray-600">
          Create a passkey for secure, passwordless authentication
        </p>
      </div>

      {!passkeyState.registered ? (
        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What you'll need:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your device's biometric authentication (Face ID, Touch ID, or fingerprint)</li>
              <li>• Or a compatible security key</li>
              <li>• A few seconds to complete the setup</li>
            </ul>
          </div>

          {passkeyState.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{passkeyState.error}</p>
            </div>
          )}

          <Button
            onClick={setupPasskey}
            disabled={loading || !passkeyState.supported}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Create Passkey'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-green-900 mb-2">Passkey Created!</h3>
            <p className="text-green-800 text-sm">
              Your passkey has been successfully registered for{' '}
              <strong>{passkeyState.deviceName}</strong>
            </p>
          </div>
          
          <Button
            onClick={() => setCurrentStep('overview')}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setCurrentStep('overview')}
        className="w-full"
      >
        Back to Security Options
      </Button>
    </motion.div>
  );

  const renderTwoFactorSetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Setup Two-Factor Authentication
        </h2>
        <p className="text-gray-600">
          Scan the QR code with your authenticator app
        </p>
      </div>

      {!twoFactorState.qrCode ? (
        <div className="text-center">
          <Button
            onClick={setupTwoFactor}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </div>
      ) : !twoFactorState.enabled ? (
        <div className="space-y-6">
          {/* QR Code */}
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <div className="w-48 h-48 mx-auto bg-white p-4 rounded-lg border">
              <img 
                src={`data:image/svg+xml;base64,${twoFactorState.qrCode}`}
                alt="2FA QR Code"
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Can't scan? Manual entry key: <br />
              <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                {twoFactorState.secret}
              </code>
            </p>
          </div>

          {/* Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code from your app
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={twoFactorState.verificationCode}
              onChange={(e) => setTwoFactorState(prev => ({
                ...prev,
                verificationCode: e.target.value.replace(/\D/g, ''),
                error: undefined
              }))}
              className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            {twoFactorState.error && (
              <p className="mt-2 text-sm text-red-600">{twoFactorState.error}</p>
            )}
          </div>

          <Button
            onClick={verifyTwoFactor}
            disabled={loading || twoFactorState.verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success */}
          <div className="p-6 bg-green-50 rounded-lg text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-green-900 mb-2">2FA Enabled!</h3>
            <p className="text-green-800 text-sm">
              Two-factor authentication is now active on your account
            </p>
          </div>

          {/* Backup Codes */}
          {twoFactorState.backupCodes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Backup Codes</h4>
              <p className="text-yellow-800 text-sm mb-3">
                Save these codes in a safe place. Each can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {twoFactorState.backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    {code}
                  </div>
                ))}
              </div>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                size="sm"
                className="w-full mt-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Codes
              </Button>
            </div>
          )}
          
          <Button
            onClick={() => setCurrentStep('overview')}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setCurrentStep('overview')}
        className="w-full"
      >
        Back to Security Options
      </Button>
    </motion.div>
  );

  return (
    <div>
      {currentStep === 'overview' && renderOverview()}
      {currentStep === 'passkey' && renderPasskeySetup()}
      {currentStep === 'twofa' && renderTwoFactorSetup()}
    </div>
  );
};

export default SecuritySetup;
