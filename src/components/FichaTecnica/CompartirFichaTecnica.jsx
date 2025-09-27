import React, { useState } from 'react';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Card,
  CardBody 
} from '@heroui/react';

export default function SharePropertyButton({ property, currentUrl }) {
  const [copied, setCopied] = useState(false);

  // Construir el mensaje para compartir
  const shareMessage = `🏠 ${property.title || 'Propiedad'}\n📍 ${property.city || ''}\n💰 ${property.price ? `$${property.price.toLocaleString()}` : 'Consultar precio'}\n\n¡Mira esta increíble propiedad!`;
  
  // URL actual de la propiedad
  const propertyUrl = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // Función para copiar al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para compartir por WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(`${shareMessage}\n\n${propertyUrl}`);
    const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Iconos SVG
  const ShareIcon = () => (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
      />
    </svg>
  );

  const CopyIcon = () => (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
      />
    </svg>
  );

  const CheckIcon = () => (
    <svg 
      className="w-4 h-4 text-success" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  );

  const WhatsAppIcon = () => (
    <svg 
      className="w-4 h-4 text-success" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  );

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          color="primary"
          variant="solid"
          startContent={<ShareIcon />}
          size="md"
        >
          Compartir
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Opciones de compartir"
        variant="flat"
      >
        <DropdownItem
          key="copy"
          startContent={copied ? <CheckIcon /> : <CopyIcon />}
          onPress={copyToClipboard}
          color={copied ? "success" : "default"}
        >
          {copied ? '¡Copiado!' : 'Copiar enlace'}
        </DropdownItem>
        <DropdownItem
          key="whatsapp"
          startContent={<WhatsAppIcon />}
          onPress={shareOnWhatsApp}
        >
          Compartir por WhatsApp
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}