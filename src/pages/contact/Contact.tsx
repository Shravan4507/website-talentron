import React, { useState } from 'react';
import { useToast } from '../../components/toast/Toast';
import SEO from '../../components/navigation/SEO';
import { assetPath } from '../../utils/assetPath';
import './Contact.css';

const Contact: React.FC = () => {
    const { showToast } = useToast();
    const contactSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Talentron",
        "description": "Have questions about Talentron '26? Get in touch with our team via email, phone, or visit us at Zeal College, Pune.",
        "mainEntity": {
            "@type": "Organization",
            "name": "Talentron",
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "telephone": "+91-98765-43210",
                    "contactType": "customer service",
                    "email": "support@talentron.com"
                }
            ],
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Narhe",
                "addressLocality": "Pune",
                "postalCode": "411041",
                "addressCountry": "IN"
            }
        }
    };
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            showToast('Please fill in all required fields.', 'warning');
            return;
        }

        setIsSubmitting(true);

        // Simulating API call
        setTimeout(() => {
            console.log('Contact Form Submitted:', formData);
            showToast('Message sent! We\'ll get back to you soon.', 'success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="contact-page">
            <SEO 
                title="Contact Us — We're Here to Help"
                description="Get in touch with the Talentron team for any queries regarding event registrations, schedules, or sponsorships. Join our community on Instagram and WhatsApp."
                keywords="contact Talentron, Zeal College contact, Pune college fest support, Talentron location"
                schema={contactSchema}
            />
            <div className="contact-header">
                <p className="contact-subtitle">Get In Touch</p>
                <h1 className="contact-title">Contact Us</h1>
            </div>

            <div className="contact-container">
                {/* Left Side: Form */}
                <div className="contact-card">
                    <h2>Send a Message</h2>
                    <p className="section-desc">Have a question? We're here to help you excel.</p>
                    
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Full Name*</label>
                                <input 
                                    name="name"
                                    type="text" 
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Email Address*</label>
                                <input 
                                    name="email"
                                    type="email" 
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Subject</label>
                            <input 
                                name="subject"
                                type="text" 
                                placeholder="What is this about?"
                                value={formData.subject}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="input-group">
                            <label>Message*</label>
                            <textarea 
                                name="message"
                                placeholder="How can we help?"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending Message...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                {/* Right Side: Info Sidebar */}
                <div className="info-sidebar">
                    <div className="info-item">
                        <div className="info-icon">
                            <img src={assetPath('/assets/icons/location.png')} alt="Location" style={{width: 28, height: 28}} />
                        </div>
                        <div className="info-text">
                            <h4>Location</h4>
                            <a href="https://maps.app.goo.gl/jdftRP4Uhy6sot6c7" target="_blank" rel="noopener noreferrer">Zeal College of Engineering and Research, Narhe, Pune 411041</a>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">
                            <img src={assetPath('/assets/icons/envelope.png')} alt="Email" style={{width: 28, height: 28}} />
                        </div>
                        <div className="info-text">
                            <h4>Email Us</h4>
                            <a href="mailto:support@talentron.com">support@talentron.com</a>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">
                            <img src={assetPath('/assets/icons/phone.png')} alt="Phone" style={{width: 28, height: 28}} />
                        </div>
                        <div className="info-text">
                            <h4>Call Us</h4>
                            <a href="tel:+919876543210">+91 98765 43210</a>
                        </div>
                    </div>

                    <div className="contact-card socials-box">
                        <h4>Join the Community</h4>
                        <div className="social-links-grid">
                            <a href="#" className="social-pill instagram">
                                <img src={assetPath('/assets/icons/instagram.png')} alt="Instagram" />
                            </a>
                            <a href="#" className="social-pill whatsapp">
                                <img src={assetPath('/assets/icons/whatsapp.png')} alt="WhatsApp" />
                            </a>
                            <a href="#" className="social-pill youtube">
                                <img src={assetPath('/assets/icons/youtube.png')} alt="YouTube" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
