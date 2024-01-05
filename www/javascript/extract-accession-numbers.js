class ExtractAccessionNumbersElement extends HTMLElement {

    constructor() {
	super();	
    }

    connectedCallback() {

	var _self = this;
	
	sfomuseum.wasm.fetch("/wasm/definitions.wasm").then(rsp => {
	    sfomuseum.wasm.fetch("/wasm/extract.wasm").then(rsp => {
		
		accession_numbers_definitions().then(rsp => {

		    var defs = JSON.parse(rsp);
		    
		    _self.definitions = defs;
		    _self.lookup = {};
		    
		    _self.draw();
		});
		
	    })
	}).catch(err => {
	    console.log("Failed to initialize extract accessions number element", err);
	});
    }

    draw() {
	
	const shadow = this.attachShadow({ mode: "open" });

	var wrapper = document.createElement("div");
	wrapper.appendChild(this.form_el());
	wrapper.appendChild(this.results_el());	

	shadow.appendChild(wrapper);	

    }

    form_el() {

	var form = document.createElement("form");
	form.setAttribute("class", "form");
	
	form.appendChild(this.query_el());
	form.appendChild(this.select_el());	
	form.appendChild(this.button_el());
	
	return form;
    }
    
    query_el() {

	var label = document.createElement("label");
	label.setAttribute("for", "raw");
	label.appendChild(document.createTextNode("Enter..."));

	var textarea = document.createElement("textarea");
	textarea.setAttribute("id", "raw");
	textarea.setAttribute("name", "raw");
	textarea.setAttribute("class", "form-control");

	var wrapper = document.createElement("div");
	wrapper.setAttribute("id", "query");
	wrapper.setAttribute("class", "form-group");
	
	wrapper.appendChild(label);
	wrapper.appendChild(textarea);
	
	return wrapper;
    }

    select_el() {

	var select = document.createElement("select");
	select.setAttribute("class", "form-select");
	select.setAttribute("id", "definitions-select");
	select.setAttribute("multiple", "multiple");

	var count_defs = this.definitions.length;
	
	for (var idx=0; idx < count_defs; idx++){
	    
	    var def = this.definitions[idx];
	    this.lookup[ def.organization_url ] = idx;
	    
	    var opt = document.createElement("option");
	    opt.setAttribute("value", def.organization_url);
	    opt.appendChild(document.createTextNode(def.organization_name));
	    
	    select.appendChild(opt);
	}
	
	var wrapper = document.createElement("div");
	wrapper.setAttribute("class", "form-group");

	wrapper.appendChild(select);
	return wrapper;
    }

    button_el() {

	var btn = document.createElement("button");
	btn.setAttribute("id", "button");
	// btn.setAttribute("disabled", "disabled");
	btn.setAttribute("type", "submit");
	btn.setAttribute("class", "btn btn-primary");

	btn.appendChild(document.createTextNode("Extract"));

	var _self = this;
	
	btn.onclick = function(){
	    _self.parse();
	    return false;
	};
	
	return btn;
    }

    results_el() {

	var div = document.createElement("div");
	div.setAttribute("id", "result");
	return div;
    }

    async parse() {

	var raw_el = this.shadowRoot.getElementById("raw");	
	var text = raw_el.value;

	if (text == ""){
	    return false;
	}

	var select = this.shadowRoot.getElementById("definitions-select");
	
	var defs_uris = this.get_select_values(select);
	var count_uris = defs_uris.length;

	if (count_uris == 0){
	    console.log("NO DEFS");
	    return false;
	}

	var defs = [];

	for (var i=0; i < count_uris; i++){

	    var uri = defs_uris[i];
	    var idx = this.lookup[uri];

	    var def = this.definitions[idx];

	    if (! def){
		console.log("NO DEF FOR ", uri, idx);
		return false;
	    }

	    defs.push(def);
	}

	var enc_defs = JSON.stringify(defs);
	
	var result_el = this.shadowRoot.getElementById("result");
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

    get_select_values(select) {
	
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
}

customElements.define('extract-accession-numbers', ExtractAccessionNumbersElement);
