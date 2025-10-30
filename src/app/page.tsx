"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  FileText, 
  Users, 
  Shield, 
  BarChart3, 
  Zap,
  ArrowRight,
  CheckCircle,
  Building,
  Smartphone,
  Globe,
  Lock,
  Star,
  TrendingUp,
  Wallet
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Easy Payments",
      description: "Seamless payment processing with multiple payment methods including mobile money",
      color: "text-orange-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart Billing",
      description: "Automated invoice generation and management for Ethiopian businesses",
      color: "text-amber-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer Management",
      description: "Efficient customer and biller relationship management",
      color: "text-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Bank-level security for all your financial transactions",
      color: "text-amber-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Comprehensive insights and reporting tools in ETB",
      color: "text-orange-400"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Processing",
      description: "Lightning-fast payment processing designed for Ethiopia",
      color: "text-amber-400"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime" },
    { number: "10K+", label: "Transactions" },
    { number: "500+", label: "Ethiopian Businesses" },
    { number: "24/7", label: "Support" }
  ];

  const handleGetStarted = () => {
    router.push("/auth/login");
  };

  const handleBillerSignUp = () => {
    router.push("/biller_sign_up");
  };

  const handleCustomerSignUp = () => {
    router.push("/customer_sign_up");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <nav className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Kacha
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto text-center">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
             
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Kacha
                </span>
                <br />
                <span className="text-gray-900">Billing Management System</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Ethiopia's premier billing and payment platform. Streamline your finances 
                with secure, fast, and reliable digital payments in ETB.
              </p>

              {/* Registration Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={handleBillerSignUp}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center space-x-3 w-full sm:w-auto justify-center"
                >
                  <Building className="w-5 h-5" />
                  <span>Register as Biller</span>
                </button>
                
                <button
                  onClick={handleCustomerSignUp}
                  className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-3 w-full sm:w-auto justify-center"
                >
                  <Users className="w-5 h-5" />
                  <span>Register as Customer</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center space-x-3"
                >
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Platform Preview */}
            <div className={`relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">For Customers</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Pay bills anytime, anywhere",
                      "Multiple payment options (Mobile Money, Bank, etc.)",
                      "Complete payment history",
                      "Auto-pay for recurring bills",
                      "Instant payment notifications"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleCustomerSignUp}
                    className="w-full mt-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
                  >
                    Join as Customer
                  </button>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-6 border border-amber-200 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Building className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">For Billers</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Automated invoice generation",
                      "Customer management dashboard",
                      "Real-time revenue analytics in ETB",
                      "Payment tracking and reporting",
                      "Bulk operations and batch processing"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleBillerSignUp}
                    className="w-full mt-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200"
                  >
                    Join as Biller
                  </button>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Shield className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Security Features</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "End-to-end encryption",
                      "National Bank compliance",
                      "Two-factor authentication",
                      "Regular security audits",
                      "Data backup & recovery"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-2">Rated 5/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Kacha
                </span>
                ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ethiopia's most trusted financial management platform designed 
                for modern businesses and individuals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 bg-gradient-to-r from-orange-500 to-amber-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Financial Management?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join Ethiopia's fastest growing financial platform trusted by businesses and individuals nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleBillerSignUp}
                className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center space-x-3"
              >
                <Building className="w-5 h-5" />
                <span>Register as Biller</span>
              </button>
              <button
                onClick={handleCustomerSignUp}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-3"
              >
                <Users className="w-5 h-5" />
                <span>Register as Customer</span>
              </button>
            </div>
            <div className="mt-8">
              <button
                onClick={handleGetStarted}
                className="text-orange-100 hover:text-white font-semibold underline transition-colors duration-200"
              >
                Already have an account? Sign in here
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">Kacha Financial</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <span>Addis Ababa, Ethiopia</span>
                <span>•</span>
                <span>+251 900 000 000</span>
                <span>•</span>
                <span>info@kacha.et</span>
              </div>
            </div>
            <div className="text-center mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400">
                © 2024 Kacha Financial Management System. Proudly serving Ethiopia.
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}