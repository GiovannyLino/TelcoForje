import { test, expect } from '@playwright/test'
import { escolher, login } from './_helpers'

test('login → cria oportunidade → anexa arquivo', async ({ page }) => {
  await login(page)

  await page.goto('/oportunidades')
  await page.getByRole('button', { name: 'Nova oportunidade' }).first().click()

  const titulo = `E2E arquivo ${Date.now()}`
  await page.getByLabel('Título').fill(titulo)
  await escolher(page, 'Selecione', 'ACME Telecom') // cliente
  await escolher(page, 'Selecione', 'Análise inicial') // coluna
  await page.getByRole('dialog').getByRole('button', { name: 'Criar oportunidade' }).click()

  await expect(page).toHaveURL(/\/oportunidades\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('heading', { name: titulo })).toBeVisible()

  // Cria pasta e envia um arquivo (workspace na aba Arquivos).
  await page.getByRole('button', { name: 'Nova pasta' }).click()
  await page.getByLabel('Nome').fill('E2E')
  await page.getByRole('button', { name: 'Criar pasta' }).click()

  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'e2e.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('conteudo e2e'),
  })

  await expect(page.getByText('e2e.txt')).toBeVisible()
})
