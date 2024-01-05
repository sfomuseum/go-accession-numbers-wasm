package main

import (
	"encoding/json"
	"flag"
	"fmt"

	"github.com/sfomuseum/go-accession-numbers-wasm/static/data"
)

func main() {

	flag.Parse()

	fmt.Println(definitions())
}

//export definitions
func definitions() string {

	defs, err := data.LoadDefinitions()

	if err != nil {
		return err.Error()
	} else {

		v, err := json.Marshal(defs)

		if err != nil {
			return err.Error()
		}

		return string(v)
	}

}
