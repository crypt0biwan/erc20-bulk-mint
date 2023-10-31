const { ethereum } = window

let provider = false
let signer = false

let connectedUserAccount = null

let ticker = '1m'
let max = 21000
let amount = 1000
    
function setConnected(isConnected, userAddr) {
    connectedUserAccount = userAddr
    
    document.querySelector('#info-connect').innerHTML = `Connected to <strong>${userAddr}</strong>`
    document.querySelector('#btn-connect').style.display = isConnected ? 'none' : 'block'
}

const convertToHexa = (str = '') =>{
    const res = [];
    const { length: len } = str;
    for (let n = 0, l = len; n < l; n ++) {
       const hex = Number(str.charCodeAt(n)).toString(16);
       res.push(hex);
    };
    return res.join('');
}

const encode = txt => CryptoJS.SHA256(txt).toString(CryptoJS.enc.Hex)

const checkExisting = (data) => {
    let hashes = []

    Object.keys(data).forEach((key, i) => {
        let hash = data[key]
        hashes.push(hash)
    })

    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(hashes)
    }

    return fetch("https://api.ethscriptions.com/api/ethscriptions/exists_multi", requestOptions)
}

const getUnused = async (number_of_mints) => {
    let check_eths = []
    let numbers = []

    do {
        check_eths = []

        for(let i=0; i<number_of_mints*2; i++) {
            let number = Math.ceil(Math.random() * max)
            check_eths[number] = encode(`data:,{"p":"erc-20","op":"mint","tick":"${ticker}","id":"${number}","amt":"${amount}"}`)
        }

        let resp = await (await checkExisting(check_eths)).json()

        Object.keys(resp).forEach((key, i) => {
            let val = resp[key]
            let number = Object.keys(check_eths).filter(function(k) {
                return check_eths[k] == key;
            })[0]

            if(val === null && numbers.length < number_of_mints) {
                console.log(`Id "${number}" is FREE`)
                numbers.push(number)
            } else {
                console.log(`Mint with id "${number}" already exists`)
            }
        })
    } while (numbers.length < number_of_mints)

    return numbers
}

async function send_txs(number_of_mints) {
    let numbers = await getUnused(number_of_mints)

    console.log(numbers.join(','))

    for(let i=0; i<numbers.length; i++) {
        let number = numbers[i]
        let txt = `data:,{"p":"erc-20","op":"mint","tick":"${ticker}","id":"${number}","amt":"${amount}"}`
        let encoded = `0x${convertToHexa(txt)}`

        console.log(txt)
    
        const tx = {
            from: connectedUserAccount,
            to: connectedUserAccount,
            data: encoded
        }

        const signedTx = await signer.sendTransaction(tx)
        console.log('tx hash:', signedTx.hash)
    }
}

async function connectWallet() {
    console.log('connectWallet')
    
    await ethereum.request({
        method: 'eth_requestAccounts'
    });
    
    accts = await provider.listAccounts()
    
    let userAddr = accts[0]
    setConnected(true, userAddr);
}

if (ethereum) {
    provider = new ethers.providers.Web3Provider(ethereum);
    signer = provider.getSigner();
}

if (!provider) {
    console.error("Your browser is not web3 enabled.");
}

provider.listAccounts().then(accts => {
    if (accts && accts.length > 0) {
        let userAddr = accts[0]

        console.log("already connected; accts: " + userAddr);
        setConnected(true, userAddr);
    } else {
        console.log('Not connected')
        document.querySelector('#btn-connect').style.display = 'block'
    }
});

let html = ''
for(let i=1; i<=50; i++) {
    html += `<option value="${i}">${i}</option>`
}
document.getElementById('number_of_mints').innerHTML = html

document.querySelector('#btn-connect').addEventListener('click', connectWallet)

document.querySelector('#btn-mint').addEventListener('click', e => {
    e.preventDefault()

    ticker = document.getElementById('ticker').value
    amount = parseInt(document.getElementById('amount').value, 10)
    max = parseInt(document.getElementById('max').value, 10) / amount

    send_txs(parseInt(document.getElementById('number_of_mints').value, 10))
})


async function init() {

    let resp = await (await checkExisting(['{"p":"erc-20","op":"mint","tick":"1m","id":"14656","amt":"1000"}'])).json()
    
    // let resp = await (await checkExisting(txts)).json()

    Object.keys(resp).forEach((key, i) => {
        let val = key

        console.log('val: ' + JSON.stringify(val))
        console.log(val.length)

        if(val === null) {
            console.log(val)
        }
    })


    // console.log(resp)
}

// init()