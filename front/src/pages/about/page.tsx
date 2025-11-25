
import { useEffect } from 'react';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';

export default function About() {
  useEffect(() => {
    updateSEO(seoData.about);
  }, []);

  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Founder & CEO',
      image: 'professional female engineer CEO portrait confident smile modern office background business attire leadership',
      bio: 'P.Eng with 15+ years experience. Former NPPE examiner and engineering education specialist.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Content',
      image: 'professional male engineer content director portrait friendly expression modern office technical background',
      bio: 'Licensed Professional Engineer specializing in NPPE curriculum development and exam preparation.'
    },
    {
      name: 'Jennifer Liu',
      role: 'Lead Developer',
      image: 'professional female software engineer portrait confident smile tech office background modern lighting',
      bio: 'Full-stack engineer passionate about creating intuitive learning experiences for technical professionals.'
    },
    {
      name: 'David Thompson',
      role: 'Student Success Manager',
      image: 'professional male customer success manager portrait warm smile office environment modern design',
      bio: 'Dedicated to helping engineers achieve their professional licensing goals through personalized support.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a mission to revolutionize NPPE exam preparation'
    },
    {
      year: '2021',
      title: '1,000 Students',
      description: 'Reached our first thousand successful students'
    },
    {
      year: '2022',
      title: 'Platform Launch',
      description: 'Launched comprehensive online learning platform'
    },
    {
      year: '2023',
      title: '95% Pass Rate',
      description: 'Achieved industry-leading 95% first-attempt pass rate'
    },
    {
      year: '2024',
      title: '10,000+ Engineers',
      description: 'Helped over 10,000 engineers earn their P.Eng designation'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-settings-3-line text-[#0277BD] text-xl"></i>
              </div>
              <h1 className="text-xl font-bold text-[#0277BD]">NPPE Pro</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-[#0277BD] transition-colors">Home</a>
              <a href="/features" className="text-gray-600 hover:text-[#0277BD] transition-colors">Features</a>
              <a href="/pricing" className="text-gray-600 hover:text-[#0277BD] transition-colors">Pricing</a>
              <a href="/about" className="text-[#0277BD] font-medium">About</a>
              <a href="/blog" className="text-gray-600 hover:text-[#0277BD] transition-colors">Blog</a>
              <a href="/contact" className="text-gray-600 hover:text-[#0277BD] transition-colors">Contact</a>
              <a href="/login" className="text-gray-600 hover:text-[#0277BD] transition-colors">Login</a>
              <Button onClick={() => window.location.href = '/signup'}>Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 119, 189, 0.9), rgba(1, 87, 155, 0.9)), url('https://readdy.ai/api/search-image?query=modern%20engineering%20team%20collaboration%20office%20environment%20professional%20engineers%20working%20together%20blueprints%20technical%20drawings%20bright%20lighting%20teamwork&width=1200&height=400&seq=about-hero&orientation=landscape')`
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Engineers to Achieve Professional Excellence
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Founded by engineers, for engineers. We understand the challenges of the NPPE exam and have created the most effective preparation platform in Canada.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe every qualified engineer deserves to achieve their Professional Engineer designation. Our mission is to provide the most comprehensive, effective, and accessible NPPE exam preparation platform in Canada.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Through innovative technology, expert content, and personalized learning paths, we help engineers master the knowledge and confidence needed to pass the NPPE exam on their first attempt.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0277BD] mb-2">95%</div>
                  <div className="text-gray-600">First-Attempt Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0277BD] mb-2">10,000+</div>
                  <div className="text-gray-600">Engineers Helped</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://readdy.ai/api/search-image?query=professional%20engineering%20office%20workspace%20modern%20design%20engineers%20collaborating%20technical%20drawings%20computer%20screens%20professional%20environment%20clean%20bright%20lighting&width=600&height=400&seq=mission-img&orientation=landscape"
                alt="Engineering workspace"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From startup to Canada's leading NPPE preparation platform
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#0277BD] opacity-20"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <Card className="p-6">
                    <div className="text-2xl font-bold text-[#0277BD] mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </Card>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#0277BD] rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              Experienced engineers and educators dedicated to your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <img
                  src={`https://readdy.ai/api/search-image?query=$%7Bmember.image%7D&width=200&height=200&seq=team-${index}&orientation=squarish`}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-[#0277BD] font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-[#0277BD] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-lightbulb-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in everything we create, from content to user experience.
              </p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-[#0277BD] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Empathy</h3>
              <p className="text-gray-600">
                We understand the stress and challenges of exam preparation and design with compassion.
              </p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-[#0277BD] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-rocket-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate to create better, more effective learning experiences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0277BD]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Our Success Story?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Become part of the thousands of engineers who have achieved their P.Eng designation with NPPE Pro.
          </p>
          <Button size="lg" className="text-lg px-8 py-4 bg-white text-[#0277BD] hover:bg-gray-100" onClick={() => window.location.href = '/signup'}>
            Start Your Journey Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-settings-3-line text-[#0277BD] text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">NPPE Pro</h3>
              </div>
              <p className="text-gray-400">
                The most comprehensive NPPE exam preparation platform for professional engineers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/practice" className="hover:text-white transition-colors">Practice Tests</a></li>
                <li><a href="/study-path" className="hover:text-white transition-colors">Study Materials</a></li>
                <li><a href="/topics" className="hover:text-white transition-colors">Topics</a></li>
                <li><a href="/analytics" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/forum" className="hover:text-white transition-colors">Forum</a></li>
                <li><a href="/study-groups" className="hover:text-white transition-colors">Study Groups</a></li>
                <li><a href="/achievements" className="hover:text-white transition-colors">Achievements</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NPPE Pro. All rights reserved. | <a href="https://readdy.ai/?origin=logo" className="hover:text-white transition-colors">Powered by Readdy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
