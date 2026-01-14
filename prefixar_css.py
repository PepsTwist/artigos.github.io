# prefixar_css.py

import re

def blindar_css(arquivo_entrada, arquivo_saida, prefixo_wrapper):
    """
    Lê um arquivo CSS, adiciona um prefixo a todos os seletores e !important a todas as regras.
    """
    try:
        with open(arquivo_entrada, 'r', encoding='utf-8') as f:
            conteudo_css = f.read()
    except FileNotFoundError:
        print(f"❌ Erro: O arquivo de entrada '{arquivo_entrada}' não foi encontrado.")
        return

    css_processado = ""
    # Regex para encontrar blocos de regras (seletor { propriedades })
    # Ele lida com media queries de forma especial
    blocos = re.finditer(r'(?P<media>@media[^{]+)?\s*{(?P<seletores>[^}]+){(?P<regras>[^}]+)}', conteudo_css, re.DOTALL)
    
    # Se o regex acima falhar (CSS mais simples), usa um fallback
    if not list(re.finditer(r'.', conteudo_css)): # Re-check iterator
        blocos = re.finditer(r'([^{]+){([^}]+)}', conteudo_css)

    # Processa cada bloco de regra encontrado
    for bloco in re.finditer(r'(@media[^{]+{)?([^@}]+){([^}]+)}', conteudo_css):
        media_query = bloco.group(1) or ""
        seletores_originais = bloco.group(2).strip()
        regras_originais = bloco.group(3).strip()

        # 1. Adiciona !important a cada regra
        regras_blindadas = []
        for regra in regras_originais.split(';'):
            regra = regra.strip()
            if regra:
                # Adiciona !important, mas cuida para não duplicar se já existir
                if '!important' not in regra:
                    regras_blindadas.append(regra + ' !important')
                else:
                    regras_blindadas.append(regra)
        regras_finais = '; '.join(regras_blindadas) + ';'

        # 2. Adiciona o prefixo a cada seletor
        seletores_blindados = []
        for seletor in seletores_originais.split(','):
            seletor = seletor.strip()
            if seletor:
                # Não prefixa a tag 'body' ou 'html', pois elas não estarão dentro do wrapper
                if seletor.lower() not in ['body', 'html', '*']:
                     seletores_blindados.append(f"{prefixo_wrapper} {seletor}")
                else: # Mantém seletores globais para reset, se necessário
                     seletores_blindados.append(f"{prefixo_wrapper}")


        seletores_finais = ', '.join(seletores_blindados)

        # Monta o bloco final
        if media_query:
             # Se estiver dentro de uma @media query, a estrutura é um pouco diferente
             css_processado += f"{media_query} {seletores_finais} {{ {regras_finais} }}\n"
        else:
             css_processado += f"{seletores_finais} {{ {regras_finais} }}\n"


    # Salva o novo arquivo CSS
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        f.write("/* CSS Blindado Automaticamente para WordPress */\n\n")
        f.write(css_processado)
    
    print(f"✅ Sucesso! CSS blindado e salvo em '{arquivo_saida}'")

# --- EXECUÇÃO ---
if __name__ == "__main__":
    arquivo_css_original = os.path.join('template_base', 'style.css')
    arquivo_css_blindado = os.path.join('template_base', 'style-wp.css')
    prefixo = ".guto-article-wrapper"
    
    blindar_css(arquivo_css_original, arquivo_css_blindado, prefixo)

