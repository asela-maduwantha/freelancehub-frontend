"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Fingerprint, Smartphone, Key, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { passkeyApi } from "../../../../lib/api/registration";
import { toast } from "@/context/toast-context";

interface PasskeySetupStepProps {
  onNext: () => void;
  onBack: () => void;
  allowSkip?: boolean;
}

export function PasskeySetupStep({ onNext, onBack, allowSkip = true }: PasskeySetupStepProps) {
  const [deviceName, setDeviceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  // Check WebAuthn support on component mount
  useState(() => {
    if (typeof window !== "undefined") {
      const supported = !!(navigator.credentials && navigator.credentials.create);
      setIsSupported(supported);
      
      if (supported && !deviceName) {
        // Auto-suggest device name
        const userAgent = navigator.userAgent;
        let suggestedName = "My Device";
        
        if (userAgent.includes("Windows")) suggestedName = "Windows PC";
        else if (userAgent.includes("Mac")) suggestedName = "Mac";
        else if (userAgent.includes("iPhone")) suggestedName = "iPhone";
        else if (userAgent.includes("Android")) suggestedName = "Android Device";
        else if (userAgent.includes("Linux")) suggestedName = "Linux PC";
        
        setDeviceName(suggestedName);
      }
    }
  });

  const handleSetupPasskey = async () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name");
      return;
    }

    if (!isSupported) {
      toast.error("Passkeys are not supported on this device");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Initiate passkey registration
      const options = await passkeyApi.initiateRegistration(deviceName.trim());
      
      // Step 2: Create the credential using WebAuthn API
      const credential = await passkeyApi.createCredential(options);
      
      // Step 3: Complete registration with the server
      await passkeyApi.completeRegistration(credential, deviceName.trim());
      
      setSetupComplete(true);
      toast.success("Passkey setup completed successfully!");
      
      // Auto-advance after a short delay
      setTimeout(() => {
        onNext();
      }, 2000);

    } catch (error: any) {
      console.error("Passkey setup error:", error);
      
      if (error.message?.includes("cancelled")) {
        toast.error("Passkey setup was cancelled");
      } else if (error.message?.includes("not supported")) {
        toast.error("Passkeys are not supported on this device or browser");
        setIsSupported(false);
      } else if (error.message?.includes("already registered")) {
        toast.error("A passkey is already registered for this account on this device");
      } else {
        toast.error(error.message || "Failed to set up passkey. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onNext();
  };

  if (setupComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Passkey Setup Complete!
          </h2>
          <p className="text-gray-600">
            Your account is now secured with a passkey. You can use it to sign in quickly and securely.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            <strong>Device:</strong> {deviceName}
          </p>
        </div>
        <Button
          onClick={onNext}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
        >
          Continue to Profile Completion
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Secure Your Account with Passkeys
        </h2>
        <p className="text-gray-600">
          Set up a passkey for faster and more secure sign-ins (optional but recommended)
        </p>
      </div>

      {!isSupported ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Passkeys Not Supported</h3>
              <p className="text-yellow-800 text-sm mt-1">
                Your browser or device doesn't support passkeys. You can still use your account with traditional passwords.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Fingerprint className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Biometric Security</h3>
              <p className="text-sm text-gray-600">Use your fingerprint, face, or PIN to authenticate</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Device-Bound</h3>
              <p className="text-sm text-gray-600">Works only on your trusted devices</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Phishing-Resistant</h3>
              <p className="text-sm text-gray-600">Cannot be stolen or used by attackers</p>
            </div>
          </div>

          {/* Device Name Input */}
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Name
            </label>
            <Input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Enter a name for this device"
              className="text-center"
              maxLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">
              This helps you identify the device in your security settings
            </p>
          </div>

          {/* Setup Button */}
          <div className="text-center">
            <Button
              onClick={handleSetupPasskey}
              disabled={isLoading || !deviceName.trim()}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up passkey...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Set Up Passkey
                </div>
              )}
            </Button>
          </div>

          {/* How it works */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Click "Set Up Passkey" above</li>
              <li>2. Your browser will ask for biometric authentication or PIN</li>
              <li>3. A secure passkey will be created and stored on your device</li>
              <li>4. Use it for quick, secure sign-ins in the future</li>
            </ol>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-2"
        >
          Back
        </Button>
        
        <div className="flex gap-3">
          {allowSkip && (
            <Button
              onClick={handleSkip}
              variant="outline"
              className="px-6 py-2"
            >
              Skip for Now
            </Button>
          )}
          {!isSupported && (
            <Button
              onClick={onNext}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
