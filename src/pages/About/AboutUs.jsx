import React, { useState, useEffect } from 'react';
import { ArrowRight, Target, Users, Award, Calendar, BarChart4, Heart, Smile, Star, Zap, Sparkles } from 'lucide-react';

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    mission: false,
    features: false,
    testimonials: false,
    team: false,
    cta: false
  });
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const features = [
    { 
      title: "Goal Setting & Tracking", 
      description: "Set personal goals and track your progress over time.",
      icon: <Target className="text-purple-400 mb-2" size={32} />
    },
    { 
      title: "Community Building", 
      description: "Connect with like-minded individuals who share your interests and aspirations.",
      icon: <Users className="text-purple-400 mb-2" size={32} />
    },
    { 
      title: "Achievement Showcase", 
      description: "Celebrate and share your accomplishments with your network.",
      icon: <Award className="text-purple-400 mb-2" size={32} />
    },
    { 
      title: "Mentor Guidance", 
      description: "Receive guidance from experienced mentors in your field of interest.",
      icon: <ArrowRight className="text-purple-400 mb-2" size={32} />
    },
    { 
      title: "Daily Activities", 
      description: "Engage in fun daily challenges that foster personal growth and happiness.",
      icon: <Calendar className="text-purple-400 mb-2" size={32} />
    },
    { 
      title: "Happiness Reports", 
      description: "Track your emotional well-being with personalized happiness reports.",
      icon: <BarChart4 className="text-purple-400 mb-2" size={32} />
    }
  ];
  
  const testimonials = [
    {
      name: "Mohan Shrivastava",
      role: "Fitness Enthusiast",
      testimonial: "Mellow has transformed how I approach my fitness goals. The community support and mentor guidance keep me motivated everyday.",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeM_uVhUxuWMjezl0rV0KPIad0chGa4Pw6aA&s"
    },
    {
      name: "Priya Jain",
      role: "Creative Professional",
      testimonial: "The daily activities on Mellow have sparked my creativity and helped me connect with other artists who inspire me.",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS8-nD2lVRa78MfkMegyCXUwABoI9sCB1JjA&s"
    },
    {
      name: "Tanishka Yadav",
      role: "Tech Entrepreneur",
      testimonial: "My happiness report shows how much I've grown since joining Mellow. The network I've built here has been instrumental to my success.",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1NrGLf8a8EufyUol8SpIeVXCl5sTefI5G4A&s"
    }
  ];
  
  // Updated with 5 team members
  const teamMembers = [
    {
      name: "Akshat Pandya",
      role: "Founder & CEO",
      bio: "Passionate about building communities that foster personal growth and happiness.",
      avatar: "/Akshat.png",
      icon: <Star className="text-yellow-400" size={18} />
    },
    {
      name: "Manas Maheswari",
      role: "Founder & CEO",
      bio: "Dedicated to creating intuitive experiences that help people achieve their goals.",
      avatar: "/Manas.png",
      icon: <Zap className="text-blue-400" size={18} />
    },
    {
      name: "Nandini Patel",
      role: "Founder & CEO",
      bio: "Expert in cultivating supportive environments where members can thrive together.",
      avatar: "/Nandini.png",
      icon: <Users className="text-green-400" size={18} />
    },
    {
      name: "Atharva Maddhav",
      role: "Founder & CEO",
      bio: "Crafting beautiful, accessible interfaces that bring joy to our community members.",
      avatar: "/Atharva.png",
      icon: <Sparkles className="text-pink-400" size={18} />
    },
    {
      name: "Arin Jain",
      role: "Founder & CEO",
      bio: "Building strategic relationships to expand our community and enhance member experiences.",
      avatar: "/Arin.png",
      icon: <ArrowRight className="text-purple-400" size={18} />
    }
  ];
  
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      {/* Hero Section - Enhanced with animated background */}
      <section 
        id="hero" 
        className={`flex flex-col items-center justify-center py-32 px-6 relative overflow-hidden transition-all duration-1000 ${isVisible.hero ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 z-0"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/600')] opacity-10 z-0 bg-fixed"></div>
        {/* Animated particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-purple-500 opacity-20"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`
              }}
            ></div>
          ))}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
            Welcome to Mellow
          </h1>
          <p className="text-2xl mb-10 leading-relaxed text-gray-100">
            A community where like-minded individuals connect, grow, and achieve their goals together.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-1">
              Join Our Community
            </button>
            <button className="bg-transparent backdrop-blur-sm bg-purple-400/10 border-2 border-purple-400 text-purple-300 font-bold py-4 px-10 rounded-full hover:bg-purple-400/20 transition-all duration-300 transform hover:-translate-y-1">
              Learn More
            </button>
          </div>
        </div>
      </section>
      
      {/* Mission Section - Enhanced with gradient border */}
      <section 
        id="mission" 
        className={`py-24 px-6 bg-gray-800/50 backdrop-blur-sm transition-all duration-1000 ${isVisible.mission ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Our Mission</h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <p className="text-lg mb-6 leading-relaxed">
                At Mellow, we believe in the power of community and personal growth. Our mission is to create a digital space where individuals can set meaningful goals, celebrate achievements, and build connections that foster happiness and fulfillment.
              </p>
              <p className="text-lg leading-relaxed">
                We're dedicated to providing tools and resources that help you track your progress, connect with mentors, and engage in activities that enhance your well-being. Our unique happiness reports give you insights into your journey, helping you cultivate a more balanced and joyful life.
              </p>
            </div>
            <div className="md:w-1/2 relative h-72 rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 opacity-75 group-hover:opacity-85 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Smile className="text-white group-hover:scale-110 transition-transform duration-500" size={120} />
              </div>
              {/* Animated border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Enhanced with hover effects */}
      <section 
        id="features" 
        className={`py-24 px-6 transition-all duration-1000 ${isVisible.features ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">What Makes Mellow Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-2 group border border-gray-700 hover:border-purple-500/50"
              >
                <div className="mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                <p className="text-gray-300 group-hover:text-gray-100 transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials - Enhanced with gradients and animations */}
      <section 
        id="testimonials" 
        className={`py-24 px-6 bg-gray-800/50 backdrop-blur-sm transition-all duration-1000 ${isVisible.testimonials ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gray-900/90 p-8 rounded-xl shadow-lg border border-purple-500/20 hover:border-purple-500/50 group relative transition-all duration-300 hover:-translate-y-2"
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-16 h-16 rounded-full mr-4 border-2 border-purple-400 object-cover" 
                      />
                      {/* Subtle pulse effect */}
                      <div className="absolute -inset-1 bg-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-purple-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic leading-relaxed">"{testimonial.testimonial}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section - Enhanced with 5 members and better cards */}
      <section 
        id="team" 
        className={`py-24 px-6 transition-all duration-1000 ${isVisible.team ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="text-center group"
              >
                <div className="relative mb-6 mx-auto w-36 h-36 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/70 group-hover:opacity-80 transition-opacity"></div>
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Icon badge */}
                  <div className="absolute bottom-2 right-2 bg-gray-900 p-2 rounded-full border border-purple-400">
                    {member.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-purple-300 transition-colors">{member.name}</h3>
                <p className="text-purple-400 mb-3 font-medium">{member.role}</p>
                <p className="text-gray-300 text-sm px-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - Enhanced with better gradient and effects */}
      <section 
        id="cta" 
        className={`py-32 px-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 transition-all duration-1000 relative overflow-hidden ${isVisible.cta ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
      >
        {/* Animated particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-purple-500 opacity-20"
              style={{
                width: `${Math.random() * 8 + 3}px`,
                height: `${Math.random() * 8 + 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 5}s linear infinite`
              }}
            ></div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Ready to Join the Mellow Journey?</h2>
          <p className="text-2xl mb-12 max-w-2xl mx-auto text-gray-100 leading-relaxed">
            Start setting goals, connecting with mentors, and building your community of like-minded individuals today.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-lg transform hover:-translate-y-1">
              Sign Up Now
            </button>
            <button className="bg-transparent backdrop-blur-sm bg-purple-400/10 border-2 border-purple-400 text-purple-300 font-bold py-4 px-12 rounded-full hover:bg-purple-400/20 transition-all duration-300 text-lg flex items-center gap-2 transform hover:-translate-y-1">
              <span>Take a Tour</span>
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="mt-20 flex items-center justify-center gap-4">
            <div className="relative">
              <Heart className="text-pink-500" size={32} />
              {/* Pulse effect */}
              <div className="absolute -inset-1 bg-pink-500 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
            <p className="text-xl text-gray-100">Join over 10,000 individuals on their personal growth journey</p>
          </div>
        </div>
      </section>
      
      {/* Footer - Enhanced with better spacing and gradients */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-bold text-white text-xl mb-4">Mellow</h3>
            <p className="mb-4">Connect. Grow. Achieve.</p>
            <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Team</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Connect</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 text-center">
          <p>© {new Date().getFullYear()} Mellow. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Add keyframes for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}