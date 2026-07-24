import { test, expect } from '@playwright/test'
import { escolher, login } from './_helpers'

test('preenche discovery → finaliza → exporta PDF', async ({ page }) => {
  await login(page)
  await page.goto('/discovery')

  await page.getByRole('button', { name: 'Novo discovery' }).first().click()
  await escolher(page, 'Selecione', /SD-WAN gerenciado/) // oportunidade
  await escolher(page, 'Selecione', /Rede Corporativa/) // template
  await page.getByRole('button', { name: 'Começar' }).click()

  await expect(page).toHaveURL(/\/discovery\/[0-9a-f-]{36}$/)

  // Preenche o primeiro campo (número) e finaliza.
  await page.getByRole('spinbutton').first().fill('12')
  await page.getByRole('button', { name: 'Finalizar discovery' }).click()

  // Vira resumo com opções de exportação.
  await expect(page.getByRole('button', { name: 'Copiar como Markdown' })).toBeVisible()

  const exportar = page.getByText('Exportar PDF')
  await expect(exportar).toBeVisible({ timeout: 15_000 })
  const [download] = await Promise.all([page.waitForEvent('download'), exportar.click()])
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
})
