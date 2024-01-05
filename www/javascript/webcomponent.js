window.addEventListener("load", function load(event){

    var defintions = [];
    var lookup = {};
    
    var create_webcomponent = function(orgs) {

	var count_orgs = orgs.length;
	
	var labels = [];

	for (var i=0; i < count_orgs; i++){
	    var url = orgs[i];
	    var idx = lookup[url];
	    var def = definitions[idx];
	    labels.push(def.organization_name);
	}
	
	var str_orgs = orgs.join(" ");
	var str_labels = labels.join(", ");
	
	var wrapper = document.createElement("div");
	wrapper.setAttribute("class", "custom");
	
	var component = document.createElement("extract-accession-numbers");
	component.setAttribute("data-organizations", str_orgs);
	component.setAttribute("data-label", "Enter text below to extract accession numbers from " + str_labels + " below");	

	var label = document.createElement("h3");
	label.appendChild(document.createTextNode("Custom "));
	label.appendChild(document.createElement("code").appendChild(document.createTextNode("<extract-accession-numbers/>")));
	label.appendChild(document.createTextNode(" Web Component for " + str_labels));

	var pre = document.createElement("pre");

	var t = document.getElementById("extract-accession-numbers-styles");
	pre.appendChild(document.createTextNode(t.outerHTML));
	pre.appendChild(document.createTextNode("\n"));	
	pre.appendChild(document.createTextNode(component.outerHTML));
	
	wrapper.appendChild(label);
	wrapper.appendChild(pre);
	wrapper.appendChild(component);

	var custom = document.getElementById("custom");
	custom.prepend(wrapper);

	custom.style.display = "block";
    };

    var getSelectValues = function(select) {
	
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
    };

    var setup = function(rsp){

	definitions = JSON.parse(rsp);
	var count_defs = definitions.length;
	
	var select = document.getElementById("choose-orgs");
	
	for (var idx=0; idx < count_defs; idx++){
	    
	    var def = definitions[idx];
	    lookup[ def.organization_url ] = idx;
	    
	    var opt = document.createElement("option");
	    opt.setAttribute("value", def.organization_url);
	    opt.appendChild(document.createTextNode(def.organization_name));
	    
	    select.appendChild(opt);
	}
	
	var btn = document.getElementById("choose-orgs-button");
	
	btn.innerText = "Create";
	btn.removeAttribute("disabled");
	
	btn.onclick = function(){
	    
	    var orgs = getSelectValues(select);
	    var count_orgs = orgs.length;
	    
	    if (! count_orgs){
		alert("Please select one or more organizations");
		return false;
	    }
	    
	    create_webcomponent(orgs);
	    return false;
	};
    };
	
    sfomuseum.wasm.fetch("/wasm/definitions.wasm").then(rsp => {
	
	accession_numbers_definitions().then(rsp => {
	    setup(rsp);
	});
	    
    }).catch(err => {
	console.log("Failed to initialize parse.wasm", err)
    });

      
});

