import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { toggleTheme, isGradientTheme } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'AI-powered insights that adapt to your learning patterns and optimize your study schedule automatically.'
    },
    {
      icon: '⏰',
      title: 'Focus Timer',
      description: 'Advanced Pomodoro technique with binaural beats and ambient sounds to maximize deep work sessions.'
    },
    {
      icon: '👥',
      title: 'Study Groups',
      description: 'Connect with peers globally, share resources, and collaborate in real-time virtual study sessions.'
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set SMART goals, track progress with visual charts, and celebrate milestones with gamification.'
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Personal study coach powered by GPT-4, providing instant answers and personalized recommendations.'
    },
    {
      icon: '🛡️',
      title: 'Progress Shield',
      description: 'Advanced progress tracking with streak protection, backup goals, and recovery recommendations.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Stanford University, Computer Science',
      text: 'StudyTracker revolutionized my study routine. The AI insights helped me identify my peak learning hours and optimize my schedule. My GPA increased from 3.2 to 3.9 in just one semester.',
      avatar: '👩‍💻',
      rating: 5,
      metrics: { improvement: '200%', time: '6 months' }
    },
    {
      name: 'Marcus Johnson',
      role: 'Harvard Medical School',
      text: 'The focus timer with binaural beats is incredible. I can maintain deep focus for 4+ hours straight now. This tool single-handedly helped me ace my MCAT with a 525 score.',
      avatar: '👨‍⚕️',
      rating: 5,
      metrics: { score: '525/528', percentile: '100th' }
    },
    {
      name: 'Elena Rodriguez',
      role: 'MIT, Electrical Engineering',
      text: 'Study groups feature connected me with brilliant minds worldwide. We solved complex problems together and I landed my dream internship at Tesla thanks to the collaborative projects.',
      avatar: '👩‍🔬',
      rating: 5,
      metrics: { connections: '50+', internship: 'Tesla' }
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Learners', icon: '👥' },
    { number: '2.5M+', label: 'Study Hours', icon: '⏱️' },
    { number: '95%', label: 'Success Rate', icon: '🎯' },
    { number: '4.9★', label: 'User Rating', icon: '⭐' }
  ];

  return (
    <div className="landing-page min-h-screen">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-400 to-red-600 opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-10 blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrollY > 50 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/20' 
            : 'bg-transparent'
        }`}
      >
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg transform group-hover:scale-110 transition-transform duration-300">
                ST
              </div>
              <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              StudyTracker
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-300">
              Features
            </a>
            <a href="#testimonials" className="nav-link text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-300">
              Reviews
            </a>
            <a href="#pricing" className="nav-link text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-300">
              Pricing
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-300"
            >
              {isGradientTheme ? '🌙' : '☀️'}
            </button>
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-300"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-fadeIn">
                <span className="mr-2">⚡</span>
                AI-Powered Learning Platform
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Master Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed animate-fadeIn" style={{animationDelay: '0.4s'}}>
                Transform your study habits with AI-powered insights, collaborative tools, and personalized learning paths designed for academic excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fadeIn" style={{animationDelay: '0.6s'}}>
                <button 
                  onClick={() => navigate('/signup')}
                  className="btn btn-primary btn-xl px-12 py-4 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  Start Learning Today
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
                <button 
                  className="btn btn-outline btn-xl px-12 py-4 text-lg font-bold rounded-2xl group"
                >
                  <span className="mr-2 group-hover:scale-110 transition-transform duration-300">▶️</span>
                  Watch Demo
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 animate-fadeIn" style={{animationDelay: '0.8s'}}>
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-fadeIn" style={{animationDelay: '1s'}}>
              <div className="relative z-10">
                {/* Main Dashboard Preview */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Sarah Chen</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Computer Science</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Level 12</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">2,450 XP</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Algorithms & Data Structures</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Completed • 2.5 hours</div>
                        </div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-bold">100%</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                          ⏱️
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Machine Learning Basics</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">In Progress • 1.2 hours</div>
                        </div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 font-bold">75%</div>
                    </div>
                  </div>
                </div>

                {/* Timer Widget Preview */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
                  <div className="text-center">
                    <div className="text-6xl font-mono font-bold mb-2">25:00</div>
                    <div className="text-lg opacity-90 mb-4">Focus Session • Pomodoro</div>
                    <div className="flex justify-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        ▶️
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        ⏸️
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        🔄
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-bounce">
                🎯
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-xl shadow-lg animate-pulse">
                ⚡
              </div>
              <div className="absolute -bottom-4 -left-8 w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                🚀
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
              ✨ Premium Features
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful tools and intelligent features designed to accelerate your learning and maximize your academic potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card card-glass p-8 group hover:scale-105 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gray-50 dark:bg-gray-900/50 relative">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
              💬 Success Stories
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Students Love StudyTracker
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of students who have transformed their academic performance with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex space-x-4 text-sm">
                    {Object.entries(testimonial.metrics).map(([key, value]) => (
                      <div key={key} className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {key}: {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
        <div className="container relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Join over 50,000 students who have already revolutionized their study habits and achieved academic excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button 
              onClick={() => navigate('/signup')}
              className="btn btn-primary btn-xl px-12 py-4 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 group"
            >
              Start Free Trial
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            <button className="btn btn-outline btn-xl px-12 py-4 text-lg font-bold rounded-2xl">
              Schedule Demo
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              14-day free trial
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              No credit card required
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  ST
                </div>
                <span className="text-2xl font-bold">StudyTracker</span>
              </Link>
              <p className="text-gray-400 max-w-md mb-6">
                Empowering students worldwide with AI-powered learning tools and collaborative study environments.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                  <button key={social} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                    <span className="sr-only">{social}</span>
                    📱
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">Features</button></li>
                <li><button className="hover:text-white transition-colors">Pricing</button></li>
                <li><button className="hover:text-white transition-colors">API</button></li>
                <li><button className="hover:text-white transition-colors">Integrations</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StudyTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
