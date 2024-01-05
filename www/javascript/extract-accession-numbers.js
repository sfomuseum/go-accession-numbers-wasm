class ExtractAccessionNumbersElement extends HTMLElement {

    constructor() {
	super();	
    }

    connectedCallback() {

	var _self = this;
	
	sfomuseum.wasm.fetch("/wasm/definitions.wasm").then(rsp => {
	    sfomuseum.wasm.fetch("/wasm/extract.wasm").then(rsp => {
		
		accession_numbers_definitions().then(rsp => {
		    
		    const defs = JSON.parse(rsp);

		    _self.definitions = defs;
		    _self.lookup = {};
		    _self.orgs = [];

		    // Build URI to (definitions) index table
		    
		    const count_defs = defs.length;

		    for (var idx=0; idx < count_defs; idx++){

			var org = defs[idx];
			var url = org.organization_url;
			_self.lookup[url] = idx;
		    }

		    // Check to see if we are limiting lookup to specific organization
		    
		    const str_orgs = _self.getAttribute("data-organizations");

		    if (str_orgs != ""){

			const orgs = str_orgs.split(" ");
			var count_orgs = orgs.length;

			for (var i=0; i < count_orgs; i++){
			    
			    var url = orgs[i];

			    if (! url in _self.lookup){
				console.log("Invalid organization URL", url);
				return false;
			    }

			    _self.orgs.push(url);
			}

		    }

		    // Labels

		    _self.label = "Enter the text you want to extract accession numbers from below:";

		    var custom_label = _self.getAttribute("data-label");
		    
		    if ((custom_label) && (custom_label != "")){
			_self.label = custom_label;
		    }

		    _self.draw();
		});
		
	    })
	}).catch(err => {
	    console.log("Failed to initialize extract accessions number element", err);
	});
    }

    draw() {

	const shadow = this.attachShadow({ mode: "open" });
	
	// https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots
	
	var styles = document.getElementById("extract-accession-numbers-styles");

	if (styles){
	    let styles_content = styles.content;
	    shadow.appendChild(styles_content.cloneNode(true));
	}

	const wrapper = document.createElement("div");
	wrapper.appendChild(this.form_el());
	wrapper.appendChild(this.results_el());	
	
	shadow.appendChild(wrapper);	
    }

    form_el() {

	const form = document.createElement("form");
	form.setAttribute("class", "form");
	
	form.appendChild(this.query_el());

	if (this.orgs.length == 0){
	    form.appendChild(this.select_el());
	}
	
	form.appendChild(this.button_el());
	
	return form;
    }
    
    query_el() {

	const label = document.createElement("label");
	label.setAttribute("for", "raw");
	label.appendChild(document.createTextNode(this.label));

	const textarea = document.createElement("textarea");
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

	const select = document.createElement("select");
	select.setAttribute("class", "form-select");
	select.setAttribute("id", "definitions-select");
	select.setAttribute("multiple", "multiple");

	const count_defs = this.definitions.length;
	
	for (var idx=0; idx < count_defs; idx++){
	    
	    var def = this.definitions[idx];
	    
	    var opt = document.createElement("option");
	    opt.setAttribute("value", def.organization_url);
	    opt.appendChild(document.createTextNode(def.organization_name));
	    
	    select.appendChild(opt);
	}
	
	const wrapper = document.createElement("div");
	wrapper.setAttribute("class", "form-group");

	wrapper.appendChild(select);
	return wrapper;
    }

    button_el() {

	const btn = document.createElement("button");
	btn.setAttribute("id", "button");
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

	const div = document.createElement("div");
	div.setAttribute("id", "result");
	return div;
    }

    async parse() {

	// Clear any previous feedback
	
	const result_el = this.shadowRoot.getElementById("result");
	result_el.style.display = "none";
	result_el.innerHTML = "";

	// Ensure there is text to parse
	
	const raw_el = this.shadowRoot.getElementById("raw");	
	const text = raw_el.value;

	if (text == ""){
	    result_el.innerText = "Missing text to extract accession numbers from";
	    result_el.style.display = "block";
	    return false;
	}

	// Derive definitions from organizations selected

	var org_uris = this.orgs;
	var count_uris = org_uris.length;
	
	if (count_uris == 0){
	    
	    const select = this.shadowRoot.getElementById("definitions-select");
	    
	    org_uris = this.get_select_values(select);
	    count_uris = org_uris.length;
	    
	    if (count_uris == 0){
		result_el.innerText = "Missing organization(s) to filter query by";
		result_el.style.display = "block";
		return false;
	    }
	}
	
	const defs = [];

	for (var i=0; i < count_uris; i++){

	    const uri = org_uris[i];
	    const idx = this.lookup[uri];

	    const def = this.definitions[idx];

	    if (! def){
		result_el.innerText = "Missing definition for '" + uri + "'";
		result_el.style.display = "block";
		return false;
	    }

	    defs.push(def);
	}

	const enc_defs = JSON.stringify(defs);

	// Extract accession numbers
	
	accession_numbers_extract(text, enc_defs).then(rsp => {
	    
	    try {
		var data = JSON.parse(rsp)
	    } catch(e){
		result_el.innerText = "Unable to parse your text: " + e;
		result_el.style.display = "block";
		return;
	    }
	    
	    const pre = document.createElement("pre");
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
	
	var values = [];

	if (select.options){

	    const count_opts = select.options.length;
	    
	    for (var i=0; i < count_opts; i++){
		
		const opt = select.options[i];
		
		if (opt.selected) {
		    values.push(opt.value || opt.text);
		}
	    }
	}
	
	return values;
    }    
}

customElements.define('extract-accession-numbers', ExtractAccessionNumbersElement);
