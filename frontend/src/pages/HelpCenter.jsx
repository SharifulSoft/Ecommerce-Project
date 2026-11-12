import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = React.useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. Follow the payment instructions to complete your purchase.'
    },
    {
      id: 2,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all items. Items must be in original condition with tags attached.'
    },
    {
      id: 3,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.'
    },
    {
      id: 4,
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
      
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow-md">
            <button
              onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  openFaq === faq.id ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openFaq === faq.id && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
        <p className="text-gray-700 mb-4">Contact our support team at support@classyshop.com</p>
      </div>
    </div>
  );
}

