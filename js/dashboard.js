//-------------------------------------------
// creando la variable donde se va a guardar el dataset
//-------------------------------------------

let allVent = {}

const visualizacionMapa = {
 
    //-------------------------------------------
  // Inicializando las funciones Ventas
  //-------------------------------------------
  initVent() {
    this.loadVent()
    setTimeout(() => {
      visualizacionMapa.createListDepart()
      visualizacionMapa.createListMes()
    }, 1500)
  },

 //-------------------------------------------
  // Cargando la base de datos de *ventas*
  //-------------------------------------------
  loadVent() {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.open('GET', 'ventas.csv', true)
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if(xmlhttp.status == 200) {
          allVent = visualizacionMapa.parseData(xmlhttp.responseText)
        }
      }
    }
    xmlhttp.send(null)
  },
  parseData(csv) {
    var lines=csv.split("\n")
    var result = []
    var headers=lines[0].split(",")
    for(var i=1;i<lines.length;i++){
      var obj = {}
      var currentline=lines[i].split(",")
      for(var j=0;j<headers.length;j++){
        obj[headers[j]] = currentline[j]
      }
      result.push(obj)
    }

    return result
  },

  //-------------------------------------------
  // Creando lista de valor del filtro de Ventas
  //---------------------------------------------
  createListMes() {

    let list  = document.querySelector('.mes-list')

    let listContent = ``

    _.map(_.groupBy(allVent, 'MES'), (items, mes) => {
      const productoItem = {
        "mes": mes,
        "cantidad": items.length
      }
      listContent += `<div class="form-check">`
      listContent += `<input value="${productoItem.mes}" class="form-check-input" type="checkbox"><label class="form-check-label">${productoItem.mes} (${productoItem.cantidad})</label>`
      listContent += `</div>`
    })

    list.innerHTML = listContent

  },
  //-------------------------------------------
  // Creando lista de valor del filtro de Ventas
  //---------------------------------------------
  createListDepart() {

    let list  = document.querySelector('.depart-list')

    let listContent = ``

    _.map(_.groupBy(allVent, 'DEPARTAMENTO'), (items, province) => {
      const productoItem = {
        "provincia": province,
        "cantidad": items.length
      }
      listContent += `<div class="form-check">`
      listContent += `<input value="${productoItem.provincia}" class="form-check-input" type="checkbox"><label class="form-check-label">${productoItem.provincia} (${productoItem.cantidad})</label>`
      listContent += `</div>`
    })

    list.innerHTML = listContent

  },
  //-------------------------------------------------
  // Cargar la base de datos de Ventas
  //-------------------------------------------------
  cargarVent() {

    const selected = _.map(Array.from(document.querySelectorAll('.form-check-input')), item => {
      return {
        checked: item.checked,
        value: item.value
      }
    })

    //-------------------------------------------------

    const seleccion_departamentos = _.filter(selected, item => {
      if(item.checked)
        return item.value
    })

    const department = _.uniq(_.map(seleccion_departamentos, 'value'))

  //-------------------------------------------------

  
  const seleccion_mes = _.filter(selected, item => {
    if(item.checked)
      return item.value
  })

  const mes = _.uniq(_.map(seleccion_mes, 'value'))

  //-------------------------------------------------

  const seleccion_status = _.filter(selected, item => {
    if(item.checked)
      return item.value
  })

  const status = _.uniq(_.map(seleccion_status, 'value'))
  //-------------------------------------------------


    const filteredData2 = _.filter(allVent, item => {
      if(department.includes(item.DEPARTAMENTO)) {
        return item
      }
    })

    const filteredData3 = _.filter(filteredData2, item => {
      if(mes.includes(item.MES)) {
        return item
      }
    })

    const filteredData4 = _.filter(filteredData3, item => {
      if(status.includes(item.SUB_ORDER_STATUS)) {
        return item
      }
    })

    //-------------------------------------------------


    const SKU_NAME = _.uniq(_.map(filteredData4, 'SKU_NAME'))


    const totalVentas = _.map(_.groupBy(filteredData4, 'SKU_NAME'), (items, skuname) => {
      return _.sumBy(items, i => {
        return parseFloat(i.TOTALPAID)
      })
    })

    
    //-------------------------------------------------

    
    const cantidadTalla = _.map(_.groupBy(filteredData4, 'Talla'), (items, producto) => {
      return {
        name: producto,
        y: _.sumBy(items, i => {
          return parseFloat(i.ID)
        }),
        sliced: true,
        selected: true
      }
    })

    //-------------------------------------------------
    const date_mes = _.uniq(_.map(filteredData4, 'DATE_ORDERED'))


    const totalVentasMes = _.map(_.groupBy(filteredData4, 'DATE_ORDERED'), (items, vent_mes) => {
      return _.sumBy(items, i => {
        return parseFloat(i.TOTALPAID)
      })
    })

    //-------------------------------------------------
    const cantidadDescuento = _.map(_.groupBy(filteredData4, 'DISCOUNT_TRUE'), (items, producto) => {
      return {
        name: producto,
        y: _.sumBy(items, i => {
          return parseFloat(i.ID)
        }),
        sliced: true,
        selected: true
      }
    })

    //------------------------------------------
    // plot 1 - Vent
    //------------------------------------------

    Highcharts.chart('VentOverview1', {
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: '% de productos vendidos por talla'
      },
      subtitle: {
        text: '2020'
    },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/>'+
          'total vendidos : <b>{point.y:.0f}</b>'
      },
      accessibility: {
          point: {
              valueSuffix: '%'
          }
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %' 
              }
          }
      },
      series: [{
        name: 'Productos vendidos',
        colorByPoint: true,
        data: cantidadTalla
      }]
  });
    //------------------------------------------
    // plot 2 - Vent
    //------------------------------------------

    Highcharts.chart('VentOverview2', {
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: 'Productos vendidos con descuento'
      },
      subtitle: {
        text: '2020'
    },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> <br/>' +
           'total ventas: <b>{point.y:.0f}</b>'
      },
      accessibility: {
          point: {
              valueSuffix: '%'
          }
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f}%'
              }
          }
      },
      series: [{
        name: 'Productos vendidos',
        colorByPoint: true,
        data: cantidadDescuento
      }]
  });
    //------------------------------------------
    // plot 3 - Vent
    //------------------------------------------

    Highcharts.chart('VentOverview3', {
      chart: {
          type: 'bar'
      },
      title: {
          text: 'Ventas totales por tipo de color'
      },
      subtitle: {
          text: '2020'
      },
      xAxis: {
          categories: SKU_NAME,
          title: {
              text: null
          }
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Ventas(soles)',
              align: 'high'
          },
          labels: {
              overflow: 'justify',
              format: '{value:.2f}'
          }
      },
      tooltip: {
          valueSuffix: ' S/',
          valueDecimals: 2
      },
      plotOptions: {
          bar: {
              dataLabels: {
                  enabled: true
              }
          }
      },
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -40,
          y: 80,
          floating: true,
          borderWidth: 1,
          backgroundColor:
              Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
          shadow: true
      },
      credits: {
          enabled: false
      },
      series: [ {
          dataSorting: {
            enabled: true
          },
          name: 'Ventas totales',
          dataLabels:{
            format:"{point.y:.2f}"
          },
          data: totalVentas
      }]
    });

    //------------------------------------------
    // plot 4 - Vent
    //------------------------------------------

    Highcharts.chart('VentOverview4', {
      chart: {
          type: 'areaspline'
      },
      title: {
          text: 'Ventas totales por fecha'
      },
      subtitle: {
        text: '2020'
    },
      legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 150,
          y: 100,
          floating: true,
          borderWidth: 1,
          backgroundColor:
              Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
      },
      xAxis: {
          type: 'datetime',
          categories: date_mes
      },
      yAxis: {
          title: {
              text: 'Total ventas (s/)'
          }
      },
      tooltip: {
          shared: true,
          valueSuffix: ' S/',
          valueDecimals: 2
      },
      credits: {
          enabled: false
      },
      plotOptions: {
          areaspline: {
              fillOpacity: 0.5
          }
      },
      series: [{
          name: 'Ventas totales',
          data: totalVentasMes
      }]
  });




  },
}


