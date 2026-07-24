import { expect, type Page } from '@playwright/test'

export async function login(page: Page, email = 'ana@uplink.dev', senha = 'uplink123') {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('http://localhost:5173/', { timeout: 15_000 })
}

/** Seleciona uma opção num Radix Select identificado pelo texto atual do gatilho. */
export async function escolher(page: Page, gatilhoTexto: string, opcao: string) {
  await page.getByRole('combobox').filter({ hasText: gatilhoTexto }).first().click()
  await page.getByRole('option', { name: opcao }).click()
}
