package main

import (
	"encoding/json"
	"fmt"
	"log"
	"syscall/js"

	"github.com/sfomuseum/go-accession-numbers"
	"github.com/sfomuseum/go-accession-numbers-wasm/static/data"
)

func ExtractFunc() js.Func {

	defs, defs_err := data.LoadDefinitions()
	
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {

		text := args[0].String()

		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {

			resolve := args[0]
			reject := args[1]

			if defs_err != nil {
				reject.Invoke(fmt.Printf("Failed to load definitions, %v\n", defs_err))
				return nil
			}
			
			matches, err := accessionnumbers.ExtractFromText(text, defs...)

			if err != nil {
				reject.Invoke(fmt.Printf("Failed to extract from text, %v\n", err))
				return nil
			}

			enc, err := json.Marshal(matches)

			if err != nil {
				reject.Invoke(fmt.Printf("Failed to marshal result, %v\n", err))
				return nil
			}

			resolve.Invoke(string(enc))
			return nil
		})

		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}

func main() {

	extract_func := ExtractFunc()
	defer extract_func.Release()

	js.Global().Set("extract_accession_numbers", extract_func)

	c := make(chan struct{}, 0)

	log.Println("WASM accession number extractor initialized")
	<-c
}
