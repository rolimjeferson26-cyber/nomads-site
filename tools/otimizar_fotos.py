"""
NOMAD'S | Otimizar fotos para a secção "Trabalhos"

Lê as fotos originais de assets/img/trabalhos/originais/ e grava versões
para a web em assets/img/trabalhos/ (formato WebP, sem metadados).

Como usar (na pasta do projeto):
    .venv/bin/python tools/otimizar_fotos.py

A pasta "originais" está no .gitignore: os originais (com EXIF/GPS)
nunca vão para o GitHub. Só os .webp limpos são publicados.
"""

from pathlib import Path

from PIL import Image, ImageOps

PASTA_ORIGINAIS = Path("assets/img/trabalhos/originais")
PASTA_SAIDA = Path("assets/img/trabalhos")
LADO_MAXIMO = 1200  # píxeis no lado maior
QUALIDADE = 80      # 0 a 100 (80 = bom equilíbrio nitidez/peso)
EXTENSOES = {".jpg", ".jpeg", ".png", ".webp"}


def otimizar(origem: Path) -> Path:
    with Image.open(origem) as foto:
        # 1. Roda a foto conforme a etiqueta EXIF (senão ficava de lado)
        foto = ImageOps.exif_transpose(foto)

        # 2. Converte para RGB (WebP para fotos não precisa de transparência)
        foto = foto.convert("RGB")

        # 3. Reduz mantendo a proporção (só encolhe, nunca aumenta)
        foto.thumbnail((LADO_MAXIMO, LADO_MAXIMO), Image.Resampling.LANCZOS)

        # 4. Imagem nova só com os píxeis: nasce sem EXIF, GPS, XMP nem comentários.
        #    Guardamos apenas o perfil de cor (ICC), que não tem dados pessoais.
        perfil_cor = foto.info.get("icc_profile")
        limpa = Image.frombytes(foto.mode, foto.size, foto.tobytes())

    # 5. Grava em WebP
    destino = PASTA_SAIDA / (origem.stem.lower().replace(" ", "-") + ".webp")
    opcoes = {"quality": QUALIDADE, "method": 6}
    if perfil_cor:
        opcoes["icc_profile"] = perfil_cor
    limpa.save(destino, "WEBP", **opcoes)

    # 6. Verifica que o ficheiro final não tem metadados
    with Image.open(destino) as verificar:
        if len(verificar.getexif()) or "xmp" in verificar.info or "exif" in verificar.info:
            raise RuntimeError(f"{destino} ainda tem metadados!")
    return destino


def main() -> None:
    fotos = sorted(f for f in PASTA_ORIGINAIS.glob("*") if f.suffix.lower() in EXTENSOES)
    if not fotos:
        print(f"Não há fotos em {PASTA_ORIGINAIS}/")
        return

    html = []
    for origem in fotos:
        destino = otimizar(origem)
        with Image.open(destino) as img:
            largura, altura = img.size
        antes = origem.stat().st_size / 1024
        depois = destino.stat().st_size / 1024
        print(f"{origem.name:30} {antes:7.0f} KB -> {depois:5.0f} KB  {largura}x{altura}  sem EXIF ✓")
        html.append(
            f'        <figure class="galeria__foto">\n'
            f'          <img src="{destino.as_posix()}" alt="DESCREVER A PEÇA" '
            f'width="{largura}" height="{altura}" loading="lazy" decoding="async">\n'
            f'        </figure>'
        )

    # 7. HTML pronto a colar dentro de <div class="galeria"> no index.html
    print("\n--- HTML ---")
    print("\n".join(html))


if __name__ == "__main__":
    main()
