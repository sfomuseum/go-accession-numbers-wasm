accessionumbers = (function(){

    var definitions = null;
    
    var self = {

	init: function(){

	    return new Promise((resolve, reject) => {
		// fetch definitions.wasm
		sfomuseum.wasm.fetch("/wasm/definitions.wasm").then(rsp => {
		    // fetch extract.wasm
		    sfomuseum.wasm.fetch("/wasm/extract.wasm").then(rsp => {
			// load and cache definitions
			accession_numbers_definitions().then(rsp => {
			    definitions = rsp;
			    resolve();
			});
		    });
		    
		}).catch(err => {
		    reject(err);
		});
	    });
	},

	extract: function(text){

	    if (definitions){

		return new Promise((resolve, reject) => {
	
		    accession_numbers_extract(text, definitions).then(rsp => {
			resolve(JSON.parse(rsp));
		    });
		    
		});
	    }

	    return new Promise((resolve, reject) => {
		
		self.init().then(rsp => {
		    
		    accession_numbers_extract(text, definitions).then(rsp => {
			resolve(JSON.parse(rsp));
		    });
		    
		}).catch(err => {
		    reject(err)
		});
	    });
	},
    };

    return self;
    
})();
