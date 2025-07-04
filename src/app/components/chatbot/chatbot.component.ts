// src\app\components\chatbot\chatbot.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  options?: ChatOption[];
}

interface ChatOption {
  id: string;
  text: string;
  action: string;
  data?: any;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  whatsappNumber = '51993321920'; // Cambia por tu número de WhatsApp

  // Respuestas programadas del bot
  private botResponses = {
    greeting: {
      text: '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      options: [
        { id: 'products', text: '🛍️ Ver productos', action: 'showProducts' },
        { id: 'orders', text: '📦 Estado de pedido', action: 'checkOrder' },
        { id: 'support', text: '💬 Hablar con soporte', action: 'contactSupport' },
        { id: 'info', text: 'ℹ️ Información de la tienda', action: 'storeInfo' }
      ]
    },
    products: {
      text: '¿Qué tipo de productos te interesan?',
      options: [
        { id: 'carnes', text: '🥩 Carnes', action: 'showCategory', data: 'carnes' },
        { id: 'frutas', text: '🍎 Frutas', action: 'showCategory', data: 'frutas' },
        { id: 'hardware', text: '💻 Hardware', action: 'showCategory', data: 'hardware' },
        { id: 'ofertas', text: '🔥 Ofertas especiales', action: 'showOffers' }
      ]
    },
    orders: {
      text: 'Para consultar tu pedido, necesito tu número de orden. ¿Prefieres que te ayude por WhatsApp?',
      options: [
        { id: 'whatsapp_order', text: '📱 Consultar por WhatsApp', action: 'whatsappOrder' },
        { id: 'back', text: '⬅️ Volver al menú', action: 'greeting' }
      ]
    },
    support: {
      text: 'Te conectaré con nuestro equipo de soporte humano a través de WhatsApp. ¿Está bien?',
      options: [
        { id: 'whatsapp_support', text: '📱 Contactar por WhatsApp', action: 'whatsappSupport' },
        { id: 'back', text: '⬅️ Volver al menú', action: 'greeting' }
      ]
    },
    storeInfo: {
      text: 'ℹ️ **Información de la tienda:**\n\n🕒 Horarios: Lun-Dom 8:00-22:00\n🚚 Envío gratis en compras +S/50\n💳 Aceptamos todas las tarjetas\n📱 Soporte 24/7 por WhatsApp',
      options: [
        { id: 'whatsapp_info', text: '📱 Más info por WhatsApp', action: 'whatsappInfo' },
        { id: 'back', text: '⬅️ Volver al menú', action: 'greeting' }
      ]
    },
    offers: {
      text: '🔥 **Ofertas especiales hoy:**\n\n• 50% OFF en carnes selectas\n• 2x1 en frutas frescas\n• Descuento especial en hardware\n\n¿Te interesa alguna?',
      options: [
        { id: 'whatsapp_offers', text: '📱 Ver ofertas completas', action: 'whatsappOffers' },
        { id: 'back', text: '⬅️ Volver al menú', action: 'greeting' }
      ]
    },
    category: {
      text: 'Excelente elección! Te mostraré los mejores productos de esta categoría.',
      options: [
        { id: 'whatsapp_category', text: '📱 Ver catálogo completo', action: 'whatsappCategory' },
        { id: 'back', text: '⬅️ Volver al menú', action: 'greeting' }
      ]
    },
    default: {
      text: 'No entendí tu consulta. ¿Te gustaría hablar directamente con nuestro equipo por WhatsApp?',
      options: [
        { id: 'whatsapp_help', text: '📱 Ayuda por WhatsApp', action: 'whatsappHelp' },
        { id: 'back', text: '⬅️ Volver al menú', action: 'greeting' }
      ]
    }
  };

  ngOnInit() {
    // Mostrar mensaje de bienvenida después de un delay
    setTimeout(() => {
      this.addBotMessage(this.botResponses.greeting);
    }, 1000);
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.isMinimized = false;
  }

  minimizeChat() {
    this.isMinimized = true;
  }

  maximizeChat() {
    this.isMinimized = false;
  }

  closeChat() {
    this.isOpen = false;
    this.isMinimized = false;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    // Agregar mensaje del usuario
    this.addUserMessage(this.currentMessage);
    
    // Procesar respuesta del bot
    this.processUserMessage(this.currentMessage);
    
    this.currentMessage = '';
  }

  selectOption(option: ChatOption) {
    // Agregar la opción seleccionada como mensaje del usuario
    this.addUserMessage(option.text);
    
    // Procesar la acción
    this.processAction(option.action, option.data);
  }

  private addUserMessage(text: string) {
    const message: ChatMessage = {
      id: this.generateId(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.scrollToBottom();
  }

  private addBotMessage(response: any) {
    this.isTyping = true;
    
    setTimeout(() => {
      const message: ChatMessage = {
        id: this.generateId(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        options: response.options || []
      };
      this.messages.push(message);
      this.isTyping = false;
      this.scrollToBottom();
    }, 1500); // Simular tiempo de escritura
  }

  private processUserMessage(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Palabras clave para detectar intención
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      this.addBotMessage(this.botResponses.greeting);
    } else if (lowerMessage.includes('producto') || lowerMessage.includes('comprar') || lowerMessage.includes('tienda')) {
      this.addBotMessage(this.botResponses.products);
    } else if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') || lowerMessage.includes('envío')) {
      this.addBotMessage(this.botResponses.orders);
    } else if (lowerMessage.includes('ayuda') || lowerMessage.includes('soporte') || lowerMessage.includes('problema')) {
      this.addBotMessage(this.botResponses.support);
    } else if (lowerMessage.includes('horario') || lowerMessage.includes('información') || lowerMessage.includes('contacto')) {
      this.addBotMessage(this.botResponses.storeInfo);
    } else if (lowerMessage.includes('oferta') || lowerMessage.includes('descuento') || lowerMessage.includes('promoción')) {
      this.addBotMessage(this.botResponses.offers);
    } else {
      this.addBotMessage(this.botResponses.default);
    }
  }

  private processAction(action: string, data?: any) {
    switch (action) {
      case 'greeting':
        this.addBotMessage(this.botResponses.greeting);
        break;
      case 'showProducts':
        this.addBotMessage(this.botResponses.products);
        break;
      case 'checkOrder':
        this.addBotMessage(this.botResponses.orders);
        break;
      case 'contactSupport':
        this.addBotMessage(this.botResponses.support);
        break;
      case 'storeInfo':
        this.addBotMessage(this.botResponses.storeInfo);
        break;
      case 'showOffers':
        this.addBotMessage(this.botResponses.offers);
        break;
      case 'showCategory':
        this.addBotMessage(this.botResponses.category);
        break;
      case 'whatsappOrder':
        this.openWhatsApp('Hola! Quiero consultar el estado de mi pedido. Mi número de orden es: ');
        break;
      case 'whatsappSupport':
        this.openWhatsApp('Hola! Necesito ayuda con mi compra. ¿Pueden asistirme?');
        break;
      case 'whatsappInfo':
        this.openWhatsApp('Hola! Me gustaría obtener más información sobre la tienda y sus servicios.');
        break;
      case 'whatsappOffers':
        this.openWhatsApp('Hola! Me interesan las ofertas especiales de hoy. ¿Pueden mostrarme el catálogo completo?');
        break;
      case 'whatsappCategory':
        this.openWhatsApp(`Hola! Me interesa ver el catálogo completo de ${data || 'productos'}. ¿Pueden ayudarme?`);
        break;
      case 'whatsappHelp':
        this.openWhatsApp('Hola! Necesito ayuda con una consulta específica.');
        break;
    }
  }

   openWhatsApp(message: string) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${this.whatsappNumber}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

   generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

    scrollToBottom() {
  setTimeout(() => {
    // Verificar si estamos en el browser antes de acceder al DOM
    if (typeof document !== 'undefined') {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  }, 100);
}

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}