# O que 15 mil tweets revelam sobre seu candidato

Esse repositório contém o código e os dados raspados, via API do Twitter, para elaborar [esta matéria](http://infograficos.estadao.com.br/politica/eleicoes/2018/o-que-15-mil-tweets-revelam-sobre-seu-candidato/).

## Diretório `code`:

#### 1-capturar-tweets
Código usado para coletar os dados, usando a API do Twitter e o módulo Tweepy do Python.

#### 2-analise-geral
Código usado para limpar a base de dados e calcular a frequência e a "unicidade" de cada palavra, para cada candidato.

#### 3-concatenar-resultados
Reúne os arquivos gerados no script anterior (um para cada candidato) em um único arquivo.

## Diretório `data`:

### Sub-diretório `bases-completas`:
Contém arquivos .csv com todos os tweets capturados.

### Sub-diretório `bases-recorte-temporal`:
Contém arquivos .csv com os tweets capturados a partir do dia 28 de setembro de 2017, início do período de análise.

### Sub-diretório `matrix-geral`:
Contém arquivos com os valores de frequência e unicidade para as palavras de cada candidato, além de um arquivo `matrix-todos.csv` que reúne todos os candidatos em apenas uma tabela.

## Diretório `viz`:
Contém a função genérica `draw.js`, que desenha os gráficos da matéria. A função `viz.js` simplesmente chama a função `draw.js` com os parâmetros de cada candidato. 