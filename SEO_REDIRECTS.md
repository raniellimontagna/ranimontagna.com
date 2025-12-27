# SEO - Redirecionamentos e URLs Canônicas

## ⚠️ Problema Identificado

O Google Search Console está reportando **"Páginas com redirecionamento"** para:
- `http://www.ranimontagna.com/`
- `http://ranimontagna.com/`
- `https://www.ranimontagna.com/pt`

## ✅ Configuração Atual na Vercel

Baseado na configuração de domínios na Vercel:

- ✅ `ranimontagna.com` → **URL Canônica Principal** (Production)
- 🔄 `www.ranimontagna.com` → Redireciona **307** para `ranimontagna.com`
- ✅ `ranimontagna-com.vercel.app` → Domínio Vercel padrão

## ✅ Solução Implementada

### 1. **URL Canônica Padronizada**

Todas as URLs agora usam **`https://ranimontagna.com`** (sem www) como base canônica, conforme a configuração da Vercel.

**Configuração:**
- Criada constante `BASE_URL` em `src/lib/constants.ts`
- Todos os arquivos agora usam a mesma URL base
- Sitemap, metadata, JSON-LD, todos consistentes

### 2. **Arquivos Atualizados**

- ✅ `src/lib/constants.ts` - Constante BASE_URL = `https://ranimontagna.com`
- ✅ `src/lib/seo.ts` - Usa BASE_URL
- ✅ `src/app/sitemap.ts` - Usa BASE_URL
- ✅ `src/app/[locale]/layout.tsx` - Usa BASE_URL
- ✅ `src/app/[locale]/blog/[slug]/page.tsx` - Usa BASE_URL
- ✅ `src/app/[locale]/blog/page.tsx` - Usa BASE_URL
- ✅ `src/lib/jsonld.ts` - Usa BASE_URL

### 3. **Redirecionamentos (Esperados)**

Os redirecionamentos são **normais e esperados**:

1. **HTTP → HTTPS** (301 permanente)
   - `http://ranimontagna.com` → `https://ranimontagna.com`
   - `http://www.ranimontagna.com` → `https://ranimontagna.com`

2. **WWW → Non-WWW** (307 na Vercel)
   - `https://www.ranimontagna.com` → `https://ranimontagna.com`
   - ⚠️ **Recomendação:** Mudar para 301 (permanente) na Vercel

3. **Sem locale → Com locale** (301 permanente)
   - `https://ranimontagna.com/` → `https://ranimontagna.com/pt`

## 📊 O que o Google está fazendo

O Google **não indexa** páginas que redirecionam (isso é correto). Ele:
1. Segue o redirecionamento
2. Indexa a URL final (destino)
3. Reporta a URL de origem como "página com redirecionamento"

## ✅ Próximos Passos

### 1. **Ajustar Redirecionamento na Vercel (Recomendado)**

O `www.ranimontagna.com` está usando **307 (Temporary Redirect)**. O ideal é usar **301 (Permanent Redirect)**:

**Como fazer:**
1. Acesse o projeto na Vercel
2. Vá em **Settings → Domains**
3. Clique em **Edit** no domínio `www.ranimontagna.com`
4. Configure para redirecionar **301** para `ranimontagna.com` (não 307)

**Ou via arquivo `vercel.json`:**
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "www.ranimontagna.com"
        }
      ],
      "destination": "https://ranimontagna.com/:path*",
      "permanent": true
    }
  ]
}
```

### 2. **Verificar no Google Search Console:**

- As URLs finais (`https://ranimontagna.com/pt`, etc.) devem estar indexadas
- As URLs com redirecionamento aparecem como "não indexadas" (isso é normal)

### 3. **Verificar Sitemap:**

- Acesse `https://ranimontagna.com/sitemap.xml`
- Deve conter apenas URLs com `ranimontagna.com` (sem www)

### 4. **Aguardar Reindexação:**

- O Google pode levar alguns dias para reindexar
- Use "Solicitar indexação" no Search Console para URLs importantes

## 🔍 Como Verificar

1. **Teste de Redirecionamento:**
   ```bash
   curl -I https://www.ranimontagna.com
   # Deve retornar: 301 (após ajuste) ou 307 (atual)
   ```

2. **Verificar Sitemap:**
   ```bash
   curl https://ranimontagna.com/sitemap.xml
   ```

3. **Verificar URL Canônica:**
   - Inspecione o HTML de qualquer página
   - Procure por `<link rel="canonical" href="...">`
   - Deve apontar para `https://ranimontagna.com/...`

## 📝 Nota Importante

**O aviso do Google é NORMAL** para sites com i18n e redirecionamentos. O importante é:
- ✅ URLs finais estão indexadas
- ✅ Sitemap está correto
- ✅ URLs canônicas estão consistentes
- ✅ Redirecionamentos são 301 (permanentes) - **ajustar na Vercel**

## ⚠️ Ação Necessária na Vercel

**Mudar redirecionamento de 307 para 301:**
- Atualmente: `www.ranimontagna.com` → 307 → `ranimontagna.com`
- Ideal: `www.ranimontagna.com` → 301 → `ranimontagna.com`

Isso ajuda o Google a entender que o redirecionamento é permanente e consolidar o "link juice" para a URL canônica.
