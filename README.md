# go-acccession-numbers-wasm

## Example

### WASM (JavaScript)

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

_Note: As of this writing the `www/wasip/extract.wasm` binary has a different interface than that of the JavaScript `extract.wasm` binary. Specifically, the former loads and uses all the possible accession number definitions by default and it is not possible (yet) to pass a custom list of definitions to use._

For example:

```
$> wasmtime www/wasip/extract.wasm 'Hello world 2015.166.1155' | jq
[
  {
    "accession_number": "2015.166.1155",
    "organization": "https://americanart.si.edu/"
  },
  {
    "accession_number": "2015.166.1155",
    "organization": "https://americanhistory.si.edu/"
  },
  {
    "accession_number": "2015.166.1155",
    "organization": "https://artbma.org"
  },
  {
    "accession_number": "2015.166.1155",
    "organization": "https://www.artic.edu"
  },
  {
    "accession_number": "2015.166.1155",
    "organization": "https://new.artsmia.org"
  },
  {
    "accession_number": "world 2015",
    "organization": "https://www.britishmuseum.org"
  },
  {
    "accession_number": "2015.166.1155",
    "organization": "https://chrysler.org"
  },
  {
    "accession_number": "2015.166.",
    "organization": "https://www.clevelandart.org"
  },
  ... and so on
```

Or:

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

### Web Components

This package also provides a `extract-accession-numbers` Web Component that create an HTML `form` element for entering custom text and then uses the WASM binaries to extract accession numbers. For example, the following markup will create a form and code that will parse text and look for [accession numbers matching the definition defined by SFO Museum](https://github.com/sfomuseum/accession-numbers/blob/main/data/sfomuseum.org.json). 

```
<extract-accession-numbers data-organizations="https://sfomuseum.org/" />
```

Because you will almost certainly want to assign custom styles to the Web Component let me save you the trouble and show you how that's done [using an HTML `template` element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots):

```
<template id="extract-accession-numbers-styles">
  <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
  <style type="text/css">
   button { margin-top: 1rem; }
  </style>
</template>
<extract-accession-numbers data-organizations="https://sfomuseum.org/" />
```

For a complete example of how to use the `extract-accession-numbers` Web Component run the `cmd/server/main.go` program:

```
$> go run cmd/server/main.go
2024/01/05 14:01:30 Listening on http://localhost:8080
```

And the open `http://localhost:8080` in your web browser. You should see a web page like this:

![](docs/images/server.png)

## See also

* https://github.com/sfomuseum/accession-numbers
* https://github.com/sfomuseum/go-accession-numbers