# Quiz Resolume Arena 7 — Vídeo Engenharia (turma Farmarcas)

Quiz interativo com QR code, envio automático das notas para um banco de dados (Planilha Google),
**Resultado Global anônimo** para projetar e **notas individuais** só para o administrador.

## Arquivos
- **quiz.html** — o quiz do aluno. 2 etapas (01–06 e 07–13), 10 perguntas cada, nível fácil. Turma fixa: Farmarcas.
- **painel_instrutor.html** — gera os **QR codes** das duas etapas e tem o botão **"Ver Resultado Global"** (média/participações/distribuição, anônimo).
- **admin.html** — janela do administrador (com senha): mostra as **notas individuais** e exporta CSV.
- **backend_apps_script.gs** — o banco de dados (Google Apps Script + Planilha).

## Fluxo
1. O aluno escaneia o QR → abre a etapa no celular → digita o nome → responde.
2. Ao finalizar, a nota é **enviada automaticamente** para a planilha (sem WhatsApp).
3. Quando todos terminarem, no **painel_instrutor.html** você clica em **"Ver Resultado Global"** (bom para projetar) — mostra só números da turma, **sem identificar ninguém**.
4. Em **admin.html**, com sua senha, você vê a **nota de cada aluno**.

## Instalação (uma vez)
**1. Banco de dados (backend)**
1. Crie uma **Planilha Google** em branco. Copie o ID da URL (entre `/d/` e `/edit`).
2. **Extensões → Apps Script**: apague tudo e cole o **backend_apps_script.gs**.
3. Preencha `SHEET_ID` (o ID copiado) e `ADMIN_PASS` (sua senha).
4. **Implantar → Nova implantação → App da Web** · Executar como: **Eu** · Acesso: **Qualquer pessoa**.
5. Copie a **URL do App da Web**.

**2. Configurar o quiz**
Abra **quiz.html** e cole a URL do App da Web em `BACKEND_URL` (no topo do `<script>`).

**3. Publicar o quiz na internet** (uma opção):
- Netlify Drop (`app.netlify.com/drop`) — arraste o `quiz.html`.
- GitHub Pages — suba o arquivo e ative Pages.
- Seu site / Google Sites.

**4. Gerar os QR codes**
Abra **painel_instrutor.html**, cole a **URL do quiz publicado** e a **URL do backend**, clique **Gerar QR codes** e imprima.

**5. Ver resultados**
- Global (anônimo): botão **"Ver Resultado Global"** no painel.
- Individual (admin): abra **admin.html**, cole a URL do backend + senha.

## Observações
- Senha padrão do admin: `veng2026` — **troque** no backend.
- `painel_instrutor.html` e `admin.html` lembram as URLs digitadas (localStorage).
- Para nova turma, limpe a planilha (mantendo o cabeçalho) ou crie outra.
