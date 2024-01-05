# go-acccession-numbers-wasm

## Example

### Javascript

```
$> make wasm
GOOS=js GOARCH=wasm go build -mod vendor -ldflags="-s -w" -o www/wasm/extract.wasm cmd/extract/main.go
GOOS=js GOARCH=wasm go build -mod vendor -ldflags="-s -w" -o www/wasm/definitions.wasm cmd/definitions/main.go
```

```
function extract(text) {

    return new Promise((resolve, reject) => {
	
	sfomuseum.wasm.fetch("/wasm/definitions.wasm").then(rsp => {
	    
	    sfomuseum.wasm.fetch("/wasm/extract.wasm").then(rsp => {
		
		accession_numbers_definitions().then(defs => {
		    
		    accession_numbers_extract(text, defs).then(rsp => {

			resolve(JSON.parse(rsp));
		    });
		    
		});
	    });
	    
	}).catch(err => {
	    reject(err)
	});
	
    });

}
```

## See also