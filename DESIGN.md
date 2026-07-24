# DESIGN.md — TelcoForge

> Sistema visual de um **instrumento de engenharia** usado o dia inteiro, muitas vezes ao vivo numa reunião com o cliente e a tela compartilhada. Denso em informação, calmo, legível, rápido. **Não** é um dashboard genérico.

---

## 1. Princípio visual

Três palavras guiam toda decisão: **instrumento, calma, densidade honesta**.

- A estrutura vem de **hairlines de 1px e contraste de fundo**, não de sombra e cantos arredondados.
- **Uma cor de destaque** (`signal`). Os semânticos (`live/warn/halt`) só marcam estado — nunca decoram.
- **Todo dado técnico é monoespaçado.** IP, ASN, porta, ID, timestamp, rack, MTU, storage_path. Isso não é enfeite: é a textura pela qual o produto é reconhecido por quem lê redes o dia inteiro.

Anti-metas explícitas: `rounded-2xl`, gradientes decorativos, múltiplas cores de destaque, emoji como ícone, sombra difusa em card, animação de entrada.

---

## 2. Paleta final

Declarada via `@theme` no CSS (Tailwind v4). Variante escura por `@media (prefers-color-scheme)` + `:root[data-theme]`. Contraste alvo **AA** (verificar na Fase 0).

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-paper` | `#F2F4F7` | `#0B1220` | fundo da aplicação (cinza-frio) |
| `--color-surface` | `#FFFFFF` | `#111A2B` | painéis e cards |
| `--color-surface-2` | `#F7F8FB` | `#16223A` | linha zebrada, hover de linha, faixa |
| `--color-ink` | `#0F1A2A` | `#E6ECF5` | texto principal |
| `--color-muted` | `#5B6B80` | `#8494A8` | texto secundário, labels, ticks |
| `--color-line` | `#D5DBE4` | `#1F2C42` | hairline 1px — a estrutura |
| `--color-line-strong` | `#C2CAD6` | `#2A3A56` | divisor de seção |
| `--color-signal` | `#0B5FFF` | `#4C86FF` | ação primária, foco, seleção |
| `--color-signal-weak` | `#E6EEFF` | `#16233F` | fundo de seleção/realce |
| `--color-live` | `#12A594` | `#2DD4BF` | reservado / ativo / validado |
| `--color-warn` | `#B45309` | `#E0A34A` | vencendo / pendente |
| `--color-halt` | `#D1372F` | `#F0655D` | conflito / vencido / erro |
| `--color-*-weak` | tints 8–12% | tints escuros | fundo de badge/estado |

```css
/* ilustração — vai para src/app/theme.css na Fase 0, sem tailwind.config.js */
@import "tailwindcss";
@theme {
  --color-paper: #F2F4F7;  --color-surface: #FFFFFF;  --color-ink: #0F1A2A;
  --color-signal: #0B5FFF; --color-live: #12A594; --color-warn: #B45309; --color-halt: #D1372F;
  --radius: 4px;
  --font-display: "Space Grotesk", ui-sans-serif; --font-sans: "Inter", ui-sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace;
}
```

---

## 3. Tipografia

Via Fontsource (local, sem CDN).

| Fonte | Papel | Pesos |
|---|---|---|
| **Space Grotesk** | títulos, números grandes, **nomes de recurso**. Personalidade técnica, com restrição. | 500 títulos de seção · 600 H1 e números-herói |
| **Inter** | corpo, formulários, tabelas | 400 corpo · 500 labels · 600 cabeçalho de tabela / botão |
| **JetBrains Mono** | **todo dado técnico**: IDs, IPs, ASNs, timestamps, portas, nomes de arquivo, chaves de metadata, faixa de ocupação | 400 padrão · 500 valor em destaque (ex.: "agora") |

**Escala:** `12 · 13 · 14 · 16 · 20 · 28 · 40`. Corpo em **14** (interface densa). Line-height **1.1** em títulos, **1.55** no corpo. `12` reservado a ticks e microlabels; `40` só ao número-herói do dashboard.

---

## 4. Layout e grade

- Grade de **8px**. Raio **4px** em tudo. Sem `rounded-2xl`.
- **Sombra só em elemento flutuante** (popover, dropdown, dialog, command palette). Card e painel = borda `line` 1px.
- **Shell:**

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ⌘K  buscar…            ● ACME · SD-WAN campus          ◐ tema   AR ▾        │  topbar 48px
├──────┬────────────────────────────────────────────────────┬─────────────────┤
│ ▨ Dia │                                                    │  TRILHO DE      │
│ ◆ Opp │            CONTEÚDO                                 │  CONTEXTO       │
│ ▤ Kan │            (denso, hairlines)                       │  (só em telas   │
│ ▥ Lab │                                                    │   de oportuni-  │
│ ✎ Disc│                                                    │   dade)         │
│ ▦ Tmpl│                                                    │                 │
│  ‹     │                                                    │                 │
└──────┴────────────────────────────────────────────────────┴─────────────────┘
  sidebar colapsável (‹)          conteúdo fluido            rail 320px fixo
```

---

## 5. Elemento-assinatura — a **faixa de ocupação**

Uma barra horizontal de ocupação temporal por recurso, visualmente parente de um **gráfico de utilização de link**. É onde investimos; o resto fica sóbrio.

**Anatomia (densidade completa, no calendário):**

```
 licenca · Cisco DNA Center            R12 · Gi1/0/24            expira 30d
 00   03   06   09   12   15   18   21   00   03   06   09   12   ← ticks mono 12px
 ┃····███████████░░░░░░░░▓▓▓▓▓···················██████░░░░····┃
             │ativa (live)│  │manut.(hachura)│         │ativa│   │
                        ▲ agora (linha fina signal)
 hover ▶  Ana Reis · PoC ACME · 09:00→15:00 · 24/07
```

- **Trilha:** fundo `surface-2`, borda `line`. Ticks de hora/dia em **mono 12 `muted`**.
- **Blocos de reserva:** preenchidos, cor pelo `status` (`live` ativa · `warn` a vencer · `halt` conflito). Borda 1px mais escura da mesma cor.
- **Janela de manutenção:** hachura diagonal (não cor cheia) — lê-se como "indisponível", não "ocupado".
- **Marcador "agora":** linha vertical fina `signal`, 1px, com rótulo mono do horário no topo.
- **Três densidades:** `mini` (lista/inventário: só a trilha com blocos, 6px alt.) · `média` (card do recurso: + ticks de dia + label) · `completa` (calendário: + interação).

**Interação:** hover → tooltip com quem reservou, finalidade, intervalo (mono). Arrastar bloco → reagendar (otimista). Selecionar intervalo vazio → nova reserva.
**A11y:** `role="img"` + `aria-label` textual ("Ocupação de Cisco DNA Center: reservado 24/07 09:00–15:00 por Ana Reis; manutenção 16:00–18:00"). Blocos navegáveis por teclado; `prefers-reduced-motion` desativa a animação do "agora".

---

## 6. Wireframes (5 telas principais)

**6.1 Dashboard — visão do dia**
```
┌ Bom dia, Ana ─────────────────────────────────  quarta, 23 jul · São Paulo ┐
│  ┌ Meus cards ────────┐ ┌ Reservas hoje ─────┐ ┌ Vencendo ───────────────┐ │
│  │ Análise      2      │ │ 09:00 DNA Center    │ │ ⚠ 3 licenças ≤7d        │ │
│  │ Topologia    3      │ │ 14:00 Lab-rack R12  │ │ ⚠ 1 prazo hoje: ACME    │ │
│  │ Revisão      1  ▂▅▂ │ │ [ver faixa]         │ │ [abrir]                 │ │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────────┘ │
│  ┌ Discoveries incompletos ─────────┐ ┌ Mural (passagem de turno) ────────┐ │
│  │ ACME · SD-WAN      68% ▓▓▓▓▓▓░░   │ │ 📌 manut. rack R12 sáb 08h        │ │
│  │ Volt · Última milha 20% ▓▓░░░░░░  │ │ vencimento: conta demo AWS 26/07  │ │
│  └───────────────────────────────────┘ └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**6.2 Tela da oportunidade — a espinha (com trilho)**
```
┌ ACME · SD-WAN campus ──────── Topologia ▾  prioridade alta  prazo 25/07 ┐│ TRILHO
│ descrição · dono Ana Reis · cliente ACME · tags [sd-wan][campus]        ││ Arquivos (4)
│                                                                         ││  topo-v3.drawio
│ [ Arquivos ] [ Documentos ] [ Discoveries ] [ Reservas ] [ Atividade ]  ││  bom-v2.pdf
│ ─────────────────────────────────────────────────────────────────────  ││ Reservas (2)
│  📁 Time / Topologias                                                    ││  DNA 24/07 ▓▓
│    topologia-acme-v3.drawio    2.1 MB   v3   Ana   [prévia][versões]     ││ Discoveries (1)
│    baseline-links.xlsx          88 KB   v1   Léo                          ││  SD-WAN 68%
│  📁 Privada / Rascunhos (só você)                                        ││ Atividade
│    proposta-tecnica.md          docs    —    Ana                          ││  Ana anexou v3
└─────────────────────────────────────────────────────────────────────────┘│  Léo reservou…
```

**6.3 Kanban de soluções**
```
 filtros: [responsável ▾][cliente ▾][prioridade ▾][prazo ▾]        N nova opp
┌ Análise ──2─┐ ┌ Topologia ─3─┐ ┌ Revisão ─1─┐ ┌ Validado ─2─┐ ┌ Entregue ─0─┐
│ Volt · milha│ │ ACME · SD-WAN│ │ Nexa · obsv │ │ Rede Sul    │ │             │
│ alta ⚑ 26/07│ │ alta  25/07  │ │ média       │ │ live        │ │  (vazio:    │
│ ▂▂ Léo      │ │ ▂▂ Ana       │ │ ▂▂ Ana      │ │ ▂▂ Rui      │ │  convite)   │
│ ─────────── │ │ ─────────── │ │             │ │             │ │             │
│ Sig · cloud │ │ …           │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
  card = oportunidade · vencido fica com barra halt à esquerda · dnd otimista
```

**6.4 Lab — calendário + faixa + inventário**
```
┌ Lab & recursos ─────────────── [semana|mês]  ‹ 22–28 jul ›   + reservar ┐
│ Recurso              00  06  12  18  00  06  12  18  00  06  12  18       │
│ DNA Center (lic)     ····███████░░▓▓···········██████░░········           │
│ Lab-rack R12 (srv)   ██████··········████████████░░············          │
│ Porta Gi1/0/24       ············████··········································│
│ Conta demo AWS       ⚠ expira 26/07 ·····································    │
│ ─────────────────────────────────────────────────────────────────────── │
│ Meus recursos: DNA 09:00→15:00 · R12 14:00→18:00       [ver histórico]    │
└───────────────────────────────────────────────────────────────────────────┘
```

**6.5 Discovery — preenchimento dirigido por schema**
```
┌ SD-WAN · ACME ─────────────────  salvo ✓ há 2s     completude 68% ▓▓▓▓▓▓░░ ┐
│ Seções ▾                                                                    │
│  1 Contexto ✓   2 Roteamento ●   3 Última milha   4 SLA & janela           │
│ ─────────────────────────────────────────────────────────────────────────  │
│  Protocolo de roteamento *        ( ) OSPF  (•) BGP  ( ) EIGRP              │
│  ASN público *                    [ 64512            ]  ← mono              │
│  › mostra "Comunidades BGP" porque roteamento = BGP     (lógica condicional)│
│  MTU do enlace                    [ 1500 ] bytes    [não se aplica][pendente]│
│  Sites / links (tabela)           + adicionar linha                         │
│    site        acesso     banda    SLA                                      │
│    Matriz SP   fibra      1 Gbps   99.9%                                    │
│ ──────────────────────────────────────────  [ Finalizar discovery ]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Quatro estados (piso, não teto)

Toda view tem **carregando / vazio / erro / sucesso**.

- **Carregando:** skeleton com a **forma real** (linhas de tabela, blocos de faixa, cards do Kanban) — nunca spinner solto.
- **Vazio = convite:** título direto + uma frase do que fazer + um botão. Exemplos:
  - Kanban: *"Nenhuma oportunidade ainda. Crie a primeira para começar a desenhar a solução."* → **Nova oportunidade**
  - Pasta: *"Esta pasta está vazia. Arraste arquivos aqui ou envie do computador."* → **Enviar arquivo**
  - Meus recursos: *"Você não tem nada reservado. Reserve um laboratório para a próxima demo."* → **Reservar laboratório**
  - Mural: *"Mural limpo. Deixe um recado de passagem de turno para o time."* → **Novo recado**
- **Erro = o que houve + o que fazer**, sem desculpas: *"Não foi possível carregar as reservas. Verifique a conexão e tente de novo."* → **Tentar de novo**
- **Conflito de reserva** (validação, inline, `halt-weak`): *"Conflito: DNA Center já está reservado por Ana Reis até 24/07 18:00. Escolha outro horário ou recurso."*

---

## 8. Movimento e acessibilidade

- Transições **120–180ms** em hover/estado. Sem animação decorativa de entrada. `prefers-reduced-motion` respeitado (inclui o marcador "agora").
- **AA** de contraste. **Foco sempre visível:** anel `signal` 2px com offset. Navegação **completa por teclado** (Kanban, calendário, discovery, palette). `aria-label` em todo ícone-botão.
- Atalhos: `⌘K` busca · `N` nova oportunidade · `G` + letra navega · `Esc` fecha · `?` abre a folha de ajuda.
- **Responsivo até 375px.** Em mobile o foco é **consultar** (dashboard, mural, minhas reservas); editar Kanban é desktop.

---

## 9. Texto e voz

pt-BR, voz ativa, **frase capitalizada** (não Title Case). O botão diz o que acontece e mantém o nome do início ao fim: **Finalizar discovery** → toast **Discovery finalizado**. Nomeia pelo que o usuário reconhece.

| Diz na UI | Nunca |
|---|---|
| Licenças de demonstração | registros de resource tipo licenca |
| Reservar laboratório | Enviar / Submit |
| Passagem de turno | notices |
| Prazo vencido | due_date expired |

---

## 10. Revisão crítica (item 5.5) — genérico × TelcoForge

Reli cada escolha e perguntei: *"isto é para este produto, ou o padrão que eu geraria para qualquer dashboard?"* O que mudei:

| Instinto genérico | Escolha para o TelcoForge | Por quê |
|---|---|---|
| Cards com sombra suave e `rounded-xl` | Painéis com **hairline 1px**, raio **4px**, sem sombra | Instrumento de engenharia lido em tela compartilhada — estrutura, não fofura |
| Chips de status multicoloridos | **1 destaque** (`signal`) + `live/warn/halt` só para estado | Cor vira sinal, não ruído; o olho acha o que importa numa reunião |
| Um calendário comum | **Faixa de ocupação** inspirada em gráfico de utilização de link | Linguagem nativa de quem opera redes/telecom — vira a assinatura |
| Sans-serif em tudo | **Mono obrigatório em todo dado técnico** (IP/ASN/porta/ID/rack/MTU) | Verdade do domínio; cria textura reconhecível |
| Dashboard de KPIs com números-herói | **Visão do dia** por baldes acionáveis (meus cards, reservas de hoje, discoveries incompletos, vencimentos, mural) | Cada bloco é um atalho para o trabalho; ≤3 cliques a qualquer coisa |
| App com módulos independentes no menu | Shell **centrado na oportunidade** + **trilho de contexto** persistente | O contexto atravessa os módulos — é o que faz virar um produto só |
| Inter também nos títulos | **Space Grotesk** em títulos/números/nomes de recurso, com restrição | Personalidade de instrumento técnico sem virar enfeite |
| "Nenhum dado encontrado." | Vazios que **convidam à ação** com copy específica por tela | Vazio é a primeira aula de uso do produto |

Só depois desta revisão a implementação começa — seguindo este documento à risca.
