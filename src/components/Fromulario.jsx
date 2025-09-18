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
  
  // ⚠️ REEMPLAZA CON TU FORM ID DE FORMSPREE
  const FORMSPREE_ID = "xvgbeopr";

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      
      // Enviar a Formspree
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSubmitted(data);
      
      // Resetear formulario después del éxito
      setTimeout(() => {
        document.querySelector('form').reset();
      }, 100);
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setError(error.message || 'Error al enviar el formulario. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setError(null);
    document.querySelector('form').reset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold mb-6 text-center">Contacto</h2>
          
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
                <Checkbox name="terms" className="mt-2">
                  <span className="text-small">
                    Acepto los{" "}
                    <a href="#" className="text-primary underline">
                      términos y condiciones
                    </a>
                  </span>
                </Checkbox>
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
                  <p className="text-small text-default-600 mb-3">
                    Hemos recibido tu información y te contactaremos pronto.
                  </p>
                  <div className="text-small text-default-600">
                    <details>
                      <summary className="cursor-pointer">Ver datos enviados</summary>
                      <pre className="mt-2 p-3 bg-default-100 rounded-small overflow-auto">
                        {JSON.stringify(submitted, null, 2)}
                      </pre>
                    </details>
                  </div>
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