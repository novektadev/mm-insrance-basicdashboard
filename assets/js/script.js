import {catNombresCortos, balancesJson,
        loadCatNombresCortosJson, loadBalancesJson } from './readModelData.js'

// TABS FUNCTIONALIIES  //

let activeTabContainer = null;
//let balancesArray = null;
//let balancesArrayEoY = null;

// This function can now be called safely from within your module's scope
function setTabAsActive(event) {

    const tabsContainersList = ['allMarketTab', 'companyTab']

    const domElement = event.target;
    const domListElement = domElement.closest('li');
    const selectedTabElementId = domListElement.id;
    
    tabsContainersList.forEach((tabItemName, tabItemNameIndex) => {
        const tablItemElement = document.getElementById(tabItemName)
        const tabContainer = document.getElementById(`${tabItemName}Container`)
        tablItemElement.style = 'background-color: #ffffff;'
        tabContainer.style = 'display:none;'
    })
    tabsContainersList.forEach((tabItemName, tabItemNameIndex) => {
        //console.log(tabItemName, selectedTabElementId)
        if (tabItemName === selectedTabElementId) {
            const tablItemElement = document.getElementById(tabItemName)
            const tabContainer = document.getElementById(`${tabItemName}Container`)
            tablItemElement.style = 'background-color: #f0f0f0;'
            tabContainer.style = 'display:block;'
        }
    })
}


// SESSION DATA UPDATE PROCESS

function updateSessionData(tmpMombreCortoId) {
    // console.log('Selected company ID:', tmpMombreCortoId);
    sessionStorage.setItem('selectedNombreCortoId', tmpMombreCortoId);
    updateCompanyCharts()
}

// CHARTS CONTENT UPDATE

async function updateCompanyCharts() {
    try {
        const cutOffDate =  new Date(new Date().getFullYear() - 3, 0, 1)
        const selectedNombreCortoId = parseInt(sessionStorage.getItem('selectedNombreCortoId'))
        const catNombresCortosArray = sessionStorage.getItem('catNombresCortos')
        if (catNombresCortosArray) {
            const catNombresCortosJson = JSON.parse(catNombresCortosArray)
            //console.log('selectedNombreCortoId:', selectedNombreCortoId, typeof selectedNombreCortoId);
            const selectedNombreCortoItem = catNombresCortosJson.find(item =>  item.nombreCortoId === selectedNombreCortoId);
            //console.log('compañia: ', selectedNombreCortoItem.nombreCorto)
            const balancesArraString = sessionStorage.getItem('balancesArray')
            if (balancesArraString) {
                const balancesJson = JSON.parse(balancesArraString)
                const tmpFechasCorte = [...new Set(balancesJson.map(item => item.fechaCorte))].sort();
                const fechasCorte = new Set(tmpFechasCorte.filter(fecha => {return new Date(fecha) > cutOffDate;}))
                const companyDataJson = balancesJson.filter(item => {
                    return fechasCorte.has(item.fechaCorte) && item.nombreCortoId === selectedNombreCortoId;
                });
                //
                companyDataJson.forEach(item => {
                    item.costoBienesVendidos = (item.costoNetoDeAdquisicion + item.costoNetoSiniestralidad)*(1e-6)
                    item.utilidadBruta = (item.primasDeRetencionDevengadas - item.costoBienesVendidos)*(1e-6)
                    item.ingresosOperativos = (item.utilidadBruta - item.gastosOperacionNetos)*(1e-6)
                    item.indiceSiniestralidad = item.costoNetoSiniestralidad/item.primasDeRetencionDevengadas
                    item.margenUtilidadOperativa = (item.ingresosOperativos/item.primasDeRetencionDevengadas)*(1e2)
                })
                //
                if (companyDataJson) {
                    //
                    //console.log(companyDataJson)
                    const companyChart1DivElement = document.getElementById('companyChart1')
                    if (companyChart1DivElement) {
                        //
                        const df1 = new dfd.DataFrame({'Fecha': companyDataJson.map(item => item.fechaCorte),
                                                       'Prima de Rentencion Devengadas': companyDataJson.map(item => (item.primasDeRetencionDevengadas)*(1e-6)),
                                                       'Costo Siniestralidad': companyDataJson.map(item => (item.costoNetoSiniestralidad)*(1e-6))})
                        //
                        df1.setIndex({ column: 'Fecha', inplace: true });
                        //
                        const layout = {title: {text: selectedNombreCortoItem.nombreCorto.toUpperCase(), font: { size: 16 }, x: 0.5, xanchor: 'center'},
                                        xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                        yaxis: {title: 'Millones de Pesos', gridcolor: '#f0f0f0', tickprefix: '$'},
                                        plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                        margin: { l: 80, r: 40, t: 100, b: 120 },
                                        legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                        hovermode: 'x unified', autosize: true};
                        //
                        const config = {columns: ['Prima de Rentencion Devengadas', 'Costo Siniestralidad'],
                                        displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                        responsive: true};
                        //
                        df1.plot('companyChart1').line({ layout, config });
                    }
                    //
                    const companyChart2DivElement = document.getElementById('companyChart2')
                    if (companyChart2DivElement) {
                        const df2 = new dfd.DataFrame({'Fecha': companyDataJson.map(item => item.fechaCorte),
                                                       'Indice de Siniestralidad': companyDataJson.map(item => item.indiceSiniestralidad)})
                        //
                        df2.setIndex({ column: 'Fecha', inplace: true });
                        //
                        const layout = {title: {text: selectedNombreCortoItem.nombreCorto.toUpperCase(), font: { size: 16 }, x: 0.5, xanchor: 'center'},
                                        xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                        yaxis: {title: 'Indice de Siniestralidad', gridcolor: '#f0f0f0'},
                                        plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                        margin: { l: 80, r: 40, t: 100, b: 120 },
                                        legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                        hovermode: 'x unified', autosize: true};
                        //
                        const config = {columns: ['Indice de Siniestralidad'],
                                        displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                        color: '#000000', responsive: true};
                        // 
                    df2.plot('companyChart2').line({ layout, config });
                    }
                    //
                    const companyChart3DivElement = document.getElementById('companyChart3')
                    if (companyChart3DivElement) {
                        //console.log('mapping!!')
                        const df3 = new dfd.DataFrame({'Fecha': companyDataJson.map(item => item.fechaCorte),
                                                       'Ingresos Operativos': companyDataJson.map(item => item.ingresosOperativos)})
                        //
                        df3.setIndex({ column: 'Fecha', inplace: true });
                        //console.log(df3.tail(3).print())
                        //
                        const layout = {title: {text: selectedNombreCortoItem.nombreCorto.toUpperCase(), font: { size: 16 }, x: 0.5, xanchor: 'center'},
                                        xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                        yaxis: {title: 'Ingresos Operativos (Millones MXN)', gridcolor: '#f0f0f0'},
                                        plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                        margin: { l: 80, r: 40, t: 100, b: 120 },
                                        legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                        hovermode: 'x unified', autosize: true};
                        //
                        const config = {columns: ['Ingresos Operativos'],
                                        displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                        color: '#000000', responsive: true};
                        // 
                    df3.plot('companyChart3').line({ layout, config });
                    }
                    //
                    const companyChart4DivElement = document.getElementById('companyChart4')
                    if (companyChart4DivElement) {
                        const df4 = new dfd.DataFrame({'Fecha': companyDataJson.map(item => item.fechaCorte),
                                                    'Margen de Utilidad Operativa': companyDataJson.map(item => item.margenUtilidadOperativa)})
                        //
                        df4.setIndex({ column: 'Fecha', inplace: true });
                        //
                        const layout = {title: {text: selectedNombreCortoItem.nombreCorto.toUpperCase(), font: { size: 16 }, x: 0.5, xanchor: 'center'},
                                        xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                        yaxis: {title: 'Margen de Utilidad Operativa', gridcolor: '#f0f0f0'},
                                        plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                        margin: { l: 80, r: 40, t: 100, b: 120 },
                                        legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                        hovermode: 'x unified', autosize: true};
                        //
                        const config = {columns: ['Margen de Utilidad Operativa'],
                                        displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                        color: '#000000', responsive: true};
                        // 
                    df4.plot('companyChart4').line({ layout, config });
                    }
                }
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}


async function updateMarketCharts() {
    try {
        const balancesEoYArraString = sessionStorage.getItem('balancesArrayEoY')
        if (balancesEoYArraString) {
            const balancesEoYJson = JSON.parse(balancesEoYArraString)
            //console.log('orale putos!!')
            const balancesEoYDf = new dfd.DataFrame(balancesEoYJson)
            //console.log(balancesDf.ctypes.print())
            let groupDf = balancesEoYDf.groupby(['fechaCorte'])
            groupDf =  groupDf.agg({directo: 'sum', tomada: 'sum', primasCedidas: 'sum', primasDeRetencion: 'sum',
                                    primasDeRetencionDevengadas: 'sum', costoNetoDeAdquisicion: 'sum',  primasDeRetencionDevengadas: 'sum',
                                    costoNetoDeAdquisicion: 'sum', costoNetoSiniestralidad: 'sum' , gastosOperacionNetos: 'sum'})
            groupDf.addColumn('costoBienesVendidos', groupDf['costoNetoDeAdquisicion_sum'].add(groupDf['costoNetoSiniestralidad_sum']),{inplace: true});
            groupDf.addColumn('utilidadBruta', groupDf['primasDeRetencionDevengadas_sum'].sub(groupDf['costoBienesVendidos']),{inplace: true});
            groupDf.addColumn('ingresosOperativos', groupDf['utilidadBruta'].sub(groupDf['gastosOperacionNetos_sum']),{inplace: true})
            groupDf.addColumn('indiceSiniestralidad', groupDf['costoNetoSiniestralidad_sum'].div(groupDf['primasDeRetencionDevengadas_sum']),{inplace: true});
            groupDf.addColumn('margenUtilidadOperativa', groupDf['ingresosOperativos'].div(groupDf['primasDeRetencionDevengadas_sum']),{inplace: true})
            //console.log(groupDf.tail(3).print())
            const marketDataEoYJson = dfd.toJSON(groupDf)
            if (marketDataEoYJson) {
                const fechasCorte = marketDataEoYJson.map(item => item.fechaCorte);
                const primasDeRetencionDevengadas = marketDataEoYJson.map(item => item.primasDeRetencionDevengadas_sum/(1e6));
                const costoNetoSiniestralidad = marketDataEoYJson.map(item => item.costoNetoSiniestralidad_sum/(1e6));
                const ingresosOperativos = marketDataEoYJson.map(item => item.ingresosOperativos/(1e6));
                const indiceSiniestralidad = marketDataEoYJson.map(item => item.indiceSiniestralidad);
                const margenUtilidadOperativa = marketDataEoYJson.map(item => item.margenUtilidadOperativa*(1e2));
                //
                const marketChart1DivElement = document.getElementById('allMarketChart1')
                if (marketChart1DivElement) {
                    //
                    const df1 = new dfd.DataFrame({'Fecha': fechasCorte,
                                                   'Prima de Rentencion Devengadas': primasDeRetencionDevengadas,
                                                   'Costo Siniestralidad': costoNetoSiniestralidad})
                    //
                    df1.setIndex({ column: 'Fecha', inplace: true });
                    //
                    const layout = {title: {text: 'Prima vs Costo de Siniestralidad (Historico)', font: { size: 18 }, x: 0.5, xanchor: 'center'},
                                    xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                    yaxis: {title: 'Millones de Pesos', gridcolor: '#f0f0f0', tickprefix: '$'},
                                    plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                    margin: { l: 80, r: 40, t: 100, b: 120 },
                                    legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                    hovermode: 'x unified', autosize: true};
                    //
                    const config = {columns: ['Prima de Rentencion Devengadas', 'Costo Siniestralidad'],
                                    displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                    responsive: true};
                    // Configuration options
                    df1.plot('allMarketChart1').line({ layout, config });
                }
                //
                const marketChart2DivElement = document.getElementById('allMarketChart2')
                if (marketChart2DivElement) {
                    const df2 = new dfd.DataFrame({'Fecha': fechasCorte,
                                                   'Indice de Siniestralidad': indiceSiniestralidad})
                    //
                    df2.setIndex({ column: 'Fecha', inplace: true });
                    //
                    const layout = {title: {text: 'Indice de Siniestralidad (Historico)', font: { size: 18 }, x: 0.5, xanchor: 'center'},
                                    xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                    yaxis: {title: 'Indice de Siniestralidad', gridcolor: '#f0f0f0'},
                                    plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                    margin: { l: 80, r: 40, t: 100, b: 120 },
                                    legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                    hovermode: 'x unified', autosize: true};
                    //
                    const config = {columns: ['Indice de Siniestralidad'],
                                    displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                    color: '#000000', responsive: true};
                    // 
                   df2.plot('allMarketChart2').line({ layout, config });
                }
                //
                const marketChart3DivElement = document.getElementById('allMarketChart3')
                if (marketChart3DivElement) {
                    const df3 = new dfd.DataFrame({'Fecha': fechasCorte,
                                                   'Ingresos Operativos': ingresosOperativos})
                    //
                    df3.setIndex({ column: 'Fecha', inplace: true });
                    //
                    const layout = {title: {text: 'Ingresos Operativos (Historico)', font: { size: 18 }, x: 0.5, xanchor: 'center'},
                                    xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                    yaxis: {title: 'Ingresos Operativos (Millones MXN)', gridcolor: '#f0f0f0'},
                                    plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                    margin: { l: 80, r: 40, t: 100, b: 120 },
                                    legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                    hovermode: 'x unified', autosize: true};
                    //
                    const config = {columns: ['Ingresos Operativos'],
                                    displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                    color: '#000000', responsive: true};
                    // 
                   df3.plot('allMarketChart3').line({ layout, config });
                }
                //
                const marketChart4DivElement = document.getElementById('allMarketChart4')
                if (marketChart4DivElement) {
                    const df4 = new dfd.DataFrame({'Fecha': fechasCorte,
                                                   'Margen de Utilidad Operativa': margenUtilidadOperativa})
                    //
                    df4.setIndex({ column: 'Fecha', inplace: true });
                    //
                    const layout = {title: {text: 'Margen de Utilidad Operativa (Historico)', font: { size: 18 }, x: 0.5, xanchor: 'center'},
                                    xaxis: {title: 'Fecha', tickangle: -45, gridcolor: '#f0f0f0', automargin: true, tickfont: { size: 10 }},
                                    yaxis: {title: 'Margen de Utilidad Operativa', gridcolor: '#f0f0f0'},
                                    plot_bgcolor: '#f9f9f9', paper_bgcolor: '#ffffff', height: 500,
                                    margin: { l: 80, r: 40, t: 100, b: 120 },
                                    legend: {x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h'},
                                    hovermode: 'x unified', autosize: true};
                    //
                    const config = {columns: ['Margen de Utilidad Operativa'],
                                    displayModeBar: true, modeBarButtonsToAdd: ['toggleHover'], displaylogo: false,
                                    color: '#000000', responsive: true};
                    // 
                   df4.plot('allMarketChart4').line({ layout, config });
                }
            }
        }
        return true;        
    } catch(error) {
        return false;
    }
}

// DROPDOWN MENU FUNCIONALITIES //

const dropdownTrigger = document.getElementById('companiesDropDownMenuTrigger');
const dropdownTriggerButton = document.getElementById('companiesDropDownMenuTriggerButton')
const dropdownMenuSelectedOption = dropdownTriggerButton.querySelector('span:first-child');
const dropdownMenu = document.getElementById('companyDropDownMenu');


dropdownTrigger.addEventListener('click', () => {
    if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
    } else {
        dropdownMenu.style.display = 'block';
        
        // Position the dropdown menu below the trigger button
        const rect = dropdownTrigger.getBoundingClientRect();
        dropdownMenu.style.top = `${rect.bottom + window.scrollY}px`;
        dropdownMenu.style.left = `${rect.left + window.scrollX}px`;
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !dropdownTrigger.contains(e.target)) {
        dropdownMenu.style.display = 'none';
    }
});


async function addOptionsToDropDownMenu(catNombresCortosArray) {
    const dropDownMenuElement = document.getElementById('companyDropDownMenu');
    
    // Clear existing options first to avoid duplicates
    dropDownMenuElement.innerHTML = '';
    
    catNombresCortosArray.forEach((item, index) => {
        //console.log(item.nombreCorto, item.nombreCortoId);
        const newLink = document.createElement('a');
        newLink.href = '#';
        newLink.textContent = item.nombreCorto.toUpperCase();
        newLink.setAttribute('data-id', item.nombreCortoId);
        newLink.classList.add('dropdown-item');
        // Mouse events
        newLink.addEventListener('mouseenter', function() {this.style.backgroundColor = '#f0f0f0';});
        newLink.addEventListener('mouseleave', function() {this.style.backgroundColor = '#ffffff';});
        // Better approach than inline onclick
        newLink.addEventListener('click', function(event) {
            event.preventDefault();
            updateSessionData(item.nombreCortoId);
            dropdownMenuSelectedOption.textContent = item.nombreCorto.toUpperCase();
            dropdownMenu.style.display = 'none';
        });
        dropDownMenuElement.appendChild(newLink);
    });
}

// DATA MODEL MANAGEMENT //

async function loadModelData() {
    try {
        // state management - Sets default company to GNP id = 45
        if (sessionStorage.getItem('selectedNombreCortoId') === null) {
            console.log('setting default value: 41')
            sessionStorage.setItem('selectedNombreCortoId', 41);
        }
        if (!catNombresCortos) {
            await loadCatNombresCortosJson();
        }
        if (catNombresCortos) {
            const tmpCatNombresCortos = JSON.stringify(catNombresCortos);
            const catNombresCortosArray = JSON.parse(tmpCatNombresCortos)
            addOptionsToDropDownMenu(catNombresCortosArray)
            if (catNombresCortosArray) {
                sessionStorage.setItem('catNombresCortos', JSON.stringify(catNombresCortosArray))
            }
        }
        if (!balancesJson) {
            await loadBalancesJson();
        }
        if (balancesJson) {
            //
            const tmpBalancesJson = JSON.stringify(balancesJson);
            const balancesArray = JSON.parse(tmpBalancesJson)
            if (balancesArray) {
                sessionStorage.setItem('balancesArray', JSON.stringify(balancesArray));
            }
            balancesArray.forEach(entry => {
                entry.fechaCorte = new Date(entry.fechaCorte);
                entry.month = entry.fechaCorte.getMonth()+1;
                entry.year = entry.fechaCorte.getFullYear();
            });
            const balancesArrayEoY = balancesArray.filter(entry => {return entry.month === 12})
            if (balancesArrayEoY) {
                sessionStorage.setItem('balancesArrayEoY', JSON.stringify(balancesArrayEoY));
            }
        }
        return true;
    } catch(error) {
        return false;
    }
}


async function appInitiation() {
    const dataModelResult = await loadModelData()
    if (dataModelResult === true) {
        const tabsContainer = document.getElementById('tabsContainer');
        if (tabsContainer) {
            const tabsList = tabsContainer.querySelector('#tabLists');
            const tablistItems = tabsList.querySelectorAll('li');

            tablistItems.forEach((item, index) => {
                const itemId = item.id;
                const tabContainerId = `${itemId}Container`
                //console.log(index, itemId, tabContainerId)
                activeTabContainer = document.getElementById(tabContainerId)
                item.addEventListener('click', setTabAsActive);
                if (index == 0) {
                    item.classList.add('active');
                    item.style = 'background-color: #f0f0f0;'
                    if (activeTabContainer) {
                        activeTabContainer.style.display = 'block';
                    }
                } else {
                    item.classList.remove('active');
                    item.style = ' background-color: #ffffff;'
                    if (activeTabContainer) {
                        activeTabContainer.style.display = 'none';
                    }
                }
            });
        }
        //
        const marketUpdateResult = await updateMarketCharts()
        const companyUpdateResult = await updateCompanyCharts()
        //
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // init application
    appInitiation()
    //
});