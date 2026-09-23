import { expect, test } from '@playwright/test'

test('protected routes redirect to login and the page remains usable', async ({ page }) => {
  await page.goto('/sections/not-authorized/students')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
  await expect(page.getByLabel('Correo electrónico')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll')
})

test('registration form is reachable', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
})
