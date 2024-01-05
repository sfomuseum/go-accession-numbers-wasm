# go-acccession-numbers-wasm

## Example

### Javascript (WASM)

```
$> make wasm
GOOS=js GOARCH=wasm go build -mod vendor -ldflags="-s -w" -o www/wasm/extract.wasm cmd/extract/main.go
GOOS=js GOARCH=wasm go build -mod vendor -ldflags="-s -w" -o www/wasm/definitions.wasm cmd/definitions/main.go
```

And then load those binaries in your code. [For example](www/javascript/accessionnumbers.js):

```
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
```

To use it you would do something like this:

```
accessionnumbers.extract("Text with accession number 2015.166.1155").then(rsp => { console.log(rsp); });
```

### WASI (p1)

```
$> make wasip
GOARCH=wasm GOOS=wasip1 go build -mod vendor -ldflags="-s -w" -o www/wasip/extract.wasm ./cmd/extract-wasi/main.go
GOARCH=wasm GOOS=wasip1 go build -mod vendor -ldflags="-s -w" -o www/wasip/definitions.wasm ./cmd/definitions-wasi/main.go
```

For example:

```
$> wasmtime www/wasip/definitions.wasm | jq .[].organization_name
"National Air and Space Museum"
"Smithsonian American Art Museum and Renwick Gallery"
"National Museum of American History"
"Baltimore Museum of Art"
"Art Institute of Chicago"
"Minneapolis Art Museum"
"British Museum"
"National Museum of China"
"Chrysler Museum of Art"
"Cleveland Museum of Art"
"Cooper Hewitt Smithsonian National Design Museum"
"Dallas Museum of Art"
"Denver Museum of Nature & Science"
"Getty Center"
"Ingenium"
"21st Century Museum of Contemporary Art, Kanazawa"
"Musée du Louvre"
"Milwaukee Art Museum"
"Musée National d'Art Moderne (Centre Pompidou)"
"Metropolitan Museum of Art"
"Museum of Fine Arts Boston"
"Museum of Modern Art"
"Musée d'Orsay"
"Vatican Museums"
"Museo del Prado"
"Museo Reina Sofía"
"National Museum of Anthropology"
"National Museum of Korea"
"National Gallery"
"National Gallery Singapore"
"Smithsonian National Museum of Natural History"
"National Gallery of Art"
"National Museum of African American History and Culture"
"Georgia O'Keeffe Museum"
"Rijksmuseum"
"State Russian Museum"
"Seattle Art Museum"
"San Francisco Museum of Modern Art"
"SFO Museum"
"Saint Louis Art Museum"
"National Gallery of Denmark"
"Tate Modern"
"Museum of New Zealand Te Papa Tongarewa"
"The Broad Museum"
"Victoria and Albert Museum"
"Virginia Museum of Fine Arts"
"Walker Art Center"
"Whitney Museum of American Art"
```

### WebComponents

```
<template id="extract-accession-numbers-styles">
  <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
  <style type="text/css">
   button { margin-top: 1rem; }
  </style>
</template>
<extract-accession-numbers data-organizations="https://sfomuseum.org/" />
```

For a complete example of how to use the `extract-accession-numbers` WebComponent run the `cmd/server/main.go` program:

```
$> go run cmd/server/main.go
2024/01/05 14:01:30 Listening on http://localhost:8080
```

And the open `http://localhost:8080` in your web browser. You should see a web page like this:

## See also

* https://github.com/sfomuseum/accession-numbers
* https://github.com/sfomuseum/go-accession-numbers