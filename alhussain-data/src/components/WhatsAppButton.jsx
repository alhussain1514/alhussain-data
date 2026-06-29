import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '2347042728644'

export default function WhatsAppButton() {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hi, I need help with my AL-HUSSAIN DATA account.'
  )}`

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg
                 flex items-center justify-center hover:scale-105 transition-transform duration-150"
    >
      <MessageCircle size={28} className="text-white" fill="white" strokeWidth={0} />
    </a>
  )
}
