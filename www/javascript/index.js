window.addEventListener("load", function load(event){

    // https://github.com/sfomuseum/go-http-wasm
    // https://github.com/sfomuseum/go-http-wasm/blob/main/static/javascript/sfomuseum.wasm.js
    
    sfomuseum.wasm.fetch("/wasm/extract.wasm").then(rsp => {
	document.getElementById("button").innerText = "Parse";
	document.getElementById("button").removeAttribute("disabled");
    }).catch(err => {
	console.log("Failed to initialize parse.wasm", err)
    });
    
});

async function parse() {
    
    var raw_el = document.getElementById("raw");
    var text = raw_el.value;

    var result_el = document.getElementById("result");
    result_el.style.display = "none";
    
    result_el.innerHTML = "";
    
    extract_accession_numbers(text).then(rsp => {
	
	try {
	    var data = JSON.parse(rsp)
	} catch(e){
	    result_el.innerText = "Unable to parse your text: " + e;
	    
	    result_el.style.display = "block";
	    return;
	}
	
	var pre = document.createElement("pre");
	pre.innerText = JSON.stringify(data, '', 2);
	
	result_el.appendChild(pre);
	result_el.style.display = "block";	    	    	
	
    }).catch(err => {
	result_el.innerText = "There was a problem parsing your data:" + err;
	result_el.style.display = "block";    	
    });
    
    return false;
}
    
