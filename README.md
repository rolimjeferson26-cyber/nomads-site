# NOMAD'S | Site

Site da NOMAD'S Têxtil, estampagem DTF e marca própria.
Feito em HTML, CSS e JavaScript puro (sem frameworks), para alojar grátis no GitHub Pages.

## Estrutura

```
index.html          conteúdo da página
css/style.css       visual (cores e fontes em variáveis no topo)
js/main.js          formulário de orçamento (WhatsApp) e vídeos
assets/img/         logótipos (webp no site, png como original)
assets/video/       vídeos comprimidos (720p, sem som) + posters
assets/fonts/       Big Shoulders Display e Archivo (guardadas localmente)
```

## Ver no computador

Abre uma terminal nesta pasta e corre:

```
python -m http.server 8000
```

Depois abre http://localhost:8000 no browser.

## Adicionar fotos à secção "Trabalhos"

1. Põe as fotos originais em `assets/img/trabalhos/originais/` (esta pasta não vai para o GitHub).
2. Na primeira vez, cria o ambiente Python: `python3 -m venv .venv && .venv/bin/pip install pillow`
3. Corre: `.venv/bin/python tools/otimizar_fotos.py`
4. Cola o HTML que aparece dentro de `<div class="galeria">` no `index.html` e escreve o `alt` de cada foto.

O script roda as fotos, reduz para 1200 px, grava em WebP e remove todos os metadados (EXIF, GPS, modelo do telemóvel).

## Identidade

| Nome     | Cor       | Uso                    |
|----------|-----------|------------------------|
| asfalto  | `#16130F` | fundo                  |
| marfim   | `#EDE3CF` | texto                  |
| estrada  | `#8A8174` | texto secundário       |
| laranja  | `#E07A1F` | botões                 |
| sol      | `#F2B01E` | hover, links, foco     |

Títulos: Big Shoulders Display. Texto: Archivo.

## Segurança (já aplicado)

- Content-Security-Policy no `<head>`: só carrega ficheiros do próprio site.
- Sem scripts nem estilos inline, sem bibliotecas externas.
- Fontes locais (sem pedidos ao Google, bom para o RGPD).
- Links externos com `rel="noopener noreferrer"`.
- Imagens e vídeos sem metadados (EXIF/GPS); fotos originais fora do Git.
- O formulário não guarda nem envia dados para nenhum servidor: só abre o WhatsApp.

## Decisões tomadas

- Vídeos KISS e Ronaldo **não** entram no site (direitos de marca e imagem).
- Vídeos usados: Skyline (topo) e DECIR 2026 (trabalhos).

## Pendente

- [x] Número de WhatsApp real em `js/main.js`
- [x] Murtosa (região de Aveiro); CTT para o continente, ilhas sob consulta
- [ ] 6 a 10 fotos reais das peças para a secção "Trabalhos" (grelha e script prontos; falta pôr as fotos)
- [ ] Criar repositório no GitHub e publicar no GitHub Pages (HTTPS)
- [ ] Depois: Google Business com o link do site; mudar categoria do Instagram
