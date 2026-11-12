import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery.'
        },
        {
          q: 'Do you offer free shipping?',
          a: 'Yes! We offer free shipping on orders over $50. Standard shipping is also available at a flat rate of $5.99.'
        },
        {
          q: 'Can I track my order?',
          a: 'Absolutely! You\'ll receive a tracking number via email once your order ships. You can use it to track your package in real-time.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy on most items. Products must be unused and in original packaging.'
        },
        {
          q: 'How do I initiate a return?',
          a: 'Log into your account, go to your orders, and click "Return Item". Follow the instructions to print your return label.'
        },
        {
          q: 'How long does a refund take?',
          a: 'Once we receive your return, refunds are processed within 5-7 business days.'
        }
      ]
    },
    {
      category: 'Payment & Security',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay for your convenience.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes! We use industry-leading SSL encryption to protect your payment information.'
        },
        {
          q: 'Can I save my payment information?',
          a: 'Yes, you can securely save your payment methods to your account for faster checkout.'
        }
      ]
    },
    {
      category: 'Account & Orders',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button in the top right corner and fill in your information. It only takes a minute!'
        },
        {
          q: 'Can I modify my order after placing it?',
          a: 'If your order hasn\'t shipped yet, contact our support team immediately and we\'ll help you make changes.'
        },
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page and follow the instructions sent to your email.'
        }
      ]
    },
    {
      category: 'Products & Inventory',
      questions: [
        {
          q: 'Are all products in stock?',
          a: 'We update inventory in real-time. If an item shows as available, it\'s in stock and ready to ship.'
        },
        {
          q: 'Can I pre-order items?',
          a: 'Yes! Some items are available for pre-order. You\'ll be notified when they\'re ready to ship.'
        },
        {
          q: 'Do you offer product warranties?',
          a: 'Many of our products come with manufacturer warranties. Check the product details for specific warranty information.'
        }
      ]
    },
    {
      category: 'Customer Support',
      questions: [
        {
          q: 'How can I contact customer support?',
          a: 'You can reach us via email at support@orebi.com, phone at +1 (555) 123-4567, or through our contact form.'
        },
        {
          q: 'What are your business hours?',
          a: 'We\'re available Monday-Friday, 9 AM - 6 PM EST. We respond to emails within 24 hours.'
        },
        {
          q: 'Do you have a live chat?',
          a: 'Yes! Live chat is available during business hours on our website.'
        }
      ]
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 md:py-24">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-300">Find answers to common questions</p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-12">
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, qIndex) => {
                  const globalIndex = sectionIndex * 100 + qIndex;
                  return (
                    <div key={qIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.q}</h3>
                        <ChevronDown
                          size={24}
                          className={`text-gray-600 flex-shrink-0 transition-transform ${
                            openIndex === globalIndex ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openIndex === globalIndex && (
                        <div className="px-6 py-4 bg-white border-t border-gray-200">
                          <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

