package main

import (
	"encoding/json"
	"flag"
	"fmt"

	"github.com/sfomuseum/go-accession-numbers"
	"github.com/sfomuseum/go-accession-numbers-wasm/static/data"
)

func main() {

	flag.Parse()

	defs, _ := data.LoadDefinitions()

	for _, raw := range flag.Args() {
		fmt.Println(extract(raw, defs...))
	}
}

//export extract
func extract(text string, defs ...*accessionnumbers.Definition) string {

	matches, err := accessionnumbers.ExtractFromText(text, defs...)

	if err != nil {
		return err.Error()
	} else {

		v, err := json.Marshal(matches)

		if err != nil {
			return err.Error()
		}

		return string(v)
	}

}
