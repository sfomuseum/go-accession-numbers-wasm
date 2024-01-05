window.addEventListener("load", function load(event){

    return;
    
    var definitions = [];
    var lookup = {};

    async function parse() {
	
	// var raw_el = document.getElementById("raw");

	var raw_el = this.shadowRoot.getElementById("raw");	
	var text = raw_el.value;

	if (text == ""){
	    return false;
	}

	var select = document.getElementById("definitions-select");
	
	var defs_uris = getSelectValues(select);
	var count_uris = defs_uris.length;

	if (count_uris == 0){
	    console.log("NO DEFS");
	    return false;
	}

	var defs = [];

	for (var i=0; i < count_uris; i++){

	    var uri = defs_uris[i];
	    var idx = lookup[uri];

	    var def = definitions[idx];

	    if (! def){
		console.log("NO DEF FOR ", uri, idx);
		return false;
	    }

	    defs.push(def);
	}

	var enc_defs = JSON.stringify(defs);
	
	var result_el = document.getElementById("result");
	result_el.style.display = "none";
	
	result_el.innerHTML = "";
	
	accession_numbers_extract(text, enc_defs).then(rsp => {
	    
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
    
    // https://github.com/sfomuseum/go-http-wasm
    // https://github.com/sfomuseum/go-http-wasm/blob/main/static/javascript/sfomuseum.wasm.js
    
    sfomuseum.wasm.fetch("/wasm/definitions.wasm").then(rsp => {
	
	sfomuseum.wasm.fetch("/wasm/extract.wasm").then(rsp => {

	    accession_numbers_definitions().then(rsp => {

		definitions = JSON.parse(rsp);
		var count_defs = definitions.length;

		var select = document.getElementById("definitions-select");
		
		for (var idx=0; idx < count_defs; idx++){
		    
		    var def = definitions[idx];
		    lookup[ def.organization_url ] = idx;
		    
		    var opt = document.createElement("option");
		    opt.setAttribute("value", def.organization_url);
		    opt.appendChild(document.createTextNode(def.organization_name));

		    select.appendChild(opt);
		}

		var btn = document.getElementById("button");

		btn.innerText = "Parse";
		btn.removeAttribute("disabled");
		
		btn.onclick = function(){
		    parse();
		    return false;
		};
		
	    });
	    
	});
	    
    }).catch(err => {
	console.log("Failed to initialize parse.wasm", err)
    });

    
    function getSelectValues(select) {
	
	var result = [];
	
	var options = select && select.options;
	var opt;
	
	for (var i=0, iLen=options.length; i<iLen; i++) {
	    opt = options[i];

	    if (opt.selected) {
		result.push(opt.value || opt.text);
	    }
	}
	return result;
    }
    
});

