import React from "react";
import {
  Form, 
  Input, 
  Button, 
  Select, 
  SelectItem,
  Textarea,
  Checkbox,
  RadioGroup,
  Radio,
  DatePicker,
  Card,
  CardBody,
  Divider
} from "@heroui/react";

export default function App() {
  const [submitted, setSubmitted] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  
  // Form ID desde variable de entorno (Astro.js)
  const FORMSPREE_ID = import.meta.env.PUBLIC_FORMSPREE_ID;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar términos y condiciones
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    // Validar que el Form ID esté configurado
    if (!FORMSPREE_ID) {
      setError('Configuración del formulario incompleta. Contacta al administrador.');
      return;
    }

    setIsLoading(true);

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      
      // OPCIÓN 1: Usar FormData directamente (recomendado para Formspree)
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: formData, // Usar FormData en lugar de JSON
        headers: {
          'Accept': 'application/json'
          // No incluir Content-Type, el browser lo establece automáticamente para FormData
        }
      });

      if (!response.ok) {
        // Manejo específico para errores 403
        if (response.status === 403) {
          throw new Error('Acceso denegado. Verifica: 1) Tu Form ID sea correcto, 2) Tu dominio esté autorizado en Formspree, 3) Hayas confirmado tu email si es la primera vez.');
        }
        // Si es un error de validación de Formspree, mostrar el mensaje específico
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.map(err => err.message).join(', ') || 'Datos inválidos');
        }
        throw new Error(`Error ${response.status}: Por favor verifica tu configuración de Formspree`);
      }

      const result = await response.json();
      setSubmitted(data);
      
      // Resetear formulario después del éxito
      setTimeout(() => {
        document.querySelector('form').reset();
      }, 100);
      
    } catch (error) {
      console.error('Error detallado:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Error de conexión. Verifica que tu Form ID de Formspree sea correcto y que tengas conexión a internet.');
      } else {
        setError(error.message || 'Error al enviar el formulario. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setError(null);
    setTermsAccepted(false);
    document.querySelector('form').reset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold mb-6 text-center">Formulario de Registro</h2>
          
          <Form className="space-y-4" onSubmit={onSubmit}>
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Nombre"
                  labelPlacement="outside"
                  name="firstName"
                  placeholder="Ingresa tu nombre"
                  variant="bordered"
                />
                
                <Input
                  isRequired
                  label="Apellido"
                  labelPlacement="outside"
                  name="lastName"
                  placeholder="Ingresa tu apellido"
                  variant="bordered"
                />
              </div>

              <Input
                isRequired
                errorMessage="Por favor ingresa un email válido"
                label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="ejemplo@correo.com"
                type="email"
                variant="bordered"
                className="mt-4"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Teléfono"
                  labelPlacement="outside"
                  name="phone"
                  placeholder="+54 11 1234-5678"
                  type="tel"
                  variant="bordered"
                />

                <DatePicker
                  label="Fecha de Nacimiento"
                  labelPlacement="outside"
                  name="birthDate"
                  variant="bordered"
                />
              </div>
            </div>

            <Divider />

            {/* Preferencias */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Preferencias</h3>
              
              <RadioGroup
                label="¿Cómo conociste nuestro servicio?"
                name="howDidYouKnow"
                orientation="vertical"
              >
                <Radio value="social_media">Redes Sociales</Radio>
                <Radio value="search_engine">Buscador (Google, etc.)</Radio>
                <Radio value="recommendation">Recomendación</Radio>
                <Radio value="advertising">Publicidad</Radio>
                <Radio value="other">Otro</Radio>
              </RadioGroup>

              <div className="mt-4">
                <Checkbox name="newsletter">
                  Quiero recibir noticias y actualizaciones por email
                </Checkbox>
                <Checkbox 
                  name="terms" 
                  className="mt-2"
                  isSelected={termsAccepted}
                  onValueChange={setTermsAccepted}
                  isRequired
                  color={termsAccepted ? "success" : "default"}
                >
                  <span className="text-small">
                    Acepto los{" "}
                    <a 
                      href="/terminos-y-condiciones" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary-600"
                    >
                      términos y condiciones
                    </a>
                    {" "}*
                  </span>
                </Checkbox>
                {!termsAccepted && (
                  <p className="text-tiny text-danger mt-1 ml-8">
                    Campo obligatorio
                  </p>
                )}
              </div>
            </div>

            <Divider />

            {/* Comentarios adicionales */}
            <Textarea
              label="Comentarios adicionales (opcional)"
              labelPlacement="outside"
              name="comments"
              placeholder="¿Algo más que quieras contarnos?"
              variant="bordered"
            />

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="flat"
                onPress={resetForm}
                isDisabled={isLoading}
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                loadingText="Enviando..."
                isDisabled={!termsAccepted}
              >
                {isLoading ? "Enviando..." : "Enviar Formulario"}
              </Button>
            </div>

            {/* Resultado de éxito */}
            {submitted && (
              <Card className="mt-6">
                <CardBody>
                  <h4 className="font-semibold mb-2 text-success">
                    ¡Formulario enviado exitosamente!
                  </h4>
                  <p className="text-small text-default-600">
                    Hemos recibido tu información y te contactaremos pronto.
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Mensaje de error */}
            {error && (
              <Card className="mt-6 border-danger">
                <CardBody>
                  <h4 className="font-semibold mb-2 text-danger">
                    Error al enviar el formulario
                  </h4>
                  <p className="text-small text-danger">
                    {error}
                  </p>
                  <Button 
                    size="sm" 
                    color="danger" 
                    variant="flat" 
                    onPress={() => setError(null)}
                    className="mt-2"
                  >
                    Cerrar
                  </Button>
                </CardBody>
              </Card>
            )}
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}