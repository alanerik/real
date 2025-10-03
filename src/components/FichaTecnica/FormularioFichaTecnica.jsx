import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Form, 
  Input, 
  Button, 
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitResult, setSubmitResult] = React.useState(null);

  // Form ID desde variable de entorno (Astro.js)
  const FORMSPREE_ID = import.meta.env.PUBLIC_FORMSPREE_ID;

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: "onChange", // Validación en tiempo real
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: null, // null para DatePicker
      howDidYouKnow: "",
      newsletter: false,
      terms: false,
      comments: ""
    }
  });

  // Watch para términos y condiciones
  const termsAccepted = watch("terms");

  // Función de envío
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Validar Form ID
      if (!FORMSPREE_ID) {
        throw new Error('Configuración del formulario incompleta. Contacta al administrador.');
      }

      // Preparar datos para Formspree
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: formData,
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
          throw new Error(errorData.errors?.map(err => err.message).join(', ') || 'Datos inválidos');
        }
        throw new Error(`Error ${response.status}: Por favor verifica tu configuración de Formspree`);
      }

      setSubmitResult({ type: 'success', message: '¡Formulario enviado exitosamente!' });
      reset(); // Reset del formulario con React Hook Form
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitResult({ 
        type: 'error', 
        message: error.message || 'Error al enviar el formulario. Intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitResult(null);
  };

  return (
          <Form className="space-y-4 overflow-hidden flex flex-col items-start" onSubmit={handleSubmit(onSubmit)}>
            {/* Información Personal */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ 
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Nombre"
                      
                     
                      variant="flat"
                      isInvalid={!!errors.firstName}
                      errorMessage={errors.firstName?.message}
                    />
                  )}
                />
                
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ 
                    required: "El apellido es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Apellido"
                      
                      variant="flat"
                      isInvalid={!!errors.lastName}
                      errorMessage={errors.lastName?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="email"
                control={control}
                rules={{
                  required: "El email es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Formato de email inválido"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Email"
                   
                    type="email"
                    variant="flat"
                    className="mt-4"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^\+?[\d\s\-\(\)]{8,}$/,
                      message: "Formato de teléfono inválido"
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Teléfono"
                     
                      type="tel"
                      variant="flat"
                      isInvalid={!!errors.phone}
                      errorMessage={errors.phone?.message}
                    />
                  )}
                />

                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <DatePicker
                      {...field}
                      label="Fecha de Nacimiento"
                    
                      variant="flat"
                      showMonthAndYearPickers
                      aria-label="Date (Show Month and Year Picker)"
                      value={value || null}
                      onChange={(date) => {
                        // Convertir el objeto fecha a string para React Hook Form
                        if (date) {
                          onChange(date);
                        } else {
                          onChange(null);
                        }
                      }}
                      isInvalid={!!errors.birthDate}
                      errorMessage={errors.birthDate?.message}
                    />
                  )}
                />
              </div>
            </div>

            <Divider />

            {/* Preferencias */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Preferencias</h3>
              
              <Controller
                name="howDidYouKnow"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    label="¿Cómo conociste nuestro servicio?"
                    orientation="vertical"
                    isInvalid={!!errors.howDidYouKnow}
                    errorMessage={errors.howDidYouKnow?.message}
                  >
                    <Radio value="social_media">Redes Sociales</Radio>
                    <Radio value="search_engine">Buscador (Google, etc.)</Radio>
                    <Radio value="recommendation">Recomendación</Radio>
                    <Radio value="advertising">Publicidad</Radio>
                    <Radio value="other">Otro</Radio>
                  </RadioGroup>
                )}
              />

              <div className="mt-4 space-y-2">
                <Controller
                  name="newsletter"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      isSelected={value}
                      onValueChange={onChange}
                    >
                      Quiero recibir noticias y actualizaciones por email
                    </Checkbox>
                  )}
                />
                
                <Controller
                  name="terms"
                  control={control}
                  rules={{ required: "Debes aceptar los términos y condiciones" }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <div>
                      <Checkbox
                        {...field}
                        isSelected={value}
                        onValueChange={onChange}
                        color={value ? "success" : "default"}
                        isInvalid={!!errors.terms}
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
                      {errors.terms && (
                        <p className="text-tiny text-danger mt-1 ml-8">
                          {errors.terms.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <Divider />

            {/* Comentarios adicionales */}
            <Controller
              name="comments"
              control={control}
              rules={{
                maxLength: { value: 500, message: "Máximo 500 caracteres" }
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Comentarios adicionales (opcional)"
                  
                  variant="flat"
                  isInvalid={!!errors.comments}
                  errorMessage={errors.comments?.message}
                />
              )}
            />

            {/* Botones */}
            <div className="flex gap-3 justify-start pt-4">
              <Button
                type="button"
                variant="flat"
                onPress={handleReset}
                isDisabled={isSubmitting}
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isSubmitting}
                loadingText="Enviando..."
                isDisabled={!termsAccepted || isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Formulario"}
              </Button>
            </div>

            {/* Resultado de éxito */}
            {submitResult?.type === 'success' && (
              <Card className="mt-6">
                <CardBody>
                  <h4 className="font-semibold mb-2 text-success">
                    {submitResult.message}
                  </h4>
                  <p className="text-small text-default-600">
                    Hemos recibido tu información y te contactaremos pronto.
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Mensaje de error */}
            {submitResult?.type === 'error' && (
              <Card className="mt-6 border-danger">
                <CardBody>
                  <h4 className="font-semibold mb-2 text-danger">
                    Error al enviar el formulario
                  </h4>
                  <p className="text-small text-danger">
                    {submitResult.message}
                  </p>
                  <Button 
                    size="sm" 
                    color="danger" 
                    variant="flat" 
                    onPress={() => setSubmitResult(null)}
                    className="mt-2"
                  >
                    Cerrar
                  </Button>
                </CardBody>
              </Card>
            )}
          </Form>
  );
}