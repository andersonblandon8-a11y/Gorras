import { formatCOP } from './currencyFormatter.js';

/**
 * Genera el enlace de WhatsApp estructurado con los datos de la gorra y el formulario opcional
 */
export const buildWhatsAppLink = (phone, cap, formData = null) => {
  // Limpiar número de teléfono removiendo caracteres no numéricos
  const cleanPhone = (phone || '573502522375').replace(/\D/g, '');

  let message = '';

  if (formData && (formData.nombre || formData.direccion || formData.telefono)) {
    message += `¡Hola! 👋 Deseo realizar el siguiente pedido:\n\n`;
    message += `🧢 *Gorra:* ${cap.nombre}\n`;
    message += `💰 *Precio:* ${formatCOP(cap.precio)}\n`;
    message += `🎨 *Color:* ${cap.color} | 🏷️ *Categoría:* ${cap.categoria}\n\n`;
    message += `📋 *DATOS DE ENVÍO:*\n`;
    if (formData.nombre) message += `👤 *Nombre:* ${formData.nombre}\n`;
    if (formData.telefono) message += `📞 *Teléfono:* ${formData.telefono}\n`;
    if (formData.ciudad) message += `🏙️ *Ciudad/Municipio:* ${formData.ciudad}\n`;
    if (formData.direccion) message += `📍 *Dirección:* ${formData.direccion}\n`;
    if (formData.notas) message += `📝 *Notas:* ${formData.notas}\n`;
    message += `\n¡Quedo atento a la confirmación y método de despacho! 🚚`;
  } else {
    // Pedido directo sin llenar el formulario
    message += `¡Hola! 👋 Me interesa comprar la gorra:\n`;
    message += `🧢 *${cap.nombre}*\n`;
    message += `💰 *Precio:* ${formatCOP(cap.precio)}\n`;
    message += `🎨 *Color:* ${cap.color}\n`;
    message += `🏷️ *Categoría:* ${cap.categoria}\n\n`;
    message += `¿Tienen disponibilidad para envío inmediato? 📦`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};
