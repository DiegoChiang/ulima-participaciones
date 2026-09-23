import { expect, test } from '@playwright/test'

const configuredEmail = process.env.E2E_EMAIL
const configuredPassword = process.env.E2E_PASSWORD

test.describe('authenticated academic flow', () => {
  test('manages a section, student, group, and both participation types', async ({ page }, testInfo) => {
    const suffix = `${Date.now().toString().slice(-6)}-${testInfo.project.name.replace(/[^a-z0-9]/gi, '')}`
    const email = configuredEmail ?? `e2e-${suffix}@example.test`
    const password = configuredPassword ?? 'LocalE2Epass!2026'

    await page.goto(configuredEmail && configuredPassword ? '/login' : '/register')
    await page.getByLabel('Correo electrónico').fill(email)
    await page.getByLabel('Contraseña').fill(password)
    await page.getByRole('button', { name: configuredEmail && configuredPassword ? 'Iniciar sesión' : 'Crear cuenta' }).click()
    await expect(page.getByRole('heading', { name: 'Secciones', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Nueva sección' }).click()
    await page.getByLabel('Curso').fill(`Física E2E ${suffix}`)
    await page.getByRole('dialog', { name: 'Nueva sección' }).getByLabel('Sección').fill('701')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.getByRole('link', { name: new RegExp(`Física E2E ${suffix}`) }).click()

    await page.getByRole('button', { name: 'Agregar alumno' }).click()
    await page.getByLabel('Código de alumno').fill(`E2E${suffix}`)
    await page.getByLabel('Nombres').fill('Ana')
    await page.getByLabel('Apellidos').fill('Prueba')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText(`E2E${suffix}`)).toBeVisible()

    await page.getByRole('link', { name: 'Grupos' }).click()
    await page.getByRole('button', { name: 'Crear grupo' }).click()
    await page.getByLabel('Nombre del grupo').fill('Grupo E2E')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.getByLabel('Grupo de Ana Prueba').selectOption({ label: 'Grupo E2E' })
    await expect(page.getByText('Asignación de grupo actualizada.')).toBeVisible()

    await page.getByRole('link', { name: 'Participaciones individuales' }).click()
    await page.getByRole('link', { name: 'Nuevo registro' }).click()
    await page.getByRole('button', { name: /Prueba, Ana, oportunidad 1: 0 puntos/ }).click()
    await expect(page.getByRole('button', { name: /Prueba, Ana, oportunidad 1: 1 punto/ })).toBeVisible()
    await page.getByRole('button', { name: 'Guardar registro' }).click()
    await expect(page.getByText('Historial ordenado desde la participación más reciente.')).toBeVisible()

    await page.getByRole('link', { name: 'Participaciones grupales' }).click()
    await page.getByRole('link', { name: 'Nuevo registro' }).click()
    await page.getByRole('button', { name: /Grupo E2E, oportunidad 12: 0 puntos/ }).click()
    await page.getByRole('button', { name: 'Guardar registro' }).click()
    await expect(page.getByRole('link', { name: 'Editar' }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible()
  })
})
