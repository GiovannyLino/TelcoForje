import { test, expect } from '@playwright/test'
import { escolher, login } from './_helpers'

test('reserva sobreposta é bloqueada com mensagem de conflito', async ({ page }) => {
  await login(page)
  await page.goto('/lab')

  // Data/hora únicas para não colidir com execuções anteriores.
  const dia = new Date()
  dia.setDate(dia.getDate() + 30)
  const d = dia.toISOString().slice(0, 10)
  const h = 8 + (new Date().getSeconds() % 8)
  const hh = String(h).padStart(2, '0')

  // 1ª reserva num recurso sem reservas no seed — deve funcionar.
  await page.getByRole('button', { name: 'Reservar laboratório' }).first().click()
  await escolher(page, 'Selecione', 'Créditos OCI')
  await page.getByLabel('Início').fill(`${d}T${hh}:00`)
  await page.getByLabel('Fim').fill(`${d}T${String(h + 2).padStart(2, '0')}:00`)
  await page.getByRole('dialog').getByRole('button', { name: 'Reservar laboratório' }).click()
  await expect(page.getByText('Laboratório reservado')).toBeVisible()

  // 2ª reserva sobrepondo a primeira — o banco bloqueia e a UI mostra o conflito.
  await page.getByRole('button', { name: 'Reservar laboratório' }).first().click()
  await escolher(page, 'Selecione', 'Créditos OCI')
  await page.getByLabel('Início').fill(`${d}T${String(h + 1).padStart(2, '0')}:00`)
  await page.getByLabel('Fim').fill(`${d}T${String(h + 3).padStart(2, '0')}:00`)
  await page.getByRole('dialog').getByRole('button', { name: 'Reservar laboratório' }).click()

  await expect(page.getByText(/Conflito:/)).toBeVisible()
})
