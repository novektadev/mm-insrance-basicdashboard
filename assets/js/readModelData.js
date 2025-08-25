// READS MODEL DATA //

let catNombresCortos = null;

async function loadCatNombresCortosJson() {
    const fileURL = 'https://raw.githubusercontent.com/novektadev/cnsfDatasets/main/openDashboard/catNombresCortos.json'
    try {
        const response = await fetch(fileURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const jsonObject = await response.json();
        catNombresCortos = jsonObject;
        return catNombresCortos;
    } catch (error) {
        return null;
    }
}

export {catNombresCortos, loadCatNombresCortosJson};

let balancesJson = null;

async function loadBalancesJson() {
    const fileURL = 'https://raw.githubusercontent.com/novektadev/cnsfDatasets/main/openDashboard/balances.json'
    try {
        const response = await fetch(fileURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const jsonObject = await response.json();
        balancesJson = jsonObject
        return balancesJson;
    } catch (error) {
        return null;
    }
}

export {balancesJson, loadBalancesJson};