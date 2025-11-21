import React from "react";
import { Form, Input, Button } from "@heroui/react";
import { showToast } from "./ToastManager";

export default function NoticiasInput() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form ID desde variable de entorno (Astro.js)
  const FORMSPREE_ID = import.meta.env.PUBLIC_FORMSPREE_ID || import.meta.env.PUBLIC_FORMSPREE_NEWSLETTER_ID;

  // Función de envío
  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Obtener datos del formulario
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email');

      // Validar Form ID
      if (!FORMSPREE_ID) {
        throw new Error('Configuración del newsletter incompleta. Contacta al administrador.');
      }

      // Preparar datos para Formspree
      const submitData = new FormData();
      submitData.append('email', email);
      submitData.append('newsletter_signup', 'true');
      submitData.append('source', 'footer_newsletter');
      submitData.append('timestamp', new Date().toISOString());

      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: submitData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Acceso denegado. Verifica la configuración de Formspree.');
        }
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.map(err => err.message).join(', ') || 'Email inválido');
        }
        throw new Error(`Error ${response.status}: Por favor verifica tu configuración de Formspree`);
      }

      // Mostrar toast de éxito
      showToast({
        title: "¡Suscripción exitosa!",
        description: "Gracias por suscribirte. Te mantendremos informado.",
        color: "success",
        timeout: 5000,
      });

      // Reset del formulario
      e.target.reset();

    } catch (error) {
      console.error('Error al suscribirse al newsletter:', error);

      // Mostrar toast de error
      showToast({
        title: "Error al suscribirse",
        description: error.message || 'Error al suscribirse. Intenta nuevamente.',
        color: "danger",
        timeout: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Form className="w-full max-w-xs" onSubmit={onSubmit}>
        <Input
          name="email"
          required
          type="email"
          label="Email"
          errorMessage="Por favor ingresa un email válido"
          isDisabled={isSubmitting}
        />

        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? "Enviando..." : "Suscribirse"}
        </Button>

        {/* Términos pequeños */}
        <p className="text-xs text-gray-500">
          Al suscribirte, aceptas recibir emails con ofertas y noticias inmobiliarias.
        </p>
      </Form>
    </div>
  );
}