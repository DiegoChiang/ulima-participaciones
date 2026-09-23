interface SupabaseLikeError {
  code?: string
  message?: string
}

export function friendlyError(error: unknown): string {
  const candidate = error as SupabaseLikeError
  const message = candidate?.message ?? ''

  if (candidate?.code === '23505') return 'Ya existe un registro con esos datos.'
  if (candidate?.code === '23503') return 'La operación entra en conflicto con datos relacionados.'
  if (candidate?.code === '23514') return 'Uno de los valores está fuera del rango permitido.'
  if (candidate?.code === '42501') return 'No tienes permiso para realizar esta operación.'
  if (/invalid login credentials/i.test(message)) return 'El correo o la contraseña no son correctos.'
  if (/email not confirmed/i.test(message)) return 'Confirma tu correo antes de iniciar sesión.'
  if (/user already registered/i.test(message)) return 'Ya existe una cuenta con ese correo.'
  if (/duplicate key/i.test(message)) return 'Ya existe un registro con esos datos.'
  return message || 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}
