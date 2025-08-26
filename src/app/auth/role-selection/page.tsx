"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Building2, 
  Search, 
  Briefcase, 
  Star, 
  Users,
  ArrowRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type UserRole = "freelancer" | "client";

interface RoleOption {
  value: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "freelancer",
    title: "I'm a Freelancer",
    subtitle: "I want to work on projects",
    description: "Join as a freelancer to showcase your skills and find exciting projects",
    icon: User,
    features: [
      "Create a professional profile",
      "Showcase your portfolio",
      "Bid on projects",
      "Get hired by clients",
      "Build your reputation"
    ],
    color: "green"
  },
  {
    value: "client",
    title: "I'm a Client",
    subtitle: "I want to hire talent",
    description: "Join as a client to post projects and hire the best freelancers",
    icon: Building2,
    features: [
      "Post unlimited projects",
      "Browse freelancer profiles",
      "Review proposals",
      "Hire top talent",
      "Manage your team"
    ],
    color: "blue"
  }
];

function RoleSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle default role from URL parameter
  useEffect(() => {
    const defaultRole = searchParams.get('defaultRole') as UserRole;
    if (defaultRole && (defaultRole === 'freelancer' || defaultRole === 'client')) {
      setSelectedRole(defaultRole);
    }
  }, [searchParams]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    // Store the selected role and redirect to registration
    sessionStorage.setItem('selectedRole', selectedRole);
    
    // Redirect to registration page with role parameter
    router.push(`/auth/register?type=${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join FreelanceHub
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to use FreelanceHub. You can always change this later.
            </p>
          </motion.div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {ROLE_OPTIONS.map((option, index) => {
            const IconComponent = option.icon;
            const isSelected = selectedRole === option.value;
            
            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`
                  relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                  ${isSelected 
                    ? `border-${option.color}-500 shadow-lg` 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }
                `}
                onClick={() => handleRoleSelect(option.value)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className={`absolute top-0 right-0 bg-${option.color}-500 text-white p-2 rounded-bl-lg`}>
                    <Check className="w-5 h-5" />
                  </div>
                )}

                <div className="p-8">
                  {/* Icon and Header */}
                  <div className="flex items-center mb-6">
                    <div className={`
                      w-12 h-12 rounded-lg bg-${option.color}-100 flex items-center justify-center mr-4
                    `}>
                      <IconComponent className={`w-6 h-6 text-${option.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-${option.color}-500 mr-3`} />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {option.value === "freelancer" ? (
                        <>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">50K+</div>
                            <div className="text-xs text-gray-500">Active Projects</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">4.8★</div>
                            <div className="text-xs text-gray-500">Avg Rating</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">100K+</div>
                            <div className="text-xs text-gray-500">Freelancers</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">24h</div>
                            <div className="text-xs text-gray-500">Avg Response</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
              Sign in
            </a>
          </p>
        </motion.div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Trusted Community</h4>
              <p className="text-sm text-gray-500">Join thousands of professionals</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Quality Projects</h4>
              <p className="text-sm text-gray-500">Work on meaningful projects</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Secure Payments</h4>
              <p className="text-sm text-gray-500">Get paid safely and on time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function RoleSelectionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 animate-pulse"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-6 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <Suspense fallback={<RoleSelectionLoading />}>
      <RoleSelectionContent />
    </Suspense>
  );
}
