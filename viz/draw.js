function draw(filepath_matrix, filepath_tweets, div, candidato, partido) {

  var margin = { top: 80, left: 50, right: 50, bottom: 20},
    height = 1200 - margin.top - margin.bottom,
    width = 1000 - margin.left - margin.right;

  var container = d3.select("#container")
    .append('div')
    .attr('id', div)

  var svg = d3.select("#" + div)
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .attr("class", "temp")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Escalas
  var yPositionScale = d3.scaleLog()
    .rangeRound([height, 0])

  var radiusScale = d3.scaleSqrt()
    // .domain vai ser definido depois
    .range([3,13])

  var colorScaleHot = d3.scaleLog()
    // .domain vai ser definido depois
    .range(["#5E616A", "#ffa34a"])

  var colorScaleCold = d3.scaleLog()
    // .domain vai ser definido depois
    .range(["#65d5e1", "#5E616A"])

  // Tooltip
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<span>" + d.word + "</span>";
    })

  // Traduz a string temporal
  var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S")


  svg.call(tip)

  // Lê os dados
  d3.queue()
    .defer(d3.csv, filepath_matrix)
    .defer(d3.csv, filepath_tweets)
    .await(ready)


  function ready(error, datapoints, tweets) {

    // Reordena os tweets
    var tweets = tweets.sort(function(a,b){
      return parseTime(b.datetime) - parseTime(a.datetime)
    })
    console.log(tweets)

    // Define domínios
    colorMin = d3.min(datapoints.map(function(d){
      return +d.more_likely_candidate
    }))

    colorMedian = d3.median(datapoints.map(function(d){
      return +d.more_likely_candidate
    }))

    colorMax = d3.max(datapoints.map(function(d){
      return +d.more_likely_candidate
    }))

    yDomain = [0.01, 1356]
    
    radiusMin = d3.min(datapoints.map(function(d){
      return +d.__ratio_candidate
    }))
    radiusMax = d3.max(datapoints.map(function(d){
      return +d.__ratio_candidate
    }))


    colorScaleHot.domain([colorMedian, colorMax])
    colorScaleCold.domain([colorMin, colorMedian])

    yPositionScale.domain(yDomain)
    radiusScale.domain([radiusMin, radiusMax])

    // Define e roda uma simulação para posicionar os elementos
    var simulation = d3.forceSimulation(datapoints)
        .force("y", d3.forceY(function(d) { 
          return yPositionScale(+d.more_likely_candidate) 
        })
        .strength(6))
        .force("x", d3.forceX(width / 2))
        .force("collide", d3.forceCollide(function(d){
          return radiusScale(+d.__ratio_candidate + 1)
        }))
        .stop()

    for (var i = 0; i < 6000; i++) {
      simulation.tick()
    }

    // Adiciona círculos
    svg.selectAll(".circle-word")
      .data(datapoints)
      .enter().append("circle")
      .attr("cy", function(d) { return d.y })
      .attr("cx", function(d) { return d.x })
      .attr("fill", function(d) {
        value = d.more_likely_candidate
        if (value > colorMedian) {
          return colorScaleHot(d.more_likely_candidate)
        }
        else {
          return colorScaleCold(d.more_likely_candidate)
        }

      })
      .attr("id", function(d){ return d.word })
      .attr("class", "dot")
      .attr("sum", function(d){
        return d.__sum_candidate
      })
      .attr("r", function(d){ 
        return radiusScale(d.__ratio_candidate)
      })
      .attr("value", function(d){
        return d.more_likely_candidate
      })
      .attr("opacity", .8)
      .attr("stroke", "white")
      .attr("stroke-width", function(d){
        return 1.5
      })
      .attr("stroke-opacity", 0.0001)
      .on("mouseover", function(d){
        var element = d3.select(this)
        element.attr("stroke", "#333")
        element.attr("stroke-opacity", 1)
        tip.show(d)
        element.raise()
      })
      .on("mouseout", function(d){
        var element = d3.select(this)
        element.attr("stroke", "#fff")
        element.attr("stroke-opacity", 0.0001)
        tip.hide(d)
        element.lower()
      })
      .on("click", function(d){
        console.log("Palavra usada", d3.select(this).attr("sum"), "vezes")

        // Seleciona a palavra para consultar
        var word = d3.select(this).attr("id")
        // Cria uma regex com espaços ou pontuação seguidos da palavra, que é seguida de mais um espaço ou pontuação
        var regEx = new RegExp("([\\s\\t\\n,\\.;!?\\-_\\(\\):]{1,}|)" + word + "[\\s\\t\\n,\\.;!?\\-_\\(\\):]") // Note que não uso o char '\b' (wourd boundary) do RegEx porque ele não sabe lidar com caracteres acentuados
        // Seleciona os tweets em que essa palavra aparece
        var tweets_to_show = tweets.filter(function(d){
          return regEx.test(d.text.toLowerCase()) // Retorna os tweets que contem a regex que definimos
        })
        
        // Transforma tudo em uma string
        var string = tweets_to_show.map(function(d){
          return d.created_at + "\n" + d.text + "\n\n"
        }).join("")

       // Alerta em pop up
       alert(string)
       console.log(d3.select(this).attr("value"), "mais comum no discurso do candidato")
      })

    // Adiciona labels para cada um dos pontos
    svg.selectAll(".label-word")
      .data(datapoints)
      .enter().append("text")
      .attr("y", function(d) { return d.y })
      .attr("x", function(d) { return d.x })
      .text(function(d){ return d.word })
      .attr("id", function(d) {
        return "word-" + d.word
      })
      .attr("word", function(d){
        return d.word
      })
      .attr("class", "label")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("visibility", "hidden")
      .attr("dy", function(d){
        var radius = radiusScale(d.__ratio_candidate)
        return -radius - 7
      })


    // Adiciona título
    svg.append("text")
    .text(candidato + " " + partido)
    .attr("x", width/2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 32)

   // Adiciona legendas de posição
   svg.append("text")
    .text(" ↑ palavra mais característica do candidato")
    .attr("x", width/2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")

    svg.append("text")
      .text(" ↓ palavra menos característica do candidato")
      .attr("x", width/2)
      .attr("y", height-20)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")

    // Adiciona legenda de tamanho do círculo
    svg.append("circle")
      .attr("cx", margin.left)
      .attr("cy", 25)
      .attr("r", radiusScale(radiusMin))
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("class", "circle-legend")
      .attr("id", 'small-circle-legend')


    svg.append("circle")
      .attr("cy", 25)
      .attr("r", radiusScale(radiusMax))
      .attr("cx", function(d){
        var element = d3.select(this)
        return margin.left + parseInt(element.attr("r")) + 50
      })
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("class", "circle-legend")
      .attr("id", 'big-circle-legend')

    svg.append("text")
      .text("- comum")
      .attr("y", 60)
      .attr("x", function(d){
        return d3.select("#small-circle-legend").attr("cx")
      })
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", 12)

    svg.append("text")
      .text("+ comum")
      .attr("y", 60)
      .attr("x", function(d){
        return d3.select("#big-circle-legend").attr("cx")
      })
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", 12)

  }

}

